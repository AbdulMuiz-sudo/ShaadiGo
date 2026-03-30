import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import logo from './logo.png'; // Make sure your logo is in this folder
import Aurora from './aurora';
const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // This endpoint remains the same as in your original file.
        // It's up to your backend to handle 'forename' as 'email/phone'
        const BASE_URL = "http://localhost:5000/api";
        const endpoint = isLogin ? `${BASE_URL}/login` : `${BASE_URL}/register`;
        const payload = isLogin
            ? { email: formData.email, password: formData.password }
            : {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            };

        try {
            const response = await axios.post(endpoint, payload);

            if (response.status === 200 || response.status === 201) {
                const data = response.data;

                if (isLogin) {
                    alert("Login Successful!");
                    // 1. Store the token for auth checks
                    localStorage.setItem('token', data.token);
                    // 2. Store the ID specifically so the Calculator can find it
                    if (data.user && data.user.id) {
                        localStorage.setItem('userId', data.user.id);
                    }
                    // 3. Store the full object for display purposes (optional)
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

    // Toggle logic remains, but text changes to match the design
    const handleToggle = () => {
        setIsLogin(!isLogin);
        // Reset form data on toggle if desired
        setFormData({ fullName: '', email: '', phone: '', password: '' });
    };

    return (
        <div className="login-page-wrapper">
            {/* The Outer Container */}
            <div className="aurora-bg-container">
                <Aurora
                    colorStops={["#d32f2f", "#ffc107", "#d32f2f"]} // Updated to your Red/Yellow theme
                    blend={0.5}
                    amplitude={1.0}
                    speed={1}
                />
            </div>
            <div className="login-container">

                {/* Logo and Branding (Top Center) */}

                {/* The Login Card */}
                <form className="auth-card" onSubmit={handleSubmit}>
                    <div className="branding-section">
                        <img src={logo} alt="ShaadiGo Logo" className="login-logo-img" />
                        {/* The logo text is part of the image, we don't need separate text here */}
                    </div>

                    {/* Heading Section */}
                    <h2 className="loginmsg1">{isLogin ? "Welcome Back" : "Sign Up"}</h2>
                    <h3 className="loginmsg2">
                        {isLogin
                            ? "Please log in to your ShaadiGo account to continue."
                            : "Create a profile to start your journey."}
                    </h3>

                    {/* Form Fields Section */}
                    <div className="fields-section">
                        {!isLogin && (
                            <div className="input-group-premium">
                                <label className="premium-label">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}

                        <div className="input-group-premium">
                            <label className="premium-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="input-group-premium">
                                <label className="premium-label">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        {/* Password Input */}
                        <div className="input-group-premium">
                            <label className="premium-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Forgot Password Link (Only shows for Login) */}
                    {isLogin && (
                        <div className="forgot-password-link">
                            <a href="javascript:void(0)">Forgot Password?</a>
                        </div>
                    )}

                    {/* Submit Button (Pill shaped) */}
                    <button type="submit" className="submit-btn-premium">
                        {isLogin ? "LOG IN" : "CREATE ACCOUNT"}
                    </button>



                    {/* Bottom Toggle Text */}
                    <p className="toggle-text-premium" onClick={handleToggle}>
                        {isLogin ?
                            <>New to ShaadiGo? <span className="highlight-text">[Sign Up Now]</span></> :
                            <>Already have an account? <span className="highlight-text">[Login]</span></>
                        }
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
