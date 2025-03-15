# nlp/model.py
import random

def get_intent(user_message):
    intents = {
        "loan_eligibility": ["Can I get a loan?", "Am I eligible for a loan?"],
        "emi_calculation": ["How much will my EMI be?", "Calculate my EMI"],
    }

    for intent, examples in intents.items():
        if user_message.lower() in examples:
            return {"intent": intent, "confidence": random.uniform(0.8, 1.0)}

    return {"intent": "unknown", "confidence": 0.5}
