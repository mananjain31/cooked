import React, { useState, type SetStateAction } from "react";
import ReactMarkdown from "react-markdown";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

interface Props {
  roast: string;
  setRoast: React.Dispatch<SetStateAction<string>>;
}
const Roast: React.FC<Props> = ({ roast, setRoast }: Props) => {
  const [loading, setLoading] = useState(false);
  const getRoast = async () => {
    setLoading(true);
    setRoast("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/roast`);
      const data = await res.json();
      if (!res.ok) {
        console.error("Roast error:", data);
        setRoast("Could not roast you. Are you logged in with Spotify?");
      } else {
        setRoast(data.roast);
      }
    } catch (err) {
      console.error(err);
      setRoast("Something went wrong while roasting you.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto  p-6 bg-gray-900 text-slate-50 sm:rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Get Cooked 🔥</h2>
      <p className="text-sm text-slate-300 mb-4">
        We'll analyze your Spotify profile, top tracks, playlists, and listening
        history, then absolutely ruin your self-esteem (in a loving way).
      </p>
      <button
        onClick={getRoast}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-medium"
      >
        {roast === "" && loading
          ? "Cooking your roast..."
          : "Roast my music taste"}
      </button>

      {roast && (
        <div className="mt-4 p-4 h-[60vh] overflow-scroll bg-gray-800 rounded-xl border border-slate-700 whitespace-pre-wrap">
          <ReactMarkdown>{roast}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Roast;
