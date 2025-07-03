import { useNavigate } from "react-router-dom";


function Error_page()
{
    const navigate = useNavigate();


    const handleGoHome = () => {
        navigate('/chat');
    }


    return (
        <>
        
        <h1 style={{textAlign: "center"}}> 404: Page not found! </h1>

        <button style={{display: "flex", alignItems: "center", justifyContent: "center"}} onClick={() => handleGoHome()}>Go Back Home</button>
     
        </>
    )
}


export default Error_page;