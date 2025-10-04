const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // make sure to install: npm install node-fetch

// Route to render chat page
router.get("/get", (req, res) => {
  res.render("chat");
});

// Route to handle search queries
router.get("/search", async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) {
      return res.json({ message: "Please enter a search term." });
    }

    /* ---------------- Wikipedia API ---------------- */
    const wikiParams = new URLSearchParams({
      action: "query",
      format: "json",
      prop: "extracts|info|pageimages",
      pithumbsize: 300,
      exintro: "true",
      explaintext: "true",
      redirects: "1",
      titles: query,
      inprop: "url",
    });

    const wikiResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?${wikiParams.toString()}`,
      { headers: { "User-Agent": "ViomaSearch/1.0" } }
    );

    const wikiData = await wikiResponse.json();
    const pages = wikiData?.query?.pages || {};
    const wikiPage = Object.values(pages)[0];
    let wikiResult = null;

    if (wikiPage && wikiPage.pageid !== -1) {
      wikiResult = {
        title: wikiPage.title,
        snippet: wikiPage.extract || "No summary available.",
        url:
          wikiPage.fullurl ||
          `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiPage.title)}`,
        imageUrl: wikiPage.thumbnail ? wikiPage.thumbnail.source : null,
        source: "Wikipedia",
      };
    }

    /* ---------------- NASA API ---------------- */
    const nasaUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
      query
    )}&media_type=image,video`;

    const nasaResponse = await fetch(nasaUrl);
    const nasaData = await nasaResponse.json();
    const nasaResults =
      nasaData?.collection?.items?.slice(0, 10).map((item) => {
        const dataFields = item.data[0] || {};
        const linksFields = item.links || [];
        const thumbnail = linksFields.find(l => l.render === "image");

        return {
          title: dataFields.title || "Untitled Asset",
          snippet: dataFields.description || "No detailed description available.",
          url: thumbnail ? thumbnail.href : "#",
          imageUrl: thumbnail ? thumbnail.href : null,
          source: "NASA",
        };
      }) || [];

    /* ---------------- Combine Results ---------------- */
    const results = [];
    if (wikiResult) results.push(wikiResult);
    results.push(...nasaResults);

    if (!results.length) {
      return res.json({ message: `No results found for '${query}'.` });
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ message: "Error fetching results" });
  }
});

module.exports = router;
