import React, {useState, useEffect} from "react";
import HomePage from "./home/home.js";
import './App.css';
import'./home/home.css';

function App() 
{
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Create a WebSocket connection when the component mounts
        const ws = new WebSocket('ws://192.168.0.207:36150');

        // Set WebSocket event listeners
        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            console.log('Received message:', event.data);
            setMessages((prevMessages) => [...prevMessages, event.data]);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Save the WebSocket instance in the state so we can send messages later
        setSocket(ws);

        // Clean up the WebSocket connection when the component unmounts
        return () => {
            ws.close();
        };
    }, []);
    
    // Send a message via WebSocket
    const sendMessage = (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        } else {
            console.error('WebSocket is not open');
        }
    };

    return (
        <><div className="app-container">
            <h1>semi-nuke-messaging</h1>
            <div>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
            {socket && <HomePage socket={socket} />}
        </div>
        </>
    );
}

export default App;