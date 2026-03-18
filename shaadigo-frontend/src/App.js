import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'; // 1. Added useLocation
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Contact from './components/contact/Contact';
import Login from './components/login/Login';
import './App.css';

// 2. Created a helper component to handle the logic
const Headerwrapper = () => {
  const location = useLocation();

  if (location.pathname === '/login') {
    return null;
  }

  return <Header />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* 3. Replaced <Header /> with our logic wrapper */}
        <Headerwrapper />

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <div id="hero">
                  <Hero />
                </div>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;