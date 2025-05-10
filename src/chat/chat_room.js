import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WebSocketContext } from "../websocket/WSContext";
import { useParams } from 'react-router-dom';

import Header from '../chat/header.js'


function Chat_room()
{
    const {subscribe, unsubscribe, sendMessage, getWS} = useContext(WebSocketContext);
    const navigate = useNavigate();
    const [message, setChatMessage] = useState("");
    const [messages, setMessages] = useState([]); // <-- list of all messages
    const [error, setError] = useState("");
    const username = localStorage.getItem("username");
    const sessionToken = localStorage.getItem("sessionToken");
    const { roomID } = useParams(); 


    useEffect(() => {
        // make sure roomID is an int
        if (isNaN(roomID)) {
            navigate('/'); // or show a 404 error page
            return;
        }

        subscribe("ACCESS_DENIED", () => {
            navigate("/chat");
        });

        subscribe("CHECK_TOKEN_RESULT", (serverPayload) => {
            if (serverPayload.res === false) {
                localStorage.removeItem("sessionToken");
                localStorage.removeItem("username");
                localStorage.setItem("isLoggedIn", "false");
                navigate("/signin");
            }
        });

        subscribe("load", (loadMessage) => {
            setMessages(loadMessage.messages)
        });
        
        subscribe("chat", (chat) => {
            setMessages(prev => [...prev, {
                username: chat.username,
                message: chat.message
            }]);
        });

        // Cleanup
        return () => {
            unsubscribe("ACCESS_DENIED");
            unsubscribe("CHECK_TOKEN_RESULT");
            unsubscribe("load");
            unsubscribe("chat");
        };
    }, [navigate, subscribe, unsubscribe, roomID]);

    
    useEffect(() => {
        const sessionToken = localStorage.getItem("sessionToken");

        // if sessionToken exists then send to server
        if (sessionToken) {
            sendMessage({ type: "CHECK_TOKEN", token: sessionToken })
            sendMessage({ type: "load", room: roomID, user: username })
        } 


    }, [sendMessage, roomID, username]);


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
            const socket = getWS();
            if (socket && socket.readyState === WebSocket.OPEN) {
                const dataToSend = JSON.stringify({
                    type: "chat",
                    username: username,
                    message: message,
                    room: roomID,
                });

                socket.send(dataToSend);
                socket.send(JSON.stringify({ type: "EXTEND_SESSION", token: sessionToken}));
                setChatMessage(""); // Clear after sending
            } else {
                console.log("WebSocket is not connected")
            }
        }
    }


    return (
        <>
        <Header />
        <div style={{textAlign: "center"}}>
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
        </>
    );
}


export default Chat_room;