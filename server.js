const cache = {};
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/video", async (req, res) => {

  const word = req.query.word;

  // ✅ 1. CACHE CHECK
  if(cache[word]){
    console.log("⚡ cache hit:", word);
// ✅ spara i cache
cache[word] = finalVideo;
``
    return res.json({
      word,
      video: cache[word],
      cached: true
    });
  }
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
