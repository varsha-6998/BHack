const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // Import Mongoose

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/loan_assistant", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define Schema & Model
const intentSchema = new mongoose.Schema({
    tag: String,
    patterns: [String]
});
const Intent = mongoose.model("Intent", intentSchema);

// Function to predict intent from MongoDB
async function predictIntent(message) {
    const intent = await Intent.findOne({
        patterns: { $elemMatch: { $regex: new RegExp(message, "i") } }
    });

    return intent ? intent.tag : "unknown";
}


// API Endpoint
app.post("/predict_intent", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    const intent = await predictIntent(userMessage); // Fetch from MongoDB

    res.json({ intent });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
