import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Tagline from './components/Tagline';
import Login from './components/login';
import SignUp from './components/signup';
import Footer from './components/Footer';
import VenueSelection from './components/Venueselection';
import Booking from './components/Booking';
import VenueDetail from './components/Venuedetail';
import Contact from './components/Contact';
import Dashboard from './components/Dashboard';
import AboutUs from './components/AboutUs';
import Chat from './components/Chat';
import OwnerDashboard from './components/ownerdashboard';
import AddVenue from './components/addvenue';
import OwnerVenues from './components/ownervenues';
import './App.css';

// A layout wrapper so we don't have to copy-paste the header/footer on both pages
function AuthLayout({ children }) {
    return (
        <div className="App">
            <Header />
            <main>
                <Tagline />
                <div className="divider-v"></div>
                {children}
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirect the home page directly to login */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Dedicated Auth Routes */}
                <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
                <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />

                {/* Main App Routes */}
                <Route path="/venues" element={<VenueSelection />} />
                <Route path="/venue-detail" element={<VenueDetail />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/owner-dashboard" element={<OwnerDashboard />} /> {/* NEW ROUTE */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/add-venue" element={<AddVenue />} />
                <Route path="/owner-venues" element={<OwnerVenues />} />
                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;