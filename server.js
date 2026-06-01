const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Odoo Proxy running ✓" });
});

app.post("/proxy", async (req, res) => {
  const { odooUrl, endpoint, payload, apiKey, login } = req.body;

  if (!odooUrl || !endpoint || !payload) {
    return res.status(400).json({ error: "Missing odooUrl, endpoint, or payload" });
  }

  try {
    const headers = { "Content-Type": "application/json" };

    if (apiKey) {
      const credentials = Buffer.from(`${login || "__api__"}:${apiKey}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    const response = await fetch(`${odooUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Odoo proxy listening on port ${PORT}`);
});
