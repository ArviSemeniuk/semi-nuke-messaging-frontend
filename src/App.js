import React from "react";
import { Routes, Route } from "react-router-dom";

import { WebSocketProvider } from "./websocket/WSContext.js";

import ErrorPage from "../src/notFoundPage.js"
import HomePage from "./home/home.js";
import SignInPage from "./home/sign_in.js";
import SignUpPage from "./home/sign_up.js";
import ProtectedRoute from "./home/protected_route.js";
import DashboardPage from "./chat/dashboard.js";
import ChatPage from "./chat/chat_room.js";

import './App.css';


function App() 
{
    return (
    <WebSocketProvider>
        <Routes>
            <Route path="*" element={<ErrorPage/>} />
            <Route path="/" element={<HomePage/>} />
            <Route path="/signin" element={<SignInPage/>} />
            <Route path="/signup" element={<SignUpPage/>} />
            <Route path="/chat" element={
                <ProtectedRoute>
                    <DashboardPage/> 
                </ProtectedRoute> } />
            <Route path="/chat/:roomID" element={
                <ProtectedRoute>
                    <ChatPage/>
                </ProtectedRoute> } /> 
        </Routes>
    </WebSocketProvider>
    );
}


export default App;