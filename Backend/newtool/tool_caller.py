# tool_calling/tool_caller.py

import openai
import json
import os
from tools import TOOLS
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
openai.api_key = OPENAI_API_KEY

def call_tool(tool_name, user_data):
    """Dynamically calls the appropriate tool based on intent."""
    if tool_name in TOOLS:
        return TOOLS[tool_name](user_data)
    return {"error": "Invalid tool"}

def analyze_intent_and_call_tool(user_input):
    """Uses OpenAI to determine intent and call the correct tool."""
    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": user_input}],
        functions=[
            {
                "name": "check_loan_eligibility",
                "description": "Check if a user is eligible for a loan",
                "parameters": {"type": "object", "properties": {"user_data": {"type": "object"}}}
            },
            {
                "name": "guide_loan_application",
                "description": "Provide guidance for loan application",
                "parameters": {"type": "object", "properties": {"user_data": {"type": "object"}}}
            }
        ]
    )

    # Extract tool name and parameters
    if response["choices"][0]["message"].get("function_call"):
        tool_name = response["choices"][0]["message"]["function_call"]["name"]
        tool_params = json.loads(response["choices"][0]["message"]["function_call"]["arguments"])
        return call_tool(tool_name, tool_params["user_data"])

    return {"message": "No action needed"}

if __name__ == "__main__":
    user_input = input("Enter your request: ")
    print(analyze_intent_and_call_tool(user_input))
