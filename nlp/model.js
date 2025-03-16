const { MongoClient } = require('mongodb');
const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// MongoDB setup
const url = 'mongodb://localhost:27017/loan_chatbot'; // MongoDB URL (adjust if needed)
const dbName = 'varsha'; // Replace with your DB name
const collectionName = 'intents'; // Replace with the collection that holds the training data

// Global handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally, exit the process if necessary
    // process.exit(1); // Uncomment this if you want to force exit on unhandled promise rejection
});

// Function to fetch data from MongoDB
async function fetchDataFromMongoDB() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const data = await collection.find({}).toArray();
        return data;
    } catch (err) {
        console.error('Error fetching data from MongoDB:', err);
        throw err; // Ensure the error is thrown to be handled by the calling function
    } finally {
        await client.close();
    }
}

// Train the model
async function trainModel() {
    try {
        const data = await fetchDataFromMongoDB();
        if (data.length === 0) {
            throw new Error('No training data found in MongoDB');
        }

        data.forEach(intent => {
            intent.patterns.forEach(pattern => {
                classifier.addDocument(tokenizer.tokenize(pattern).join(" "), intent.tag);
            });
        });

        classifier.train();
        console.log('Model trained successfully');
    } catch (err) {
        console.error('Error during model training:', err);
    }
}

// Function to predict intent
function detectIntent(userInput) {
    return classifier.classify(tokenizer.tokenize(userInput).join(" "));
}

// Test the detection
trainModel().then(() => {
    console.log(detectIntent("Can I apply for a loan?")); // Expected Output: "loan_application"
}).catch(err => {
    console.error('Training failed:', err);
});

// Export the detectIntent function for server.js
module.exports = { detectIntent };
