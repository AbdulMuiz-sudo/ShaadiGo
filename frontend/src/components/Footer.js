import React from 'react';



import './style/Footer.css';

function Footer() {
    return (
        <footer>
            <div className="footer-grid">
                <div className="footer-brand">
                    <span className="brand-foot">ShaadiGo</span>
                    <p>Pakistan's premier wedding venue platform. Making your dream celebration effortless, elegant, and unforgettable.</p>
                </div>

                <div className="footer-col">
                    <h4>Company</h4>
                    <a href="#">About Us</a>
                    <a href="#">How It Works</a>
                    <a href="#">Careers</a>
                    <a href="#">Press</a>
                </div>

                <div className="footer-col">
                    <h4>Support</h4>
                    <a href="#">Need Help?</a>
                    <a href="#">FAQ</a>
                    <a href="#">Contact Us</a>
                    <a href="#">Privacy Policy</a>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 ShaadiGo. All rights reserved.</p>
                <p>Made with ♥ for every celebration</p>
            </div>
        </footer>
    );
}

export default Footer;