const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

console.log("🔥 SERVER RUNNING:", __dirname);

// serve UI
app.use(express.static(path.join(__dirname, "public")));

// test route
app.get("/test", (req, res) => {
    res.send("TEST WORKS");
});

// 🔥 proxy route (ADD THIS)
app.get("/proxy", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send("No URL provided");
    }

    console.log("Proxy loading:", url);

    try {
        const response = await fetch(url);
        const contentType = response.headers.get("content-type") || "text/html";

        let text = await response.text();

        res.setHeader("Content-Type", contentType);
        res.send(text);

    } catch (err) {
        console.log("Proxy error:", err.message);
        res.status(500).send("Proxy error: " + err.message);
    }
});

app.listen(PORT, () => {
    console.log("Server running at http://localhost:3000");
});