import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Music,
} from 'lucide-react';
import type { Song } from '../types/song';

interface AudioPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  isRepeat: boolean;
  onPlayToggle: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  isRepeat,
  onPlayToggle,
  onSeek,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
}) => {
  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#0A0B10]/95 backdrop-blur-xl border-t border-[#1A1D27] px-6 py-3 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-3 items-center gap-3">
        
        {/* 1. Colonne Gauche : Infos Piste */}
        <div className="flex items-center gap-3 w-full min-w-0 justify-start">
          <div className="w-12 h-12 rounded-xl bg-[#161822] overflow-hidden shrink-0 border border-[#232838] shadow-inner">
            {currentSong?.cover_url ? (
              <img
                src={currentSong.cover_url}
                alt={currentSong.title || 'Cover'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <Music size={20} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-100 truncate">
              {currentSong ? currentSong.title : 'Aucun morceau sélectionné'}
            </p>
            <p className="text-xs text-zinc-400 truncate">
              {currentSong ? currentSong.artist || 'Artiste inconnu' : 'Sélectionnez un titre'}
            </p>
          </div>
        </div>

        {/* 2. Colonne Centre : Contrôles de lecture & Barre de progression */}
        <div className="flex flex-col items-center gap-2 w-full max-w-lg mx-auto">
          <div className="flex items-center gap-5">
            {/* SHUFFLE */}
            <button
              type="button"
              aria-label="Aléatoire"
              onClick={onToggleShuffle}
              className={`transition-colors cursor-pointer ${
                isShuffle ? 'text-[#A855F7]' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Shuffle size={16} />
            </button>

            {/* PREVIOUS */}
            <button
              type="button"
              onClick={onPrevious}
              aria-label="Précédent"
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <SkipBack size={18} />
            </button>

            {/* PLAY / PAUSE */}
            <button
              type="button"
              onClick={onPlayToggle}
              disabled={!currentSong}
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6366F1] to-[#9333EA] text-white flex items-center justify-center shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            {/* NEXT */}
            <button
              type="button"
              onClick={onNext}
              aria-label="Suivant"
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward size={18} />
            </button>

              {/* REPEAT */}
            <button
              type="button"
              onClick={onToggleRepeat}
              aria-label="Répéter"
              className={`transition-colors cursor-pointer ${
                isRepeat ? 'text-[#A855F7]' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Repeat size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full">
            <span className="text-[11px] text-zinc-400 w-9 text-right font-mono select-none">
              {formatSeconds(currentTime)}
            </span>
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                disabled={!currentSong}
                onChange={(e) => onSeek(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #9333EA ${progressPercent}%, #1E222E ${progressPercent}%)`,
                }}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#C084FC] disabled:cursor-not-allowed"
              />
            </div>
            <span className="text-[11px] text-zinc-400 w-9 font-mono select-none">
              {formatSeconds(duration)}
            </span>
          </div>
        </div>

        {/* 3. Colonne Droite : Espace vide servant d'équilibre pour garder le centre fixe */}
        <div className="hidden md:block w-full" aria-hidden="true" />

      </div>
    </footer>
  );
};