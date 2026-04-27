import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/SignUpCard.css';

function SignUpCard() {
    const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        const endpoint = isLogin ? '/api/login' : '/api/signup';

        try {
            const response = await axios.post(`http://localhost:5001${endpoint}`, {
                username: formData.username,
                password: formData.password
            });

            if (isLogin) {
                // Save user info to localStorage
                localStorage.setItem('shaadigo_user', JSON.stringify({
                    user_id: response.data.user.user_id,
                    username: formData.username
                }));
                navigate('/venues');
            } else {
                setMessage({ text: response.data.message, type: 'success' });
            }

        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong';
            setMessage({ text: msg, type: 'error' });
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
                <div className="accent-line"></div>
                <p>{isLogin ? 'Login to your ShaadiGo account' : 'Join thousands planning their dream wedding'}</p>
            </div>

            {message.text && (
                <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrap">
                        <svg className="input-icon" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="5.5" r="2.5" stroke="#4D0D0D" strokeWidth="1.4"/>
                            <path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="#4D0D0D" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        <input
                            type="text"
                            id="username"
                            placeholder="e.g. ali_hassan"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrap">
                        <svg className="input-icon" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#4D0D0D" strokeWidth="1.4"/>
                            <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="#4D0D0D" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        <input
                            type="password"
                            id="password"
                            placeholder="Min. 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="8"
                        />
                    </div>
                </div>

                <button className="btn-signup" type="submit">
                    {isLogin ? 'Log In' : 'Sign Up'}
                </button>
            </form>

            <div className="or-row"><span>or</span></div>

            <p className="login-link">
                {isLogin ? (
                    <>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); setMessage({ text: '', type: '' }); }}>Sign up</a></>
                ) : (
                    <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); setMessage({ text: '', type: '' }); }}>Log in</a></>
                )}
            </p>
        </div>
    );
}

export default SignUpCard;