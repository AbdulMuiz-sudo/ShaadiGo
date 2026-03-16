import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/login/Login';


import './App.css';



function App() {

  return (

    <BrowserRouter>

      <div className="App">

        <main>

          <Routes>

            {/* Changing path to "/" makes this the first page users see */}

            <Route path="/" element={<Login />} />

          </Routes>

        </main>

      </div>

    </BrowserRouter>

  );

}



export default App;