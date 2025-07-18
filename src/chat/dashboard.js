import { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { WebSocketContext } from "../websocket/WSContext";

import Header from '../chat/header.js';
import ChatRoom from '../chat/chat_room.js';
import '../home/home.css';
import '../chat/dashboard.css';


// Main hub of the site, allows creating new DM, accessing existing DMs
function Dashboard_page()
{
    const {subscribe, unsubscribe, sendMessage, getWS} = useContext(WebSocketContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false); // open serach box to find friends upon clicking Add Chat button
    const [group, setGroup] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // the search query a user types to look for friends
    const [searchResults, setResults] = useState([]); // search results based on if the query matches any usernames in database
    const sessionToken = localStorage.getItem("sessionToken");
    const [openChats, setOpenChats] = useState([]); // currently open chat rooms
    const [activeChatID, setActiveChatID] = useState(null);
    const [sortedRooms, setSortedRooms] = useState([]);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState({}); // number of unread messages
    const newMessageSound = useMemo(() => new Audio('/sounds/ding-36029.mp3'), []);


    // if sessionToken exists then send to server
    // get all rooms user is a member of
    useEffect(() => {
        if (sessionToken) {
            sendMessage({ type: "CHECK_TOKEN", token: sessionToken })
            sendMessage({ type: "GET_ROOMS" })
        }
    }, [sendMessage, sessionToken]);


    useEffect(() => {
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
            const rooms = loadRooms.rooms || [];
            // sort by latest message timestamp, rooms with no messages go to the bottom
            const sorted = [...rooms].sort((a, b) => {
                const dateA = a.lastMessage ? new Date(a.lastMessage) : null;
                const dateB = b.lastMessage ? new Date(b.lastMessage) : null;
                // if both have dates, compare normally
                if (dateA && dateB) {
                    return dateB - dateA;
                }
                // if only A has a date, A comes before B
                if (dateA && !dateB) {
                    return -1;
                }
                // if only B has a date, B comes before A
                if (!dateA && dateB) {
                    return 1;
                }
                // if neither have dates, keep order unchanged
                return 0;
            });

            setSortedRooms(sorted);
        })

        subscribe("UNREAD_MESSAGES", (message) => {
            setUnreadMessagesCount(message.unread);
        })

        subscribe("UPDATE_ROOMS", (roomMessage) => {
            sendMessage({ type: "GET_ROOMS" })

            if (!openChats.find(chat => chat.roomID === roomMessage.roomID)) {
                setOpenChats(prev => [...prev, { roomID: roomMessage.roomID, roomName: roomMessage.friend }]);
            }
            setActiveChatID(roomMessage.roomID);
        })

        // update unread message counter on new chat messages
        subscribe("NEW_CHAT", (chat) => {
            sendMessage({ type: "GET_ROOMS" })

            setSortedRooms(prevRooms => {
                const updatedSortedRooms = prevRooms.map(r => {
                    if (r.roomID === chat.roomID) {
                        return { ...r, lastMessage: chat.timestamp };
                    }
                    return r;
                });
                return [...updatedSortedRooms].sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage));
            });

            if (chat.roomID !== activeChatID) {
                // update counter
                setUnreadMessagesCount(prev => ({
                    ...prev,
                    [chat.roomID]: (prev[chat.roomID] || 0) + 1
                }));

                // play new message sound
                newMessageSound.currentTime = 0;
                newMessageSound.play().catch((err) => {
                    console.warn("Autoplay prevented:", err);
                });
            }
        });

        return () => {
            unsubscribe("CHECK_TOKEN_RESULT");
            unsubscribe("SEARCH_FRIENDS_RESULTS");
            unsubscribe("LOAD_ROOMS");
            unsubscribe("UPDATE_ROOMS");
        }
    }, [navigate, subscribe, unsubscribe, openChats, activeChatID, newMessageSound, sendMessage])


    // once user clicks + Add Chat button
    const handleClick = () => {
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


    const handleSelectUser = (username) => {
        if (group) {
            setSelectedUsers(prev =>
                prev.includes(username)
                ? prev.filter(user => user !== username)
                : [...prev, username]
            );
        } else {
            // single DM
            handleStartChat(username);
        }
    }


    const removeSelectedUser = (username) => {
        setSelectedUsers(prev => prev.filter(user => user !== username));
    };


    // create new chat room
    const handleStartChat = (username) => {
        const socket = getWS();

        if (socket && socket.readyState === WebSocket.OPEN) {
            const userList = group ? [...selectedUsers] : [username];

            const createChat = JSON.stringify({
                type: "CREATE_ROOM",
                with: userList,
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
        setSelectedUsers([]);
        setGroup(false);
    }


    // load chat room
    const handleClickChatRoom = (roomIdent, friendName) => {
        const socket = getWS();

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "EXTEND_SESSION", token: sessionToken }));
        }

        if (!openChats.find(chat => chat.roomID === roomIdent)) {
            setOpenChats(prev => [...prev, { roomID: roomIdent, roomName: friendName }]);
        }
        
        setActiveChatID(roomIdent); // always set the chat to active
    }


    // page layout
    return (
        <div className="background-container">
            <div className="background-overlay"></div>
            <div className="dashboard-content">
            <Header />

            {/* Add Chat button */}
            <div className="add-chat-content">
            <h1>Add New Chat</h1>
            <div className="button-12">
            <button onClick={() => handleClick()}>+ Add Chat</button>
            </div>

            {/* List of all users based on search query */}
            {isOpen && (
                <div className="add-chat-modal">

                    {/* Group DM checkbox */}
                    <input
                        className="group-checkbox"
                        type="checkbox"
                        id="group"
                        name="group"
                        checked={group}
                        onChange={(e) => {
                            const isChecked = e.target.checked;
                            setGroup(isChecked);
                            if (!isChecked) {
                                setSelectedUsers([]);
                            }
                        }}
                    />
                    <label className="group-checkbox-label" htmlFor="group">Create DM group</label>

                    {/* Text input to lookup a user */}
                    <input
                        className="friend-input-field"
                        type="text"
                        placeholder="Search for friends..."
                        value={searchTerm || ''}
                        onChange={(e) => {
                            handleAddChat(e);
                        }}
                    />

                    {group && selectedUsers.length > 0 && (
                        <div className="selected-users-list">
                            <p>Selected:</p>
                            <div className="selected-users-badges">
                                {selectedUsers.map((user, index) => (
                                    <span key={index} className="selected-user-badge">
                                        {user}
                                        <button onClick={() => removeSelectedUser(user)}>✕</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Create Group button */}
                    {group && selectedUsers.length >= 2 && (
                        
                        <div className="button-12">
                            <button  onClick={() => handleStartChat()}>
                                Create Group
                            </button>
                        </div>
                    )}

                    {/* List of users based on search query */}
                    <ul>
                        <div className="button-12-group">
                        {searchResults.map((username, index) => (
                            <li className="button-12" key={index}>
                                {group ? (
                                    <button
                                        disabled={selectedUsers.includes(username)}
                                        onClick={() => handleSelectUser(username)}
                                    >
                                        {username} {selectedUsers.includes(username) && "✓"}
                                    </button>
                                ) : (
                                    <button onClick={() => handleStartChat(username)}>{username}</button>
                                )}
                            </li>
                        ))}
                        </div>
                    </ul>

                </div>
            )}

            </div>

            {/* List of all DMs the user has created */}
            <div className="existing-chats-content">
                <h1>Direct Messages</h1>

                <div className="button-12-group">
                    {sortedRooms.map(room => (
                        <div className="button-12" key={room.roomID}>
                            <button onClick={() => handleClickChatRoom(room.roomID, room.roomName)}>

                                {room.roomName}

                                {unreadMessagesCount[room.roomID] > 0 && (
                                    <span className="badge1"> {unreadMessagesCount[room.roomID]} </span>
                                )}

                            </button>

                        </div>
                    ))}
                </div>
            </div>
            
            {/* dashboard-content div */}
            </div>

            {openChats
            .filter(chat => chat.roomID === activeChatID)
            .map(chat => (
                <ChatRoom
                    key={chat.roomID}
                    roomID={chat.roomID}
                    roomName={chat.roomName}
                    openChats={openChats}
                    activeChatID={activeChatID}
                    setActiveChatID={setActiveChatID}
                    setSortedRooms={setSortedRooms}
                    setUnreadMessagesCount={setUnreadMessagesCount}
                    unreadMessagesCount={unreadMessagesCount}

                    onClose={() => {
                        setOpenChats(prev => {
                            const updatedChats = prev.filter(c => c.roomID !== chat.roomID);

                            // Update activeChatID depending on remaining chats
                            if (chat.roomID === activeChatID) {
                                if (updatedChats.length > 0) {
                                    setActiveChatID(updatedChats[0].roomID);
                                } else {
                                    setActiveChatID(null);
                                }
                            }
                            return updatedChats;
                        });
                    }}
                />
            ))}
            
        {/* background-container div */}
        </div>
    )
}


export default Dashboard_page;