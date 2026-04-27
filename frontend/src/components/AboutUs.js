import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../style/AboutUs.css';

function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="ab-page">
            <Header />
            <main className="ab-main">

                {/* Hero */}
                <div className="ab-hero">
                    <div className="ab-hero-tag">Est. 2020 · Pakistan's Premier Wedding Platform</div>
                    <h1 className="ab-hero-title">We Make Your Dream<br />Wedding a Reality</h1>
                    <p className="ab-hero-sub">
                        ShaadiGo connects couples across Pakistan with the finest wedding venues —
                        seamlessly, beautifully, and stress-free.
                    </p>
                    <button className="ab-hero-btn" onClick={() => navigate('/venues')}>
                        Browse Venues
                    </button>
                </div>

                <div className="ab-gold-divider"></div>

                {/* Stats */}
                <div className="ab-stats">
                    <div className="ab-stat-card">
                        <div className="ab-stat-num">100+</div>
                        <div className="ab-stat-label">Weddings Conducted</div>
                    </div>
                    <div className="ab-stat-card">
                        <div className="ab-stat-num">6</div>
                        <div className="ab-stat-label">Premium Venues</div>
                    </div>
                    <div className="ab-stat-card">
                        <div className="ab-stat-num">3</div>
                        <div className="ab-stat-label">Cities Covered</div>
                    </div>
                    <div className="ab-stat-card">
                        <div className="ab-stat-num">4.7★</div>
                        <div className="ab-stat-label">Average Rating</div>
                    </div>
                </div>

                {/* Who We Are */}
                <div className="ab-section">
                    <div className="ab-section-label">Who We Are</div>
                    <h2 className="ab-section-title">Pakistan's Most Trusted Wedding Venue Platform</h2>
                    <p className="ab-section-text">
                        ShaadiGo was founded with a single mission — to take the stress out of finding
                        and booking the perfect wedding venue. We understand that your wedding day is one
                        of the most important moments of your life, and every detail matters.
                    </p>
                    <p className="ab-section-text">
                        Our platform brings together Pakistan's most prestigious banquet halls, marquees,
                        and garden venues under one roof. From intimate gatherings to grand celebrations
                        of 1,200+ guests, we have the perfect space for every occasion.
                    </p>
                </div>

                {/* What We Offer */}
                <div className="ab-features">
                    <div className="ab-section-label" style={{textAlign:'center'}}>What We Offer</div>
                    <h2 className="ab-section-title" style={{textAlign:'center'}}>Everything You Need, In One Place</h2>
                    <div className="ab-features-grid">
                        <div className="ab-feature-card">
                            <div className="ab-feature-icon">🏛️</div>
                            <div className="ab-feature-title">Premium Venues</div>
                            <p className="ab-feature-text">
                                Handpicked wedding halls and marquees across Lahore, Karachi, and Islamabad —
                                each verified for quality, capacity, and service.
                            </p>
                        </div>
                        <div className="ab-feature-card">
                            <div className="ab-feature-icon">📅</div>
                            <div className="ab-feature-title">Real-Time Availability</div>
                            <p className="ab-feature-text">
                                Our live availability calendar shows you exactly which dates are open —
                                no back-and-forth calls, no surprises.
                            </p>
                        </div>
                        <div className="ab-feature-card">
                            <div className="ab-feature-icon">💬</div>
                            <div className="ab-feature-title">Direct Owner Chat</div>
                            <p className="ab-feature-text">
                                Communicate directly with venue owners to negotiate, ask questions,
                                and coordinate every detail of your event.
                            </p>
                        </div>
                        <div className="ab-feature-card">
                            <div className="ab-feature-icon">✅</div>
                            <div className="ab-feature-title">Instant Confirmation</div>
                            <p className="ab-feature-text">
                                Book your venue in minutes and receive instant confirmation —
                                your date is secured the moment you confirm.
                            </p>
                        </div>
                        <div className="ab-feature-card">
                            <div className="ab-feature-icon">📋</div>
                            <div className="ab-feature-title">Booking Dashboard</div>
                            <p className="ab-feature-text">
                                Manage all your bookings from a personalized dashboard —
                                track status, view details, and stay organized.
                            </p>
                        </div>
                        <div className="ab-feature-card">
                            <div className="ab-feature-icon">🔒</div>
                            <div className="ab-feature-title">Secure & Reliable</div>
                            <p className="ab-feature-text">
                                Your bookings and personal information are protected with
                                industry-standard security practices.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Our Story */}
                <div className="ab-section">
                    <div className="ab-section-label">Our Story</div>
                    <h2 className="ab-section-title">From a Simple Idea to 100+ Happy Couples</h2>
                    <p className="ab-section-text">
                        ShaadiGo started when our founders struggled to find a reliable wedding venue
                        for a family event. The process was exhausting — endless phone calls, conflicting
                        availability information, and no way to compare venues side by side.
                    </p>
                    <p className="ab-section-text">
                        We built ShaadiGo to solve exactly that problem. Since launching, we have helped
                        over 100 couples celebrate their special day at some of Pakistan's most beautiful
                        venues. Every Barat, Walima, Mehndi, and Engagement booking on our platform is a
                        testament to our commitment to excellence.
                    </p>
                    <p className="ab-section-text">
                        Today, ShaadiGo operates across three major cities with a growing network of
                        premium venues — and we are just getting started.
                    </p>
                </div>

                {/* CTA */}
                <div className="ab-cta">
                    <h2 className="ab-cta-title">Ready to Find Your Perfect Venue?</h2>
                    <p className="ab-cta-sub">
                        Join hundreds of happy couples who trusted ShaadiGo for their special day.
                    </p>
                    <button className="ab-cta-btn" onClick={() => navigate('/venues')}>
                        Explore Venues
                    </button>
                </div>

            </main>
            <Footer />
        </div>
    );
}

export default AboutUs;
