const mongoose = require("mongoose");

// ✅ Define Schema for storing user interactions
const interactionSchema = new mongoose.Schema({
    userMessage: String,
    intent: String,
    botResponse: String,
    timestamp: { type: Date, default: Date.now }
});

// ✅ Create a Model
const Interaction = mongoose.model("Interaction", interactionSchema);

// ✅ Function to Save Interaction
async function saveInteraction(userMessage, intent, botResponse) {
    try {
        const interaction = new Interaction({ userMessage, intent, botResponse });
        await interaction.save();
        console.log("✅ Interaction saved to MongoDB");
    } catch (error) {
        console.error("❌ Error saving interaction:", error);
    }
}

// ✅ Connect to MongoDB (Modify the URL if needed)
mongoose.connect("mongodb://localhost:27017/loan_chatbot", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

module.exports = { saveInteraction };
