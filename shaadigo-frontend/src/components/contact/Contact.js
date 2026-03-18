import './Contact.css';
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa';

const Contact = () => {
    return (
        <div className="contact-container" id="contact">
            <div className="contact-card">
                <div classname="contanctheading">
                    <h1>Stay connected with us</h1>
                    <p>get all the updates you need</p>
                </div>

                <div className="details">
                    <div className="msg">
                        <strong>Call us:</strong>
                        <a href="tel:+923212433906">+92 321 2433906</a>
                    </div>

                    <div className="social-section">
                        <h3>Follow us on social media</h3>
                        <div className="social-icons">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                <FaTwitter className="social-icon" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <FaInstagram className="social-icon" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <FaLinkedin className="social-icon" />
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <FaGithub className="social-icon" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;