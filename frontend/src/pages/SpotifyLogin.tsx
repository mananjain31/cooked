import React from "react";
// If you don't have shadcn, replace Button with a normal <button>

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const SpotifyLogin: React.FC = () => {
  const loginWithSpotify = () => {
    // Just redirect to backend's /auth/login
    window.location.href = `${API_BASE_URL}/auth/login`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Cooked 🔥</h1>
      <p className="text-lg text-gray-600 mb-6 max-w-md">
        Log in with Spotify so we can analyze your music taste and roast you to
        perfection.
      </p>
      <button
        onClick={loginWithSpotify}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg"
      >
        Login with Spotify
      </button>
    </div>
  );
};

export default SpotifyLogin;
