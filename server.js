const express = require("express");
const cors = require("cors");
require("dotenv").config();

const DocumentIntelligence =
  require("@azure-rest/ai-document-intelligence").default;
const {
  getLongRunningPoller,
  isUnexpected,
} = require("@azure-rest/ai-document-intelligence");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;

app.post("/analyze", async (req, res) => {
  try {
    const { base64 } = req.body;

    if (!base64) {
      return res.status(400).json({ error: "No image provided" });
    }

    // 🔥 Convert base64 → Buffer
    const buffer = Buffer.from(base64, "base64");

    const client = DocumentIntelligence(endpoint, { key });

    // 🔥 THIS is the key change (NO urlSource)
    const initialResponse = await client
      .path("/documentModels/{modelId}:analyze", "prebuilt-invoice")
      .post({
        contentType: "application/octet-stream",
        body: buffer,
      });

    if (isUnexpected(initialResponse)) {
      throw initialResponse.body.error;
    }

    const poller = getLongRunningPoller(client, initialResponse);
    const analyzeResult = (await poller.pollUntilDone()).body.analyzeResult;

    res.json(analyzeResult);
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://10.0.0.154:3000");
});
