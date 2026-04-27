import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./style/login.module.css";

// ... (Keep all your SVG Icons exactly the same) ...

const IconMail = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>);
const IconLock = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const IconEye = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconEyeOff = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>);
const IconAlert = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);


// REMOVED the onSwitchToSignUp prop
export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setForm((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        },
        [errors]
    );

    const validate = () => {
        const newErrors = {};
        if (!form.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!form.password) {
            newErrors.password = "Password is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5001/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, password: form.password })
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ password: data.message || "Invalid credentials." });
                setLoading(false);
                return;
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/venues");

        } catch (err) {
            setErrors({ password: "Server error. Please ensure the backend is running." });
            setLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.badge}>
                <span className={styles.badgeDot} />
                <span className={styles.badgeText}>ShaadiGo Platform</span>
            </div>

            <h1 className={styles.heading}>
                Welcome
                <br />
                <span>back.</span>
            </h1>
            <p className={styles.subtext}>
                Sign in to manage your bookings and events.
            </p>

            <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerText}>Sign in with email</span>
                <span className={styles.dividerLine} />
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="login-email">
                        Email address
                    </label>
                    <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>
                            <IconMail />
                        </span>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="you@gmail.com"
                            value={form.email}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.email ? styles.hasError : ""}`}
                        />
                    </div>
                    {errors.email && (
                        <span className={styles.errorMsg}>
                            <IconAlert /> {errors.email}
                        </span>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="login-password">
                        Password
                    </label>
                    <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>
                            <IconLock />
                        </span>
                        <input
                            id="login-password"
                            type={showPass ? "text" : "password"}
                            name="password"
                            autoComplete="current-password"
                            placeholder="Your password"
                            value={form.password}
                            onChange={handleChange}
                            className={`${styles.input} ${styles.inputWithEye} ${errors.password ? styles.hasError : ""}`}
                        />
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPass((v) => !v)}
                            aria-label={showPass ? "Hide password" : "Show password"}
                        >
                            {showPass ? <IconEyeOff /> : <IconEye />}
                        </button>
                    </div>
                    {errors.password && (
                        <span className={styles.errorMsg}>
                            <IconAlert /> {errors.password}
                        </span>
                    )}
                </div>

                <div className={styles.forgotRow}>
                    <a href="#" className={styles.forgotLink}>
                        Forgot password?
                    </a>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    <span className={styles.btnInner}>
                        {loading && <span className={styles.spinner} />}
                        {loading ? "Signing in…" : "Sign In →"}
                    </span>
                </button>
            </form>

            <p className={styles.footer}>
                New to ShaadiGo?
                <button
                    type="button"
                    className={styles.switchBtn}
                    onClick={() => navigate('/signup')} // <-- CHANGED THIS LINE
                >
                    Create account
                </button>
            </p>

            {/* Stats bar removed for brevity, you can keep yours! */}
        </div>
    );
}