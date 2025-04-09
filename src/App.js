import React from "react";
import { Routes, Route } from "react-router-dom";

import { useWebSocket } from "./websocket/use_websocket.js";

import HomePage from "./home/home.js";
import SignInPage from "./home/sign_in.js";
import SignUpPage from "./home/sign_up.js";
import ProtectedRoute from "./home/protected_route.js";
import ChatPage from "./chat/chat_room.js";

import './App.css';
import'./home/home.css';


function App() 
{
    const {socket, serverMessage, isLoggedIn} = useWebSocket("wss://192.168.0.207:36150")

    return (
        <div className="app-container">
        <Routes>
            <Route path="/" element={< HomePage />} />
            <Route path="/signin" element={< SignInPage socket={socket} serverMessage={serverMessage} />} />
            <Route path="/signup" element={< SignUpPage socket={socket} serverMessage={serverMessage} />} />
            <Route path="/chat" element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <ChatPage socket={socket} serverMessage={serverMessage} /> 
                </ProtectedRoute> } />
        </Routes>
        </div>
    );
}


export default App;