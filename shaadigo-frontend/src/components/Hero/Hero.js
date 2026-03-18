import React from 'react';
import './Hero.css';
import { Link } from 'react-router-dom';


import Contact from '../contact/Contact';
const Hero = () => {
    return (
        <>
            <section className="hero" id="hero">
                {/* Use the imported variable for the src */}


                <div className="hero-overlay"></div>

                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text-group">
                            <h1 className="hero-title">
                                Your one place <span>solar solution</span>
                            </h1>
                            <p className="hero-subtitle">
                                Explore the ultimate solar guidance for a sustainable future.
                            </p>
                        </div>

                        <div className="hero-actions">
                            <Link to="contact" className="btn btn-primary">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <div id="contact"><Contact /></div>
        </>
    );
};

export default Hero;