import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import Aurora from './aurora';

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        forename: '',
        surname: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const BASE_URL = "http://localhost:5000/api";
        const endpoint = isLogin ? `${BASE_URL}/login` : `${BASE_URL}/register`;

        try {
            const response = await axios.post(endpoint, formData);
            if (response.status === 200 || response.status === 201) {
                const data = response.data;
                if (isLogin) {
                    alert("Login Successful!");
                    localStorage.setItem('token', data.token);
                    if (data.user && data.user.id) {
                        localStorage.setItem('userId', data.user.id);
                    }
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    navigate('/');
                } else {
                    alert("Profile Created Successfully!");
                    setIsLogin(true);
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "An error occurred. Please try again.";
            alert(errorMsg);
        }
    };

    return (
        <div className="login-page-wrapper">
            {/* Aurora Background stays fixed behind everything */}
            <div className="aurora-bg-container">
                <Aurora
                    colorStops={["#d32f2f", "#ffc107", "#d32f2f"]} // Updated to your Red/Yellow theme
                    blend={0.5}
                    amplitude={1.0}
                    speed={1}
                />
            </div>

            <div className="login-container">
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2 className="loginmsg1">{isLogin ? "Login" : "Register"}</h2>
                    <h3 className="loginmsg2">
                        {isLogin ? "Access your profile management" : "Create a profile to save your estimation"}
                    </h3>

                    <div className="input-group">
                        <label>Forename / Username</label>
                        <input
                            type="text"
                            name="forename"
                            placeholder="Enter username"
                            value={formData.forename}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <label>Surname</label>
                            <input
                                type="text"
                                name="surname"
                                placeholder="Enter surname"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        {isLogin ? "Login" : "Create Profile"}
                    </button>

                    <p className="toggle-text" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Need a user profile? Register here" : "Already have an account? Login"}
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;