import React from "react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { WebSocketContext } from "../websocket/WSContext";

import '../home/home.css';


// home page function which asks user to either sign-un or sign-up
function Home_page() 
{
    const {subscribe, unsubscribe, sendMessage} = useContext(WebSocketContext);
    const navigate = useNavigate();

   
    useEffect(() => {
        const sessionToken = localStorage.getItem("sessionToken");

        // if sessionToken exists then send to server
        if (sessionToken) {
            sendMessage({ type: "CHECK_TOKEN", token: sessionToken })
        } 

        subscribe("CHECK_TOKEN_RESULT", (serverPayload) => {
            if (serverPayload.res === true) {
                navigate("/chat");
            } else {
                navigate("/");
            }
        });

        return () => {
            unsubscribe("CHECK_TOKEN_RESULT");
        }

    }, [sendMessage, navigate, subscribe, unsubscribe])


    const handleSignIn = () => {
        navigate("/signin")
    }


    const handleSignUp = () => {
        navigate("/signup")
    }


    return (
    <div className="background-container">
        <div className="background-overlay"></div>
        
        <div className="content">
        <h1>semi-nuke-messaging</h1>
        <h3>A messaging application created by Arvaidas Semeniuk</h3>
        
        <button className="button-73" onClick={handleSignIn}>Sign In</button>
        <div className="divider"/>
        <button className="button-73" onClick={handleSignUp}>Register</button>     
        </div>

    </div>
  );
}


export default Home_page;