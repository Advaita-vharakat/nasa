// routes/graph.routes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const Graph = require('../models/graph.model')

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.get("/", (req, res) => {
  res.render("graph");
})

function stripCodeBlock(text) {
  if (!text) return null;
  return text.replace(/```(json)?/g, '').trim();
}

// ---- Helper: Generate Graph JSON via Gemini ----
async function generateGraphData(description) {
  try {
    const prompt = `
Generate a JSON object compatible with Chart.js based on this description:
"${description}"

Output format MUST be:
{
  "type": "bar" | "line" | "pie",
  "labels": ["label1", "label2", ...],
  "datasets": [
    {
      "label": "Dataset name",
      "data": [number, number, ...],
      "backgroundColor": "rgba(r,g,b,0.7)"
    }
  ]
}
Return ONLY the JSON object.
    `;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    text = stripCodeBlock(text); // Remove ```json
    return JSON.parse(text);

  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return null;
  }
}



// ---- GET all graphs (with optional search) ----
router.get('/get', async (req, res) => {
  const search = req.query.search || '';
  try {
    const graphs = await Graph.find({
      title: { $regex: search, $options: 'i' } // case-insensitive search
    }).sort({ createdAt: -1 });

    res.json(graphs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching graphs');
  }
});

// ---- POST: Generate new graph ----
router.post('/new', async (req, res) => {
  const { description } = req.body;

  try {
    // 1️⃣ Generate graph JSON via Gemini
    let graphData = await generateGraphData(description);

    // 2️⃣ Fallback if Gemini fails
    if (!graphData) {
      const labels = ['A', 'B', 'C', 'D'];
      const dataValues = labels.map(() => Math.floor(Math.random() * 20) + 1);
      graphData = {
        labels,
        datasets: [{ label: description, data: dataValues, backgroundColor: 'rgba(59,130,246,0.7)' }],
        type: 'bar'
      };
    }

    // 3️⃣ Store in MongoDB
    const newGraph = new Graph({
      title: description,
      type: graphData.type,
      data: graphData
    });

    await newGraph.save();

    // 4️⃣ Return to frontend
    res.json(newGraph);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating graph');
  }
});

module.exports = router;
