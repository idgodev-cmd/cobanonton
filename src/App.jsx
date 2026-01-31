import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import Detail from './pages/Detail';
import InstallPrompt from './components/pwa/InstallPrompt';
import Onboarding from './components/pwa/Onboarding';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app">
          <InstallPrompt />
          <Onboarding />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/detail/:detailPath" element={<Detail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
