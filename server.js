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
  const { odooUrl, endpoint, payload } = req.body;

  if (!odooUrl || !endpoint || !payload) {
    return res.status(400).json({ error: "Missing odooUrl, endpoint, or payload" });
  }

  try {
    const response = await fetch(`${odooUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
