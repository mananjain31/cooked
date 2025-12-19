import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SpotifyLogin from "./pages/SpotifyLogin";
import Dashboard from "./pages/Dashboard";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SpotifyLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
