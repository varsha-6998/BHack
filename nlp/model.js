const fs = require("fs");
const natural = require("natural");

const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Load training data
const rawData = fs.readFileSync("nlp/data.json");
const data = JSON.parse(rawData);

// Train model
data.intents.forEach(intent => {
    intent.patterns.forEach(pattern => {
        classifier.addDocument(tokenizer.tokenize(pattern).join(" "), intent.tag);
    });
});

classifier.train();

// Function to predict intent
function detectIntent(userInput) {
    return classifier.classify(tokenizer.tokenize(userInput).join(" "));
}

// Test
console.log(detectIntent("Can I apply for a loan?")); // Expected Output: "loan_application"

// Export function for server.js
module.exports = { detectIntent };
