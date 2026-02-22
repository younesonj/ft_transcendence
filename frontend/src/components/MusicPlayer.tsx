import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, GripHorizontal } from "lucide-react";

const DEFAULT_TRACK = {
  name: "mix",
  url: "/public/chet.mp3", 
};

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [pos, setPos] = useState({ x: 30, y: 100 });

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  // Load audio
  useEffect(() => {
    const audio = new Audio(DEFAULT_TRACK.url);
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Volume / mute update
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Toggle play
  const toggle = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setPlaying(!playing);
  };

  // Start drag
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;

    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Global drag listeners
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!dragging.current) return;

      setPos({
        x: Math.max(0, e.clientX - offset.current.x),
        y: Math.max(0, e.clientY - offset.current.y),
      });
    };

    const handleUp = () => {
      dragging.current = false;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  return (
    <div
      className="fixed z-50 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 text-white shadow-lg select-none"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Drag Handle */}
      <div
        onPointerDown={onPointerDown}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripHorizontal className="w-4 h-4 opacity-70" />
      </div>

      {/* Play / Pause */}
      <button onClick={toggle}>
        {playing ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Track name */}
      <span className="text-xs opacity-80 max-w-[100px] truncate">
        {DEFAULT_TRACK.name}
      </span>

      {/* Volume */}
      <button onClick={() => setMuted(!muted)}>
        {muted ? (
          <VolumeX className="w-4 h-4 opacity-70" />
        ) : (
          <Volume2 className="w-4 h-4 opacity-70" />
        )}
      </button>
    </div>
  );
}