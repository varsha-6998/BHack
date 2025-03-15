# backend/tool_calling.py
from nlp.model import get_intent

def check_eligibility():
    return "You are eligible for a loan based on basic criteria."

def calculate_emi():
    return "Your estimated EMI is ₹10,000 per month."

def tool_calling(user_message):
    intent_data = get_intent(user_message)
    intent = intent_data["intent"]

    if intent == "loan_eligibility":
        return check_eligibility()
    elif intent == "emi_calculation":
        return calculate_emi()
    else:
        return "Sorry, I didn't understand that."
