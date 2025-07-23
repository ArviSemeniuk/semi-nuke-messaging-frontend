import { useNavigate } from "react-router-dom";
import "../src/notFoundPage.css";

function Error_page()
{
    const navigate = useNavigate();


    const handleGoHome = () => {
        navigate('/chat');
    }


    return (
        <>
        
        <h1 style={{textAlign: "center"}}> 404: Page not found! </h1>

        <div className="back-home">
            <button onClick={() => handleGoHome()}>Go Back</button>
        </div>
        
        </>
    )
}


export default Error_page;