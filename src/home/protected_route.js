import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';


function Protected_route({ children }) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/signin" replace state={{from:location}} />;
    }
    return children;
}


export default Protected_route;