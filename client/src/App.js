import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import Routes
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';


const App = () => {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
