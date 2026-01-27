import React from 'react';
import { Navigate } from 'react-router-dom';

export const SignupPage: React.FC = () => {
    return <Navigate to="/login" replace state={{ step: 'signup' }} />;
};
