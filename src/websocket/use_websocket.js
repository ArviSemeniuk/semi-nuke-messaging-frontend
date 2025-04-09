import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";


export function useWebSocket(url) {
    const [socket, setSocket] = useState(null);
    const [serverMessage, setServerMessage] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem("isLoggedIn") === "true";
    });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            const serverMessage = event.data;

            if (serverMessage.includes("Signed-in!") || serverMessage === "1") {
                setIsLoggedIn(true);
                localStorage.setItem("isLoggedIn", "true");
                navigate("/chat");
            } 
            else {
                setServerMessage(serverMessage);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error: ', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            setIsLoggedIn(false);
            localStorage.setItem("isLoggedIn", "false");
        };

        setSocket(ws);

        return () => {
            ws.close();
        };

    }, [url]);

    useEffect(() => {
        setServerMessage([]);
    }, [location.pathname]);

    return { socket, serverMessage, isLoggedIn };
}