import React, { useState } from 'react';
import { Play, Pause, Music, Edit2, Check, Trash2 } from 'lucide-react';
import type { Song } from '../types/song';

interface SongCardProps {
  song: Song;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isCurrent,
  isPlaying,
  onPlayToggle,
  onRename,
  onDelete,
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
    <div className="bg-[#0F1117] border border-[#1A1E29] rounded-2xl p-4 flex flex-col justify-between hover:border-[#2A3042] transition-colors">
      {/* Cover + Bouton lecture */}
      <div className="relative aspect-video rounded-xl bg-[#171A24] overflow-hidden mb-3 border border-[#232837] flex items-center justify-center">
        {song.cover_url ? (
          <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <Music size={28} className="text-zinc-600" />
        )}
        <button
          type="button"
          onClick={onPlayToggle}
          className={`absolute bottom-2.5 right-2.5 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer ${
            isPlayingThis ? 'bg-[#9333EA] text-white' : 'bg-white/90 text-black'
          }`}
        >
          {isPlayingThis ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
      </div>

      {/* Titre & Métadonnées */}
      <div>
        <div className="flex items-center gap-2 h-6">
            {isEditing ? (
                <form onSubmit={(e) => { e.preventDefault(); save(); }} className="flex items-center gap-2 w-full">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={save}
                    onKeyDown={(e) => e.key === 'Escape' && (setTitle(song.title), setIsEditing(false))}
                    className="bg-[#08090C] border border-[#7C3AED] rounded px-2 py-0.5 text-xs text-white outline-none w-full"
                    autoFocus
                />
                <button type="submit" className="text-green-400 hover:text-green-300 cursor-pointer">
                    <Check size={14} />
                </button>
                </form>
            ) : (
                <div className="flex items-center justify-between w-full min-w-0">
                {/* Conteneur titre + crayon groupés à gauche */}
                <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-semibold text-sm text-white truncate">{song.title}</h3>
                    <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-zinc-500 hover:text-zinc-300 shrink-0 cursor-pointer"
                    title="Renommer"
                    >
                    <Edit2 size={12} />
                    </button>
                </div>

                {/* Corbeille seule à droite */}
                <button
                    type="button"
                    onClick={onDelete}
                    className="text-zinc-500 hover:text-red-400 transition-colors shrink-0 ml-2 cursor-pointer"
                    title="Supprimer"
                >
                    <Trash2 size={13} />
                </button>
                </div>
            )}
            </div>

        <p className="text-xs text-zinc-400 mt-0.5 truncate">{song.artist || 'Unknown Artist'}</p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#181C26] text-[11px] text-zinc-500 font-medium">
          <span className="text-purple-400 uppercase font-bold">{song.format || 'MP3'}</span>
          <span>{song.duration || '--:--'}</span>
          <span>{song.file_size || ''}</span>
        </div>
      </div>
    </div>
  );
};