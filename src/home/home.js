// home page function which asks user to either sign-un or sign-up
function home_page({ socket }) {
  const handleSignIn = () => {
    //socket.send(message); // Send message via WebSocket to C++ backend
    socket.send("si");
  }

  const handleSignUp = () => {
    socket.send("su");
  }

  return (
    <div>
      <button onClick={handleSignIn}>Sign-In</button>
      <div class="divider"/>
      <button onClick={handleSignUp}>Sign-Up</button>
    </div>
  );
}

export default home_page;