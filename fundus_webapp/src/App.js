import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CampaignPage from './components/CampaignPage';
import Home from './components/Home'
import NotFound from './components/NotFound'

function App() {
  return (
    < BrowserRouter >
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/campaigns/:address' element={<CampaignPage />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter >
  );
}

export default App;
