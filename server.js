const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.get("/interpret", async (req, res) => {

  const text = req.query.text;

  try{

    const response = await openai.chat.completions.create({
      model: "gpt-5-chat",
      messages: [
        {
          role: "system",
          content: `
Du är en expert på svenskt teckenspråk.
Översätt meningar till teckenspråksordning.

Regler:
- Ta bort småord (ska, vill, är)
- Subjekt först (jag, du)
- Verb efter
- Frågeord sist (vad, hur, var)
- Max 5 ord
- Svara ENDAST med ord separerade med mellanslag
`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const result = response.choices[0].message.content;

    res.json({
      input: text,
      output: result
    });

  } catch(e){
    res.json({ error: "AI fel" });
  }
});
app.use(cors());

app.get("/video", async (req, res) => {

  const word = req.query.word;

  try{

    const search = await axios.get(
      "https://teckensprakslexikon.su.se/sok?q=" + word
    );

    const $ = cheerio.load(search.data);

    // ✅ hitta ALLA länkar
    let link = null;

    $("a").each((i, el) => {

      const href = $(el).attr("href");

      // 🔥 försök hitta relevanta sidor
      if (href && (
          href.includes("/tecken/") ||
          href.includes("/ord") ||
          href.includes("/artikel")
      )) {
        link = href;
        return false; // stoppa loop
      }

    });

    if(!link){
      return res.json({ error: "ingen träff (inga länkar)" });
    }

    const fullUrl = "https://teckensprakslexikon.su.se" + link;

    // ✅ öppna sida
    const page = await axios.get(fullUrl);
    const $$ = cheerio.load(page.data);

    // ✅ hitta video
    let video = $$("video source").attr("src");

    // fallback om annan struktur
    if(!video){
      video = $$("video").attr("src");
    }

    if(!video){
      return res.json({ error: "ingen video hittad" });
    }

    const finalVideo = video.startsWith("http")
      ? video
      : "https://teckensprakslexikon.su.se" + video;

    res.json({
      word,
      page: fullUrl,
      video: finalVideo
    });

  } catch(e){
    res.json({ error: "serverfel", details: e.message });
  }

});

app.listen(3000, () => {
  console.log("Server kör lokalt på port 3000");
});
