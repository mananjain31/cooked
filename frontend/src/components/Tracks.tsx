import type { SpotifyTrack } from "../types/SpotifyTrack";

interface Props {
  tracks: SpotifyTrack[];
}

export default function Tracks({ tracks }: Props) {
  return (
    <ul className="">
      {tracks.map((track, index) => (
        <li key={track.id} className="border rounded p-3">
          <div className="font-semibold">
            {`${index + 1})`} {track.name}
          </div>
          <div className="text-sm text-gray-600">
            {track.artists.map((a) => a.name).join(", ")}
          </div>
        </li>
      ))}
    </ul>
  );
}
