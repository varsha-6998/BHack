// Add this at the very top of your server.js file
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
    // Optionally, you can add logic to gracefully shut down the app or log it to a monitoring service
});

// Your existing server.js code follows...

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { getIntent } = require("../nlp/model"); // Import intent detection
const { toolCalling } = require("./tool_calling"); // Import tool calling
const { saveInteraction } = require("./db"); // Import MongoDB function
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/loan_chatbot")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// ✅ Define Schema & Model
const intentSchema = new mongoose.Schema({
    tag: String,
    patterns: [String]
});
const Intent = mongoose.model("Intent", intentSchema);

// ✅ Sarvam AI API Keys
const SARVAM_STT_API = "https://api.sarvam.ai/speech-to-text"; 
const SARVAM_TTS_API = "https://api.sarvam.ai/text-to-speech"; 
const SARVAM_TRANSLATE_API = "https://api.sarvam.ai/text-translate";
const SARVAM_STT_TRANSLATE_API = "https://api.sarvam.ai/speech-to-text-translate";
const SARVAM_SECURITY_KEY = process.env.SARVAM_SECURITY_KEY; 

// ✅ Function to predict intent from MongoDB
async function predictIntent(message) {
    const intent = await Intent.findOne({
        patterns: { $elemMatch: { $regex: new RegExp(message, "i") } }
    });
    return intent ? intent.tag : "unknown";
}

// ✅ Speech-to-Text + Translate (For Audio Inputs)
async function sarvamSTTTranslate(audioInput, targetLang) {
    const response = await fetch(SARVAM_STT_TRANSLATE_API, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${SARVAM_SECURITY_KEY}`,
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ audio: audioInput, target: "en" }) 
    });
    const data = await response.json();
    return data.translatedText;
}

// ✅ Text Translation (For Typed Messages)
async function sarvamTextTranslate(text, sourceLang, targetLang) {
    const response = await fetch(SARVAM_TRANSLATE_API, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${SARVAM_SECURITY_KEY}`,
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ text: text, source: sourceLang, target: targetLang })
    });
    const data = await response.json();
    return data.translatedText;
}

// ✅ Text-to-Speech (TTS) in User’s Language
async function sarvamTTS(textInput, lang) {
    const response = await fetch(SARVAM_TTS_API, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${SARVAM_SECURITY_KEY}`,
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ text: textInput, language: lang })
    });
    const data = await response.json();
    return data.audio;
}

// ✅ Main Chat Endpoint with Multilingual Support
app.post("/chat", async (req, res) => {
    try {
        const { message, audio, userLang } = req.body;  
        let userMessage = message;

        if (audio) {
            userMessage = await sarvamSTTTranslate(audio, userLang);
        } else {
            userMessage = await sarvamTextTranslate(userMessage, userLang, "en");
        }

        const intent = getIntent(userMessage);
        const responseText = toolCalling(intent, userMessage);
        const translatedResponse = await sarvamTextTranslate(responseText, "en", userLang);
        const audioResponse = await sarvamTTS(translatedResponse, userLang);

        await saveInteraction(userMessage, intent, responseText);

        res.json({ text_reply: translatedResponse, audio_reply: audioResponse });
    } catch (error) {
        console.error("❌ Error in /chat:", error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});

// ✅ Fetch Loan Options from MongoDB
app.get("/loan-options", async (req, res) => {
    try {
        const loanOptions = await Loan.find(); 
        res.json({ success: true, loans: loanOptions });
    } catch (error) {
        console.error("❌ Error fetching loan options:", error);
        res.status(500).json({ success: false, error: "Error retrieving loan options" });
    }
});

// ✅ EMI Calculator API
app.post("/emi-calculator", (req, res) => {
    try {
        const { principal, rate, tenure } = req.body;

        if (!principal || !rate || !tenure) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const monthlyRate = rate / (12 * 100);
        const months = tenure * 12;

        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                    (Math.pow(1 + monthlyRate, months) - 1);

        res.json({ success: true, emi: emi.toFixed(2) });
    } catch (error) {
        console.error("❌ Error calculating EMI:", error);
        res.status(500).json({ success: false, error: "Error calculating EMI" });
    }
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
