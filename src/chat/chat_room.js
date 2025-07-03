import { useContext, useState, useEffect, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { WebSocketContext } from "../websocket/WSContext";


// timestamp formatting
function formatTimestamp(timestamp) {
    const msgDate = new Date(timestamp);
    const now = new Date();

    const isToday =
        msgDate.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        msgDate.toDateString() === yesterday.toDateString();

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };

    const formattedTime = msgDate.toLocaleTimeString(undefined, timeOptions);

    if (isToday) {
        return formattedTime;
    } else if (isYesterday) {
        return `Yesterday, ${formattedTime}`;
    } else {
        const dateOptions = {
            month: 'short',
            day: 'numeric',
        };
        return `${msgDate.toLocaleDateString(undefined, dateOptions)}, ${formattedTime}`;
    }
}


function Chat_room({ roomID, onClose, roomName, openChats, setActiveChatID, setSortedRooms, setUnreadMessagesCount })
{
    const {subscribe, unsubscribe, sendMessage, getWS} = useContext(WebSocketContext);
    const navigate = useNavigate();
    const [message, setChatMessage] = useState("");
    const [messages, setMessages] = useState([]); // <-- list of all messages
    const [unreadStartIndex, setUnreadStartIndex] = useState(null); // <-- store index of first unread message
    const [error, setError] = useState("");
    const username = localStorage.getItem("username");
    const sessionToken = localStorage.getItem("sessionToken");
    const messagesEndRef = useRef(null);


    useEffect(() => {
        // if sessionToken exists then send to server
        if (sessionToken) {
            sendMessage({ type: "CHECK_TOKEN", token: sessionToken })
            sendMessage({ type: "GET_CHAT_CONTENT", room: roomID, user: username })
        }

    }, [sendMessage, roomID, username, sessionToken]);


    useEffect(() => {
        if (unreadStartIndex !== null) {
            const timeout = setTimeout(() => {
                const socket = getWS(); // Or however you access your WebSocket

                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({type: "MARK_AS_READ", roomID, readBy: username}));
                }

                // Clear the unread badge in Dashboard
                setUnreadMessagesCount(prev => ({
                    ...prev,
                    [roomID]: 0
                }));

            }, 500); // Delay so the UI has time to render

            return () => clearTimeout(timeout);
        }
    }, [unreadStartIndex, roomID, username, getWS, setUnreadMessagesCount]);


    useEffect(() => {
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

        subscribe("LOAD_CHAT_CONTENT", (loadMessage) => {
            setMessages(loadMessage.messages)

            // compute first unread message
            if (loadMessage.messages.length > 0 && unreadStartIndex === null) {
                const parsedMessages = loadMessage.messages.map(msg => ({
                    ...msg,
                    readBy: JSON.parse(msg.readBy || '[]')
                }));

                const index = parsedMessages.findIndex(msg => !msg.readBy.includes(username));
                setUnreadStartIndex(index !== -1 ? index : null);
            }
        });
        
        subscribe("NEW_CHAT", (chat) => {
            if (roomID === chat.roomID) {
                setMessages(prev => [...prev, {
                    username: chat.username,
                    message: chat.message,
                    timestamp: chat.timestamp
                }]);

                // mark message as read if chat window is already open when new chat arrives
                const socket = getWS();
                socket.send(JSON.stringify({ type: "MARK_AS_READ", roomID: roomID, readBy: username }));

                setSortedRooms(prevRooms => {
                    const updatedSortedRooms = prevRooms.map(r => {
                        if (r.roomID === chat.roomID) {
                            return { ...r, lastMessage: chat.timestamp };
                        }
                        return r;
                    });
                    return [...updatedSortedRooms].sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage));
                });
            }
        });

        // scroll to end of chat
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "instant" });
        }

        // Cleanup
        return () => {
            unsubscribe("ACCESS_DENIED");
            unsubscribe("CHECK_TOKEN_RESULT");
            unsubscribe("LOAD_CHAT_CONTENT");
            unsubscribe("NEW_CHAT");
        };
    }, [navigate, subscribe, unsubscribe, messages, roomID, getWS, username, setSortedRooms, unreadStartIndex]);


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
                    type: "NEW_CHAT_MESSAGE",
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
        <div className="chat-window">
            <div className="chat-header">
                <span>Chat with {roomName}</span>
                <button onClick={onClose}>X</button>
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <Fragment key={index}>
                        {index === unreadStartIndex && (
                            <div className="new-messages-divider">
                                <span >New Messages</span>
                                <hr className="divider-line" />
                            </div>
                        )}
                        <div className="chat-message" key={index}>

                            <div className="message-content">
                                <strong>{msg.username}</strong>: {msg.message} 
                            </div>

                            <div className="chat-timestamp">
                                {formatTimestamp(msg.timestamp)}
                            </div>

                        </div>
                    
                    </Fragment>
                ))}
                <div ref={messagesEndRef} />
            </div>
            

            <form onSubmit = {e => handleSend(e)}>
            <div className="chat-input">
                <input 
                    type="text" 
                    placeholder={`Message ${roomName}`}
                    value={message} 
                    onChange={(e) => setChatMessage(e.target.value)} 
                />
                <button type="submit"> Send </button>
            </div>
            </form>


            <span className="chat-error"> {error} </span>
            
            {openChats.length > 1 && (
            <div className="chat-tabs">
                {openChats.map(chat => (
                    <button
                        key={chat.roomID}
                        className={`chat-tab ${chat.roomID === roomID ? 'active' : ''}`}
                        onClick={() => setActiveChatID(chat.roomID)}
                    >
                        {chat.roomName}
                    </button>
                ))}
            </div>
            )}
        </div>
    );
}


export default Chat_room;