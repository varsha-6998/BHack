async function handleInput(event) {
    if (event.key === 'Enter') {
        const inputBox = document.getElementById('userInput');
        const userInput = inputBox.value.trim();
        inputBox.value = '';  // Clear input box

        if (!userInput) return; // Ignore empty input
        
        displayMessage(userInput, 'user');
        console.log("Sending user message:", userInput);

        // Send the message to the Flask backend
        const response = await fetch('http://127.0.0.1:5000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput })
        });

        const data = await response.json();
        console.log("Received data:", data);

        let botMessage = data.response || 'I didn’t understand that.';
        displayMessage(botMessage, 'bot');

        // If the bot asks for teaching, enable input mode for learning
        if (botMessage.includes("Can you teach me?")) {
            inputBox.placeholder = "Enter the correct answer...";

            // Enable the teaching input mode
            inputBox.onkeydown = async function(event) {
                if (event.key === 'Enter') {
                    const newAnswer = inputBox.value.trim();
                    inputBox.value = ''; // Clear input
                    inputBox.placeholder = "Ask me anything..."; // Reset placeholder

                    if (!newAnswer) return;

                    console.log(`Sending new answer: ${newAnswer}`);

                    // Send the teaching message to the backend
                    const teachResponse = await fetch('http://127.0.0.1:5000/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: userInput, answer: newAnswer })
                    });

                    const teachData = await teachResponse.json();
                    displayMessage(teachData.response, 'bot');

                    // After teaching is done, reset input mode
                    inputBox.onkeydown = handleInput; // Reset the original input handler
                }
            };
        }
    }
}

// Function to display messages in the chat window
function displayMessage(message, sender) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight; // Auto scroll
}