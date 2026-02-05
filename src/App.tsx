import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import TabBar from './components/TabBar';
import Arena from './pages/Arena';
import Tournament from './pages/Tournament';
import Squad from './pages/Squad';
import Wallet from './pages/Wallet';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cyber-bg">
        <Header />
        <Routes>
          <Route path="/" element={<Arena />} />
          <Route path="/tournament" element={<Tournament />} />
          <Route path="/squad" element={<Squad />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>
        <TabBar />
      </div>
    </BrowserRouter>
  );
};

export default App;
