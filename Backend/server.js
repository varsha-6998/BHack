// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    
    // Simulate AI response
    const response = toolCalling(userMessage);
    
    res.json({ reply: response });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
