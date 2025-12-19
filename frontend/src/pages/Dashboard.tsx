import React, { useEffect, useState } from "react";
import Roast from "../components/Roast";
import Tracks from "../components/Tracks";
import type { SpotifyTrack } from "../types/SpotifyTrack";
import Tabs from "../components/Tabs";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const Dashboard: React.FC = () => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [roast, setRoast] = useState("");

  useEffect(() => {
    async function fetchTopTracks() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/top-tracks`);
        const data = await res.json();

        if (!res.ok) {
          console.error("Error:", data);
          return;
        }

        setTracks(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopTracks();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <div>
        {loading ? (
          <div>Loading your top tracks…</div>
        ) : (
          <>
            <div className="sm:hidden">
              <Tabs
                items={[
                  {
                    title: "Your Top Tracks",
                    content: <Tracks tracks={tracks} />,
                  },
                  {
                    title: "Your Spotify Roast",
                    content: <Roast roast={roast} setRoast={setRoast} />,
                  },
                  {
                    title: "Your Spotify Roast",
                    content: <Roast roast={roast} setRoast={setRoast} />,
                  },
                ]}
              />
            </div>
            <div className="hidden sm:flex gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">Your Top Tracks</h2>
                <div className="h-[85vh] overflow-scroll">
                  <Tracks tracks={tracks} />
                </div>
              </div>
              <Roast roast={roast} setRoast={setRoast} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
