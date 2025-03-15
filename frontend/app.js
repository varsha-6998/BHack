// frontend/src/App.js
import React, { useState } from "react";

function ChatBox() {
    const [chat, setChat] = useState([]);
    const [userInput, setUserInput] = useState("");

    const sendMessage = async () => {
        const response = await fetch("http://localhost:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput }),
        });

        const data = await response.json();
        setChat([...chat, { user: userInput, bot: data.reply }]);
        setUserInput("");
    };

    return (
        <div>
            <div>
                {chat.map((msg, index) => (
                    <p key={index}><b>You:</b> {msg.user} <br /><b>Bot:</b> {msg.bot}</p>
                ))}
            </div>
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask something..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default ChatBox;
