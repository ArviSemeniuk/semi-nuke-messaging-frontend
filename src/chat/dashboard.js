import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { WebSocketContext } from "../websocket/WSContext";

import Header from '../chat/header.js'

// Page to add new chat room with other user/s or enter existing chat rooms
function Dashboard_page()
{
    const {subscribe, unsubscribe, sendMessage, getWS} = useContext(WebSocketContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [roomNamesRes, setRoomNames] = useState([]);
    const sessionToken = localStorage.getItem("sessionToken");
    const [error, setError] = useState("");


    useEffect(() => {
        // if sessionToken exists then send to server
        if (sessionToken) {
            sendMessage({ type: "CHECK_TOKEN", token: sessionToken })
            sendMessage({ type: "LOAD_ROOMS"})
        } 

        subscribe("CHECK_TOKEN_RESULT", (serverPayload) => {
            if (serverPayload.res === false) {
                localStorage.removeItem("sessionToken");
                localStorage.removeItem("username");
                localStorage.setItem("isLoggedIn", "false");
                navigate("/signin");
            } 
        });

        subscribe("SEARCH_FRIENDS_RESULTS", (message) => {
            setResults(message.usernames || []);
        })

        subscribe("LOAD_ROOMS", (loadRooms) => {
            setRoomNames(loadRooms.rooms || []);
        })

        subscribe("UPDATE_ROOMS", (roomMessage) => {
            if (roomMessage.room_exists === false) {
                setRoomNames(roomMessage.rooms || []);
            }
            else if (roomMessage.room_exists === true) {
                setError("Room already exists!");
            }
        })

        return () => {
            unsubscribe("CHECK_TOKEN_RESULT");
            unsubscribe("SEARCH_FRIENDS_RESULTS");
            unsubscribe("UPDATE_ROOMS");
            setError(null);
        }
    }, [sendMessage, navigate, subscribe, unsubscribe, sessionToken])

    // once user clicks + Add Chat button
    const handleClick = () => {
        setError(null);
        setIsOpen(true);

        const socket = getWS();
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "EXTEND_SESSION", token: sessionToken}));
        }
    }

    // search for users in database based on query
    const handleAddChat = (e) => {
        const socket = getWS();
        // search function
        const query = e.target.value;
        setSearchTerm(query);

        if (query.length > 3) {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const searchForFriends = JSON.stringify({
                    type: "SEARCH_FRIENDS",
                    query: query,
                })
                socket.send(searchForFriends);
                socket.send(JSON.stringify({ type: "EXTEND_SESSION", token: sessionToken}));
            } else {
                console.log("WebSocket is not connected");
            }
        } else {
            setResults([]);
        }
    }


    // create new chat
    const handleStartChat = (username) => {
        const socket = getWS();
        if (socket && socket.readyState === WebSocket.OPEN) {
            const createChat = JSON.stringify({
                type: "CREATE_ROOM",
                with: username,
            })
            socket.send(createChat);
            socket.send(JSON.stringify({ type: "EXTEND_SESSION", token: sessionToken}));
        } else {
            console.log("WebSocket is not connected");
        }

        // clean-up
        setIsOpen(false);
        setSearchTerm("");
        setResults([]);
    }


    // load new chat room page
    const handleClickChatRoom = (roomIdent) => {
        const socket = getWS();
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "EXTEND_SESSION", token: sessionToken}));
        }
        navigate(`/chat/${roomIdent}`);
    }


    // page layout
    return (
        <>
        <Header />

        <div>
            <button onClick={() => handleClick()}>+ Add Chat</button>
            <span className="error"> {error} </span>

            {isOpen && (
                <div className="add-chat-modal">
                    <input
                        type="text"
                        placeholder="Search for friends..."
                        value={searchTerm || ''}
                        onChange={(e) => {
                            handleAddChat(e);
                        }}
                    />
                    <ul>
                        {results.map((username, index) => (
                            <li key={index}>
                                <button onClick={() => handleStartChat(username)}>{username}</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <h1>Existing Chats</h1>
            {roomNamesRes.map((room, index) => (
                <div key={index}>
                    <button onClick={() => handleClickChatRoom(room.roomID)}> {room.roomName}</button>
                </div>
            ))}

        </div>
        </>
    )
}


export default Dashboard_page;