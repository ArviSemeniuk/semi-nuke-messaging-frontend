import React from "react";
import { useNavigate } from "react-router-dom";


// home page function which asks user to either sign-un or sign-up
function Home_page() 
{
    const navigate = useNavigate();

    const handleSignIn = () => {
      navigate("/signin")
    }

    const handleSignUp = () => {
      navigate("/signup")
    }

    return (
    <div>
      <h1>semi-nuke-messaging</h1>
      <button onClick={handleSignIn}>Sign-In</button>
      <div class="divider"/>
      <button onClick={handleSignUp}>Sign-Up</button>
    </div>
  );
}

export default Home_page;