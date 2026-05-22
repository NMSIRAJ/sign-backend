const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/video", async (req, res) => {

  const word = req.query.word;

  try{
    // 🔎 1. sök
    const search = await axios.get(
      "https://teckensprakslexikon.su.se/sok?q=" + word
    );

    const $ = cheerio.load(search.data);

    // 🔗 2. hitta första teckenlänk
    const link = $("a[href*='/tecken/']").attr("href");

    if(!link) {
      return res.json({ error: "ingen träff" });
    }

    // 📄 3. öppna teckensidan
    const page = await axios.get(
      "https://teckensprakslexikon.su.se" + link
    );

    const $$ = cheerio.load(page.data);

    // 🎬 4. hitta video
    const video = $$("video source").attr("src");

    if(!video){
      return res.json({ error: "ingen video hittad" });
    }

    res.json({
      word: word,
      video: video.startsWith("http")
        ? video
        : "https://teckensprakslexikon.su.se" + video
    });

  } catch(e){
    res.json({ error: "serverfel" });
  }

});

app.listen(3000, () => {
  console.log("Server kör lokalt på port 3000");
});