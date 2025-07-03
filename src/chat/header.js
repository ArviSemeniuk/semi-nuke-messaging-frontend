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
        <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundcolor: "transparent" }}>

            <span style={{ fontSize: "20px"}}><strong>Hello {username}</strong></span>

            <button className="button-15" onClick={handleSignOut}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="3 -2 24 24" fill="white" style={{ height: '1.25rem', width: '1.25rem' }} className="size-6">
                    <path fillRule="evenodd" 
                    d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" 
                    clipRule="evenodd" />
                </svg>
                Sign out 
            </button>

        </header>
    )
}


export default Header;