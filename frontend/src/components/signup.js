import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { validateSignUpForm, checkPasswordStrength } from "../utilities/signUpValidations";
import styles from "./style/signup.module.css";

const IconUser = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const IconMail = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>);
const IconLock = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const IconShield = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const IconEye = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconEyeOff = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>);
const IconAlert = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);
const IconBuilding = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>);

function StrengthMeter({ password }) {
    const { score, label, color, tips } = checkPasswordStrength(password);
    if (!password) return null;
    return (
        <div className={styles.strengthWrap}>
            <div className={styles.strengthBarRow}>
                {[1, 2, 3, 4].map((seg) => (
                    <div key={seg} className={`${styles.strengthSegment} ${seg <= score ? styles.filled : ""}`} style={{ "--strength-color": color }} />
                ))}
            </div>
            <div className={styles.strengthMeta}>
                <span className={styles.strengthLabel} style={{ "--strength-color": color }}>{label}</span>
                {tips.length > 0 && score < 4 && (<span className={styles.strengthTips}>Missing: {tips.slice(0, 2).join(", ")}</span>)}
            </div>
        </div>
    );
}

const DISPOSABLE_DOMAINS = ["mailinator.com", "10minutemail.com", "guerrillamail.com", "tempmail.com", "yopmail.com", "throwawaymail.com", "temp-mail.org", "nada.ltd"];

