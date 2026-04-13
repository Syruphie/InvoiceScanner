const express = require("express");
const cors = require("cors");
require("dotenv").config();

const DocumentIntelligence =
  require("@azure-rest/ai-document-intelligence").default;
const {
  getLongRunningPoller,
  isUnexpected,
} = require("@azure-rest/ai-document-intelligence");
const { BlobServiceClient, BlobSASPermissions } = require("@azure/storage-blob");
const { pool: sqlPool, sql } = require("./services/db");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "invoices";

async function uploadToBlob(buffer) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  const blobName = `invoice-${Date.now()}.jpg`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: "image/jpeg" },
  });

  // Generate a SAS URL valid for 1 year
  const expiresOn = new Date();
  expiresOn.setFullYear(expiresOn.getFullYear() + 1);

  const sasUrl = await blockBlobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse("r"),
    expiresOn,
  });

  console.log("Generated SAS URL:", sasUrl);
  return sasUrl;
}

app.post("/analyze", async (req, res) => {
  try {
    const { base64 } = req.body;

    if (!base64) {
      return res.status(400).json({ error: "No image provided" });
    }

    const buffer = Buffer.from(base64, "base64");

    // image uploaded to blob storage
    const blobUrl = await uploadToBlob(buffer);

    // doc intelligence analysis
    
    const client = DocumentIntelligence(endpoint, { key });

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

    const doc = analyzeResult?.documents?.[0];
    const f = doc?.fields || {};

    const vendor = f?.VendorName?.content || "Unknown Vendor";
    const invoiceNo = f?.InvoiceId?.content || "N/A";
    const date = f?.InvoiceDate?.content || "N/A";
    const dueDate = f?.DueDate?.content || "N/A";
    const subtotal = f?.SubTotal?.content || "N/A";
    const tax = f?.TotalTax?.content || "N/A";
    const total = f?.InvoiceTotal?.content || "N/A";
    const confidence = doc?.confidence ? Math.round(doc.confidence * 100) : 0;

    // save invoice to the database
    const pool = await sqlPool;
    await pool.request()
      .input("vendor", sql.NVarChar, vendor)
      .input("invoice_no", sql.NVarChar, invoiceNo)
      .input("date", sql.NVarChar, date)
      .input("due_date", sql.NVarChar, dueDate)
      .input("subtotal", sql.NVarChar, subtotal)
      .input("tax", sql.NVarChar, tax)
      .input("total", sql.NVarChar, total)
      .input("confidence", sql.Int, confidence)
      .input("blob_url", sql.NVarChar(sql.MAX), blobUrl)
      .query(`
        INSERT INTO invoices (vendor, invoice_no, date, due_date, subtotal, tax, total, confidence, blob_url)
        VALUES (@vendor, @invoice_no, @date, @due_date, @subtotal, @tax, @total, @confidence, @blob_url)
      `);

    res.json({ ...analyzeResult, blobUrl });
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.get("/invoices/:id/image", async (req, res) => {
  try {
    const pool = await sqlPool;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT blob_url FROM invoices WHERE id = @id");

    const blobUrl = result.recordset[0]?.blob_url;
    if (!blobUrl) return res.status(404).json({ error: "Not found" });

    const blobName = new URL(blobUrl).pathname.split("/").pop();

    const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 1);

    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse("r"),
      expiresOn,
    });

    console.log("Generated SAS URL on demand:", sasUrl);
    res.redirect(sasUrl);
  } catch (error) {
    console.error("Image fetch error:", error);
    res.status(500).json({ error: "Failed to get image" });
  }
});

app.get("/invoices", async (_req, res) => {
  try {
    const pool = await sqlPool;
    const result = await pool.request().query(`
      SELECT * FROM invoices ORDER BY scanned_at DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
