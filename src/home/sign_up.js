import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { WebSocketContext } from "../websocket/WSContext";


function Sign_up_page()
{
    const {subscribe, unsubscribe, sendMessage, getWS} = useContext(WebSocketContext);
    const socket = getWS();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fields, setFields] = useState({});
    const [errors, setErrors] = useState({});
    const [usernameStatus, setUsernameStatus] = useState({ message: '', color: '' });


    useEffect(() => {
        const sessionToken = localStorage.getItem("sessionToken");

        // if sessionToken exists then send to server
        if (sessionToken) {
            sendMessage({ type: "CHECK_TOKEN", token: sessionToken })
        } 

        subscribe("CHECK_TOKEN_RESULT", (serverPayload) => {
            if (serverPayload.res === true) {
                navigate("/chat");
            } 
            else {
                navigate("/signup");
            }
        });
        
        // checks if username is taken. Server will respond with a boolean true or false.
        subscribe("USERNAME_STATUS", (serverPayload) => {
            if (serverPayload.available) {
                setUsernameStatus({ message: "Username available ✅", color: "green" });
            } else {
                setUsernameStatus({ message: "Username already taken ❌", color: "red" });
            }
        });

        // once user presses the register button, a json payload will be sent to the server. Server will respond with true or false
        subscribe("REGISTER_STATUS", (serverPayload) => {
            if (serverPayload.message === true) {
                localStorage.setItem("sessionToken", serverPayload.token);
                localStorage.setItem("isLoggedIn", "true");
                navigate('/chat');
            }
        });

        return () => {
            // unsubscribe from channel during cleanup
            unsubscribe("CHECK_TOKEN_RESULT");
            unsubscribe("USERNAME_STATUS");
            unsubscribe("REGISTER_STATUS");
        }

    }, [sendMessage, navigate, subscribe, unsubscribe])


    const handleValidation = () => {
        const formFields = {...fields};
        const formErrors = {};
        let formIsValid = true;
        
        // Username validation
        if (!formFields["username"]) {
            formIsValid = false;
            formErrors["username"] = "Username cannot be empty!";
        }

        if (typeof formFields["username"] !== 'undefined') {
            if (formFields["username"].match(" ")) {
                formIsValid = false;
                formErrors["username"] = "Username cannot contain spaces!";
            }
        }   

        if (typeof formFields["username"] !== 'undefined') {
            if (formFields["username"].length < 4) {
                formIsValid = false;
                formErrors["username"] = "Username needs to be at least 4 characetrs long!";
            }
        }

        // Password validation
        if (!formFields["password"]) {
            formIsValid = false;
            formErrors["password"] = "Password cannot be empty!";
        }

        if (typeof formFields["password"] !== 'undefined') {
            if (formFields["password"].match(" ")) {
                formIsValid = false;
                formErrors["password"] = "Password cannot contain spaces!";
            }
        }

        if (typeof formFields["password"] !== 'undefined') {
            if (formFields["password"].length < 8) {
                formIsValid = false;
                formErrors["password"] = "Password needs to be at least 8 characetrs long!";
            }
        }

        setErrors(formErrors);
        return formIsValid;
    }


    const handleUsernameChange = (dynamicUsername) => {
        if (dynamicUsername.length > 3) {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const checkUsername = JSON.stringify({
                    type: "CHECK_USERNAME",
                    username: dynamicUsername,
                });

                socket.send(checkUsername);
            } else {
                console.log("WebSocket is not connected");
            }
        } else {
            setUsernameStatus('');
        }
    }


    const handleChange = (e) => {
        setFields({
            ...fields,
            [e.target.name]: e.target.value,
        })
    }


    const handleSubmit = (e) => {
        e.preventDefault();

        if (handleValidation()) {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                    type: "SIGN_UP",
                    username: username,
                    password: password,
                });

                socket.send(message);
                localStorage.setItem("username", username);
            } 
            else {
                console.log("WebSocket is not connected")
            }
        }
    };
    

    return (
        <form onSubmit = {e => handleSubmit(e)}>
        <div className="background-container">
        <div className="background-overlay"></div>

            <div className="content">
            <div className="sign-in-box">
            <h1> Register </h1>

            <input className="input-field" type="text" name="username" placeholder="New Username..." value={fields.username || ''}
            onChange={(e) => { 
                handleChange(e); 
                handleUsernameChange(e.target.value); 
                setUsername(e.target.value);
            }}/>
            <br/>

            {usernameStatus.message && (
                <div className="serverMsg" style={{color: usernameStatus.color}}>
                {usernameStatus.message}
                </div>
            )} 
            
            <span className="error">{errors["username"]}</span>
            <br/>
            <input className="input-field" type="password" name="password" placeholder="New Password..." value={fields.password || ''}
            onChange={(e) => {
                handleChange(e);
                setPassword(e.target.value);
            }}/>
            <br/>
            <span className="error">{errors["password"]}</span>
            <br/>
            <button className="button-73" id="submit" value="Submit"> Register </button>
            </div>
            </div>

        </div>
        </form>
    );
}


export default Sign_up_page;