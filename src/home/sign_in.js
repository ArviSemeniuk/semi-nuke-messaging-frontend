import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { WebSocketContext } from "../websocket/WSContext";

import '../home/home.css';
import '../home/sign_in.css';


function Sign_in_page()
{
    const {subscribe, unsubscribe, sendMessage, getWS} = useContext(WebSocketContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fields, setFields] = useState({});
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerResponse] = useState("");
    
    
    useEffect(() => {
        const sessionToken = localStorage.getItem("sessionToken");

        // if sessionToken exists then send to server
        if (sessionToken) {
            sendMessage({ type: "CHECK_TOKEN", token: sessionToken })
        } 

        // subscribe to channel and register callback
        subscribe("CHECK_TOKEN_RESULT", (serverPayload) => {
            if (serverPayload.res === true) {
                navigate("/chat");
            } 
            else {
                navigate("/signin");
            }
        });

        subscribe("SIGN_IN_STATUS", (serverPayload) => {
            if (serverPayload.message === true) {
                localStorage.setItem("sessionToken", serverPayload.token);
                localStorage.setItem("isLoggedIn", "true");
                navigate('/chat');
            }
            else {
                setServerResponse(serverPayload.message);
            }
        });

        return () => {
            // unsubscribe from channel during cleanup
            unsubscribe("CHECK_TOKEN_RESULT");
            unsubscribe("SIGN_IN_STATUS");
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
                formErrors["username"] = "Usernames are at least 4 characters long!";
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
                formErrors["password"] = "Passwords are at least 8 characters long!";
            }
        }

        setErrors(formErrors);
        return formIsValid;
    }

    const handleChange = (e) => {
        setFields({
          ...fields,
          [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const socket = getWS();

        if (handleValidation()) {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                    type: "SIGN_IN",
                    username: username,
                    password: password,
                });

                socket.send(message);
                localStorage.setItem("username", username); // PROBABLY NOT A GOOD IDEA
            } else {
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
            <h1>Sign In</h1>

            <input className="input-field" type="text" name="username" placeholder="Username..." value={fields.username || ''}
                onChange={(e) => {
                    handleChange(e);
                    setUsername(e.target.value);
                }} />
            <br /> 
            <span className="error">{errors["username"]}</span>
            <br />

            <input className="input-field" type="password" name="password" placeholder="Password..." value={fields.password || ''}
                onChange={(e) => {
                handleChange(e);
                setPassword(e.target.value);
            }} />
            <br />
            <span className="error">{errors["password"]}</span>
                  

            {serverMessage && (
                <div className="serverMsg">
                {serverMessage}
                </div>
            )}
            <br />
            <button className="button-73" id="submit" value="Submit"> Sign In </button>
            </div>
            </div>

        </div>
        </form>
    );
}


export default Sign_in_page;