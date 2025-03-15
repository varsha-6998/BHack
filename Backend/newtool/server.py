from flask import Flask, request, jsonify
from tool_caller import analyze_intent_and_call_tool

app = Flask(__name__)

@app.route('/call_tool', methods=['POST'])
def call_tool_endpoint():
    data = request.json
    user_input = data.get("user_input", "")
    response = analyze_intent_and_call_tool(user_input)
    return jsonify(response)

if __name__ == '__main__':
    print("🔥 Flask server starting...")
    app.run(port=5001, debug=True)
