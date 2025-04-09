import React from 'react';
import { Navigate } from 'react-router-dom';


function Protected_route({ isLoggedIn, children }) {
    if (!isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }
    return children;
}


export default Protected_route;