export default function SignUp() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });
    const [role, setRole] = useState("customer"); // ADDED STATE FOR ROLE
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleChange = useCallback(
        (e) => {
            const { name, value, type, checked } = e.target;
            const val = type === "checkbox" ? checked : value;
            setForm((prev) => ({ ...prev, [name]: val }));
            if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        },
        [errors]
    );

    const checkEmailLegitimacy = () => {
        const emailStr = form.email.trim().toLowerCase();
        if (!emailStr) return;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailStr)) {
            setErrors((prev) => ({ ...prev, email: "Please enter a valid email address structure." }));
            return;
        }
        const domain = emailStr.split("@")[1];
        if (DISPOSABLE_DOMAINS.includes(domain)) {
            setErrors((prev) => ({ ...prev, email: "Temporary or disposable emails are not allowed." }));
            return;
        }
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        checkEmailLegitimacy();
        if (errors.email) {
            document.getElementById("su-email")?.focus();
            return;
        }
        const { isValid, errors: validationErrors } = validateSignUpForm(form);
        if (!isValid) {
            setErrors((prev) => ({ ...prev, ...validationErrors }));
            const firstErrorKey = Object.keys(validationErrors)[0];
            document.getElementById(`su-${firstErrorKey}`)?.focus();
            return;
        }
        setLoading(true);
        const payload = {
            fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
            email: form.email.trim(),
            password: form.password,
            role: role // ADDED ROLE TO PAYLOAD
        };

        try {
            const response = await fetch("http://localhost:5001/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                setErrors({ email: data.message || data.details || "Registration failed. Please try again." });
                setLoading(false);
                return;
            }
            setLoading(false);
            setSuccess(true);

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setErrors({ terms: "Server error. Please ensure the backend is running." });
            setLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.badge}>
                <span className={styles.badgeDot} />
                <span className={styles.badgeText}>Join ShaadiGo</span>
            </div>

            <h1 className={styles.heading}>
                Start planning
                <br />
                <span>your big day.</span>
            </h1>
            <p className={styles.subtext}>
                Create your free account to book venues and manage your events.
            </p>

            {/* ROLE SELECTION TOGGLE */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: '#f5f5f5', padding: '4px', borderRadius: '8px' }}>
                <button
                    type="button"
                    onClick={() => setRole('customer')}
                    style={{
                        flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        background: role === 'customer' ? 'white' : 'transparent',
                        color: role === 'customer' ? 'var(--maroon)' : '#888',
                        boxShadow: role === 'customer' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    <IconUser /> I am a Customer
                </button>
                <button
                    type="button"
                    onClick={() => setRole('owner')}
                    style={{
                        flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        background: role === 'owner' ? 'white' : 'transparent',
                        color: role === 'owner' ? 'var(--maroon)' : '#888',
                        boxShadow: role === 'owner' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    <IconBuilding /> I am a Venue Owner
                </button>
            </div>

            {success && (
                <div className={styles.successToast}>
                    <div className={styles.successIcon}>✓</div>
                    <span className={styles.successText}>
                        Account created! Redirecting to login…
                    </span>
                </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="su-firstName">First Name</label>
                        <div className={styles.inputWrap}>
                            <span className={styles.inputIcon}><IconUser /></span>
                            <input id="su-firstName" type="text" name="firstName" autoComplete="given-name" placeholder="Alex" value={form.firstName} onChange={handleChange} className={`${styles.input} ${errors.firstName ? styles.hasError : ""}`} />
                        </div>
                        {errors.firstName && <span className={styles.errorMsg}><IconAlert /> {errors.firstName}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="su-lastName">Last Name</label>
                        <div className={styles.inputWrap}>
                            <span className={styles.inputIcon}><IconUser /></span>
                            <input id="su-lastName" type="text" name="lastName" autoComplete="family-name" placeholder="Morgan" value={form.lastName} onChange={handleChange} className={`${styles.input} ${errors.lastName ? styles.hasError : ""}`} />
                        </div>
                        {errors.lastName && <span className={styles.errorMsg}><IconAlert /> {errors.lastName}</span>}
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="su-email">Email Address</label>
                    <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}><IconMail /></span>
                        <input id="su-email" type="email" name="email" autoComplete="email" placeholder="you@gmail.com" value={form.email} onChange={handleChange} onBlur={checkEmailLegitimacy} className={`${styles.input} ${errors.email ? styles.hasError : ""}`} />
                    </div>
                    {errors.email && <span className={styles.errorMsg}><IconAlert /> {errors.email}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="su-password">Password</label>
                    <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}><IconLock /></span>
                        <input id="su-password" type={showPass ? "text" : "password"} name="password" autoComplete="new-password" placeholder="Create a strong password" value={form.password} onChange={handleChange} className={`${styles.input} ${styles.inputWithEye} ${errors.password ? styles.hasError : ""}`} />
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Hide password" : "Show password"}>{showPass ? <IconEyeOff /> : <IconEye />}</button>
                    </div>
                    <StrengthMeter password={form.password} />
                    {errors.password && <span className={styles.errorMsg}><IconAlert /> {errors.password}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="su-confirmPassword">Confirm Password</label>
                    <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}><IconShield /></span>
                        <input id="su-confirmPassword" type={showConfirm ? "text" : "password"} name="confirmPassword" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} className={`${styles.input} ${styles.inputWithEye} ${errors.confirmPassword ? styles.hasError : ""}`} />
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "Hide password" : "Show password"}>{showConfirm ? <IconEyeOff /> : <IconEye />}</button>
                    </div>
                    {errors.confirmPassword && <span className={styles.errorMsg}><IconAlert /> {errors.confirmPassword}</span>}
                </div>

                <div className={styles.termsRow}>
                    <label className={styles.termsLabel} htmlFor="su-terms">
                        <input id="su-terms" type="checkbox" name="terms" checked={form.terms} onChange={handleChange} className={`${styles.termsCheckbox} ${errors.terms ? styles.hasError : ""}`} />
                        <span className={styles.termsText}>
                            I agree to ShaadiGo's <a href="#" className={styles.termsLink} onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#" className={styles.termsLink} onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                        </span>
                    </label>
                    {errors.terms && <span className={styles.errorMsg}><IconAlert /> {errors.terms}</span>}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading || success}>
                    <span className={styles.btnInner}>
                        {loading && <span className={styles.spinner} />}
                        {loading ? "Creating account…" : success ? "Account Created ✓" : "Create My Account →"}
                    </span>
                </button>
            </form>

            <p className={styles.footer}>
                Already have an account?
                <button
                    type="button"
                    className={styles.switchBtn}
                    onClick={() => navigate('/login')}
                >
                    Sign in
                </button>
            </p>
        </div>
    );
}