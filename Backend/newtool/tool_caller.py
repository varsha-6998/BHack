import google.generativeai as genai
import json
import os
from tools import TOOLS
from dotenv import load_dotenv

# Load API key from environment
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API with the key
genai.configure(api_key=API_KEY)

def call_tool(tool_name, user_data):
    """Dynamically calls the appropriate tool based on intent."""
    if tool_name in TOOLS:
        return TOOLS[tool_name](user_data)
    return {"error": "Invalid tool"}

def analyze_intent_and_call_tool(user_input):
    """Uses Gemini to determine intent and call the correct tool."""
    model = genai.GenerativeModel("gemini-1.0-pro")
    response = model.generate_content(user_input)

    # Extract intent from Gemini's response
    intent = response.text.lower()

    # Simple intent detection
    if "eligibility" in intent:
        return call_tool("check_loan_eligibility", {"user_input": user_input})
    if "apply" in intent or "application" in intent:
        return call_tool("guide_loan_application", {"user_input": user_input})

    return {"message": "No clear intent detected"}

if __name__ == "__main__":
    user_input = input("Enter your request: ")
    print(analyze_intent_and_call_tool(user_input))
