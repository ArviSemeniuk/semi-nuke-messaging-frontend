import React from 'react';
import { useNavigate } from 'react-router-dom';


const Header = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem("username");

    const handleSignOut = () => {
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("username");
        localStorage.setItem("isLoggedIn", "false");
        navigate("/signin");
    }

    return (
        <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem", background: "#eee" }}>
            <span><strong>{username}</strong></span>
            <button onClick={handleSignOut}> Sign out </button>
        </header>
    )
}


export default Header;