import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from './config';
import axios from 'axios';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/login`, formData);
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userName', data.user.uname);

            navigate('/');
            window.location.reload();
        } catch (err) {
            console.error('Login error:', err);
            const msg = err.response?.data?.error || err.message || 'Incorrect email or password.';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.header}>
                <div style={styles.logo} onClick={() => navigate('/')}>NETFLOX</div>
            </div>

            <div style={styles.overlay} />

            <div style={styles.card}>
                <h1 style={styles.title}>Sign In</h1>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputContainer}>
                        <input
                            type="email"
                            placeholder="Email or phone number"
                            required
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputContainer}>
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div style={styles.helpRow}>
                        <label style={styles.remember}>
                            <input type="checkbox" defaultChecked style={styles.checkbox} />
                            <span style={{ fontSize: '13px' }}>Remember me</span>
                        </label>
                        <span style={styles.help}>Need help?</span>
                    </div>
                </form>

                <div style={styles.cardFooter}>
                    <p style={styles.signupText}>
                        New to Netflox? <Link to="/register" style={styles.link}>Sign up now.</Link>
                    </p>
                    <p style={styles.captchaText}>
                        This page is protected by Google reCAPTCHA to ensure you're not a bot. <span style={styles.learnMore}>Learn more.</span>
                    </p>
                </div>
            </div>

            <div style={styles.pageFooter}>
                <div style={styles.footerContent}>
                    <p style={styles.footerHeading}>Questions? Call 000-800-919-1694</p>
                    <div style={styles.footerLinks}>
                        <span>FAQ</span>
                        <span>Help Centre</span>
                        <span>Terms of Use</span>
                        <span>Privacy</span>
                        <span>Cookie Preferences</span>
                        <span>Corporate Information</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f669a357-9dc4-4061-8a4a-9e1201524259/89169fa1-067c-473d-9d48-8dfca896500d/IN-en-20221031-popsignuptwoweeks-perspective_alpha_website_medium.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '20px 50px',
        zIndex: 10,
    },
    logo: {
        color: '#e50914',
        fontSize: '45px',
        fontWeight: 'bold',
        fontFamily: "'Bebas Neue', cursive",
        cursor: 'pointer',
        letterSpacing: '2px',
    },
    overlay: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)',
    },
    card: {
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        padding: '60px 68px 40px',
        borderRadius: '4px',
        width: '100%',
        maxWidth: '450px',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        margin: '80px 0',
    },
    title: {
        color: '#fff',
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '28px',
        marginTop: 0
    },
    errorBox: {
        background: '#e87c03',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '4px',
        fontSize: '14px',
        marginBottom: '16px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    inputContainer: {
        width: '100%',
    },
    input: {
        width: '100%',
        padding: '16px 20px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#333',
        color: '#fff',
        fontSize: '16px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    button: {
        padding: '16px',
        backgroundColor: '#e50914',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '24px',
    },
    helpRow: {
        display: 'flex',
        justifyContent: 'space-between',
        color: '#b3b3b3',
        fontSize: '13px',
        marginTop: '10px'
    },
    remember: {
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
        cursor: 'pointer'
    },
    checkbox: {
        accentColor: '#737373',
    },
    help: {
        cursor: 'pointer',
        '&:hover': {
            textDecoration: 'underline'
        }
    },
    cardFooter: {
        marginTop: 'auto',
        paddingTop: '30px',
    },
    signupText: {
        color: '#737373',
        fontSize: '16px',
        marginBottom: '13px'
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
        marginLeft: '5px',
        '&:hover': {
            textDecoration: 'underline'
        }
    },
    captchaText: {
        color: '#8c8c8c',
        fontSize: '13px',
        lineHeight: '1.4',
    },
    learnMore: {
        color: '#0071eb',
        cursor: 'pointer',
    },
    pageFooter: {
        position: 'relative',
        zIndex: 1,
        width: '100%',
        background: 'rgba(0,0,0,0.75)',
        padding: '30px 0',
        marginTop: 'auto',
    },
    footerContent: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 4%',
        color: '#737373',
    },
    footerHeading: {
        fontSize: '16px',
        marginBottom: '30px',
    },
    footerLinks: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        fontSize: '13px',
    }
};
