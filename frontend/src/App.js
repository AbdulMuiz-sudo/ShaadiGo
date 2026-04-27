import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Tagline from './components/Tagline';
import SignUpCard from './components/SignUpCard';
import Footer from './components/Footer';
import VenueSelection from './components/Venueselection';
import Booking from './components/Booking';
import VenueDetail from './components/Venuedetail';
import Contact from './components/Contact';
import Dashboard from './components/Dashboard';
import AboutUs from './components/AboutUs';

import Chat from './components/Chat';

import './App.css';

function HomePage() {
    return (
        <div className="App">
            <Header />
            <main>
                <Tagline />
                <div className="divider-v"></div>
                <SignUpCard />
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/venues" element={<VenueSelection />} />
                <Route path="/venue-detail" element={<VenueDetail />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/about" element={<AboutUs />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;

