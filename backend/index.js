import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
// import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

const app = express();

const PORT = process.env.PORT || 5001;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// In-memory token store (OK for single-user local testing)
let spotifyAccessToken = null;
let spotifyRefreshToken = null;

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-recently-played",
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-library-read",
].join(" ");

function requireSpotifyAuth(req, res, next) {
  if (!spotifyAccessToken) {
    return res.status(401).json({ error: "Not authenticated with Spotify" });
  }
  next();
}
app.get("/api/models", async (req, res) => {
  try {
    const result = await axios.get(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );

    res.json(result.data);
  } catch (err) {
    console.error("Model list error:", err.response?.data || err.message);
    res.json({ error: err.response?.data || err.message });
  }
});

app.get("/auth/login", (request, response) => {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
  });

  response.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
});

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const tokenData = tokenResponse.data;
    console.log("TOKEN RESPONSE:", tokenData);

    spotifyAccessToken = tokenData.access_token;
    spotifyRefreshToken = tokenData.refresh_token;

    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("TOKEN ERROR:", err.response?.data || err.message);
    res
      .status(500)
      .json(err.response?.data || { error: "Token request failed" });
  }
});

app.get("/api/top-tracks", async (req, res) => {
  if (!spotifyAccessToken) {
    return res.status(401).json({ error: "Not authenticated with Spotify" });
  }

  try {
    const spotifyRes = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?limit=20",
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    );

    res.json(spotifyRes.data);
  } catch (err) {
    console.error("SPOTIFY API ERROR:", err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Failed to fetch top tracks" });
  }
});

// 4️⃣ User profile + email
app.get("/api/me", requireSpotifyAuth, async (req, res) => {
  try {
    const spotifyRes = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
    });

    res.json(spotifyRes.data);
  } catch (err) {
    console.error(
      "SPOTIFY API ERROR (/me):",
      err.response?.data || err.message
    );
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Failed to fetch user profile" });
  }
});

// 5️⃣ User playlists (public + private)
app.get("/api/playlists", requireSpotifyAuth, async (req, res) => {
  try {
    const spotifyRes = await axios.get(
      "https://api.spotify.com/v1/me/playlists?limit=50",
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    );

    res.json(spotifyRes.data);
  } catch (err) {
    console.error(
      "SPOTIFY API ERROR (playlists):",
      err.response?.data || err.message
    );
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Failed to fetch playlists" });
  }
});

// 6️⃣ Recently played tracks
app.get("/api/recently-played", requireSpotifyAuth, async (req, res) => {
  try {
    const spotifyRes = await axios.get(
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    );

    res.json(spotifyRes.data);
  } catch (err) {
    console.error(
      "SPOTIFY API ERROR (recently-played):",
      err.response?.data || err.message
    );
    res.status(err.response?.status || 500).json(
      err.response?.data || {
        error: "Failed to fetch recently played tracks",
      }
    );
  }
});

// 7️⃣ Saved tracks (Liked Songs / library tracks)
app.get("/api/library/tracks", requireSpotifyAuth, async (req, res) => {
  try {
    const spotifyRes = await axios.get(
      "https://api.spotify.com/v1/me/tracks?limit=50",
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    );

    res.json(spotifyRes.data);
  } catch (err) {
    console.error(
      "SPOTIFY API ERROR (library tracks):",
      err.response?.data || err.message
    );
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Failed to fetch saved tracks" });
  }
});

// 8️⃣ Saved albums (library albums)
app.get("/api/library/albums", requireSpotifyAuth, async (req, res) => {
  try {
    const spotifyRes = await axios.get(
      "https://api.spotify.com/v1/me/albums?limit=50",
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    );

    res.json(spotifyRes.data);
  } catch (err) {
    console.error(
      "SPOTIFY API ERROR (library albums):",
      err.response?.data || err.message
    );
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: "Failed to fetch saved albums" });
  }
});

app.get("/api/roast", requireSpotifyAuth, async (req, res) => {
  try {
    // 1. Fetch Spotify data in parallel
    const [meRes, topTracksRes, playlistsRes, recentRes, likedRes] =
      await Promise.all([
        axios.get("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${spotifyAccessToken}` },
        }),
        axios.get("https://api.spotify.com/v1/me/top/tracks?limit=10", {
          headers: { Authorization: `Bearer ${spotifyAccessToken}` },
        }),
        axios.get("https://api.spotify.com/v1/me/playlists?limit=10", {
          headers: { Authorization: `Bearer ${spotifyAccessToken}` },
        }),
        axios.get(
          "https://api.spotify.com/v1/me/player/recently-played?limit=10",
          {
            headers: { Authorization: `Bearer ${spotifyAccessToken}` },
          }
        ),
        axios.get("https://api.spotify.com/v1/me/tracks?limit=10", {
          headers: { Authorization: `Bearer ${spotifyAccessToken}` },
        }),
      ]);

    const me = meRes.data;
    const topTracks = topTracksRes.data.items || [];
    const playlists = playlistsRes.data.items || [];
    const recent = recentRes.data.items || [];
    const liked = likedRes.data.items || [];

    // 2. Build roasting prompt
    const topSummary = topTracks
      .map(
        (t, i) =>
          `${i + 1}. ${t.name} - ${t.artists.map((a) => a.name).join(", ")}`
      )
      .join("\n");

    const playlistSummary = playlists
      .map((p) => `• ${p.name} (${p.tracks?.total ?? "?"} tracks)`)
      .join("\n");

    const recentSummary = recent
      .map(
        (r) =>
          `• ${r.track?.name} - ${r.track?.artists
            ?.map((a) => a.name)
            .join(", ")}`
      )
      .join("\n");

    const likedSummary = liked
      .map(
        (r) =>
          `• ${r.track?.name} - ${r.track?.artists
            ?.map((a) => a.name)
            .join(", ")}`
      )
      .join("\n");

    const prompt = `
You are "Cooked", a savage but playful music-taste roast comedian.
Roast this user's ENTIRE Spotify music identity.

RULES:
- Answer in Hinglish
- Strictly no cuss words, not even their reference (the person can be a school student)
- Generate it with emojis and bullet points in seprate lines 

- Be funny, sharp, and sarcastic.
- Target ONLY their music taste.
- NO hate speech, slurs, personal attacks unrelated to music.
- Keep it 5-8 sentences.
- Make it sound like a comedy roast.

USER PROFILE:
Name: ${me.display_name}
Country: ${me.country}
Plan: ${me.product}

Top Tracks:
${topSummary}

Playlists:
${playlistSummary}

Recently Played:
${recentSummary}

Liked Songs Sample:
${likedSummary}

Give the roast only, nothing else.
`;

    // 3. Ask Gemini for the roast
    const result = await geminiModel.generateContent(prompt);
    const roast = result.response.text();

    res.json({ roast });
  } catch (err) {
    console.error("ROAST ERROR:", err.response?.data || err.message || err);
    res.status(500).json({
      error: "Failed to roast user",
      details: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`);
});
