import { useState, useEffect } from "react";


function Chat_room({ socket })
{
    const [message, setChatMessage] = useState("");
    const [messages, setMessages] = useState([]); // <-- list of all messages
    const [error, setError] = useState("");
    const username = localStorage.getItem("username");

    
    useEffect(() => {
        if (!socket) return;
    
        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
    
            if (data.type === "load") {
                setMessages(data.messages);
            } else if (data.type === "chat") {
                setMessages(prev => [...prev, {
                    username: data.username,
                    message: data.message
                }]);
            }
        };

        const handleOpen = () => {
            socket.send(JSON.stringify({ type: "load" }));
        };

        socket.addEventListener("message", handleMessage);
        socket.addEventListener("open", handleOpen);

        // 👉 ADD THIS check immediately after adding listeners
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "load" }));
        }

        // Cleanup when the component unmounts
        return () => {
            socket.removeEventListener("message", handleMessage);
            socket.removeEventListener("open", handleOpen);
        };
    }, [socket]);


    const handleValidation = () => {
        let validMessage = true;
        
        if (!message.trim()) {
            validMessage = false;
            setError("Can't send empty message!");
        }
        else {
            setError("");
        }
        return validMessage;
    }


    const handleSend = (e) => {
        e.preventDefault();

        if (handleValidation()) {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const dataToSend = JSON.stringify({
                    type: "chat",
                    username: username,
                    message: message,
                });

                socket.send(dataToSend);
                setChatMessage(""); // Clear after sending
            } 
            else{
                console.log("WebSocket is not connected")
            }
        }
    }


    return (
        <div>
            <h1> Chat Room </h1>

            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.username}</strong>: {msg.message}
                    </div>
                ))}
            </div>

            <input type="text" value={message} onChange={(e) => setChatMessage(e.target.value)} />
            <button onClick={handleSend}> Send </button>
            <br />
            <span className="error"> {error} </span>
        </div>
    );
}


export default Chat_room;