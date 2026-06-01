const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Manual CORS - allow everything
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: "10mb" }));

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

    const text = await response.text();
    try {
      res.json(JSON.parse(text));
    } catch {
      res.status(500).json({ error: "Non-JSON response from Odoo", body: text.slice(0, 500) });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Odoo proxy listening on port ${PORT}`);
});
