const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// Predefined astronomy logos/images
const images = [
  { keyword: "stars", url: "https://placehold.co/64x64/1e3a8a/93c5fd?text=Stars" },
  { keyword: "planet", url: "https://placehold.co/64x64/1e3a8a/93c5fd?text=Planet" },
  { keyword: "galaxy", url: "https://placehold.co/64x64/1e3a8a/93c5fd?text=Galaxy" },
  { keyword: "space", url: "https://placehold.co/64x64/1e3a8a/93c5fd?text=Space" },
  { keyword: "neutron", url: "https://placehold.co/64x64/1e3a8a/93c5fd?text=Neutron" }
];


router.get("/fact", async (req, res) => {
  try {
    const randomSeed = Math.floor(Math.random() * 1000);
    const prompt = `Give me one unique astronomy fact in 1 short sentence. Variation #${randomSeed}.`;

    // Gemini API call for the fact
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const fact = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Space is mysterious and beautiful.";

    // Pick a relevant image randomly
    let matchedImages = images.filter(img => fact.toLowerCase().includes(img.keyword));
    if (matchedImages.length === 0) matchedImages = images; // fallback
    const randomImage = matchedImages[Math.floor(Math.random() * matchedImages.length)];

    res.json({ fact, image_url: randomImage.url });

  } catch (error) {
    console.error("Error generating fact:", error);
    res.status(500).json({ fact: "Error generating fact", image_url: "" });
  }
});

module.exports = router;
