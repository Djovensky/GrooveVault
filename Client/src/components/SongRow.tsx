import React, { useState } from 'react';
import { Play, Pause, Music, Edit2, Check, Trash2 } from 'lucide-react';
import type { Song } from '../types/song';

interface SongRowProps {
  song: Song;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void; // <--- 1. AJOUT DANS L'INTERFACE
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  isCurrent,
  isPlaying,
  onPlayToggle,
  onRename,
  onDelete, // <--- 2. RÉCUPÉRATION DE LA PROP
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(song.title);
  const isPlayingThis = isCurrent && isPlaying;

  const save = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== song.title) onRename(trimmed);
    else setTitle(song.title);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-[#141721]/60 transition-colors text-sm">
      {/* 1. Track info (Cover, Titre, Artiste) */}
      <div className="col-span-5 flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-10 rounded-lg bg-[#161822] overflow-hidden shrink-0 border border-[#232838] flex items-center justify-center">
          {song.cover_url ? (
            <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Music size={16} className="text-zinc-600" />
          )}
          <button
            type="button"
            onClick={onPlayToggle}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white"
          >
            {isPlayingThis ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); save(); }} className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={save}
                autoFocus
                className="bg-[#08090C] border border-[#7C3AED] rounded px-2 py-0.5 text-xs text-white outline-none w-full"
              />
              <button type="submit" className="text-green-400 hover:text-green-300 cursor-pointer">
                <Check size={14} />
              </button>
            </form>
          ) : (
            <>
              <p className={`font-medium truncate ${isPlayingThis ? 'text-[#A855F7]' : 'text-zinc-100'}`}>
                {song.title}
              </p>
              <p className="text-xs text-zinc-500 truncate">{song.artist || 'Unknown Artist'}</p>
            </>
          )}
        </div>
      </div>

      {/* 2. Format */}
      <div className="col-span-1 text-center">
        <span className="text-[11px] font-bold text-purple-400 uppercase">{song.format || 'MP3'}</span>
      </div>

      {/* 3. Duration */}
      <div className="col-span-2 text-center text-xs text-zinc-400 font-mono">
        {song.duration || '--:--'}
      </div>

      {/* 4. File Size */}
      <div className="col-span-2 text-center text-xs text-zinc-500">
        {song.file_size || '--'}
      </div>

      {/* 5. Actions (Édition + Suppression) */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-[#1E222E] transition-colors cursor-pointer"
          title="Renommer"
        >
          <Edit2 size={14} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-[#1E222E] transition-colors cursor-pointer"
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};