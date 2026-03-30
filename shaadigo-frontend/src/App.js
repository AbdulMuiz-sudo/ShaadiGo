import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Contact from './components/contact/Contact';
import Login from './components/login/Login';
import Venues from './pages/Venues/Venues';
import './App.css';

// Helper component to handle header visibility
const HeaderWrapper = () => {
  const location = useLocation();
  
  // Hide header on login page
  if (location.pathname === '/login') {
    return null;
  }

  return <Header />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <HeaderWrapper />

        <main>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<Login />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;