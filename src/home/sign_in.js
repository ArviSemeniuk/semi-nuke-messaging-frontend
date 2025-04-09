import { useState } from "react";


function Sign_in_page({ socket, serverMessage })
{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fields, setFields] = useState({});
    const [errors, setErrors] = useState({});

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
                formErrors["username"] = "Usernames are at least 4 characetrs long!";
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
                formErrors["password"] = "Passwords are at least 8 characetrs long!";
            }
        }

        setErrors(formErrors);
        return formIsValid;
    }

    const handleChange = (field, value) => {
        setFields({
          ...fields,
          [field]: value
        })
      }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (handleValidation()) {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const message = JSON.stringify({
                    type: "si",
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
        <div>
            <h1>Sign-In</h1>

            <input type="text" placeholder="Username..." onChange={(e) => handleChange("username", e.target.value) + setUsername(e.target.value)} value={fields["username"]} />
            <br /> 
            <p1 className="error">{errors["username"]}</p1>
            <br />
            <input type="password" placeholder="Password..." onChange={(e) => handleChange("password", e.target.value) + setPassword(e.target.value)} value={fields["password"]} />
            <br />
            <span className="error">{errors["password"]}</span>
            <br />        

            {serverMessage && (
                <div className="serverMsg">
                {serverMessage}
                </div>
            )}
            <br />
            <button id="submit" value="Submit"> Sign-In </button>
        </div>
        </form>
    );
}


export default Sign_in_page;