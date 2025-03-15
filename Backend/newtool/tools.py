# tool_calling/tools.py

def check_loan_eligibility(user_data):
    """Check if the user is eligible for a loan."""
    return {"eligible": True, "max_amount": 50000}

def guide_loan_application(user_data):
    """Provide guidance on applying for a loan."""
    return {"message": "To apply, submit your ID and proof of income."}

# Dictionary of tools for dynamic calling
TOOLS = {
    "check_loan_eligibility": check_loan_eligibility,
    "guide_loan_application": guide_loan_application
}
