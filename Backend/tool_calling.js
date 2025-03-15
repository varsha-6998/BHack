// Import the get_intent function (assuming it's in the same directory)
const { getIntent } = require('../nlp/model');

// Function to check eligibility
function checkEligibility() {
    return "You are eligible for a loan based on basic criteria.";
}

// Function to calculate EMI
function calculateEMI() {
    return "Your estimated EMI is ₹10,000 per month.";
}

// Function to handle tool calling based on user message
function toolCalling(userMessage) {
    const intentData = getIntent(userMessage);
    const intent = intentData.intent;

    if (intent === "loan_eligibility") {
        return checkEligibility();
    } else if (intent === "emi_calculation") {
        return calculateEMI();
    } else {
        return "Sorry, I didn't understand that.";
    }
}

// Export the toolCalling function for use in other files
module.exports = { toolCalling };
