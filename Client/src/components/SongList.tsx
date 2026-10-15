import React, { useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import type { Song } from '../types/song';
import { SongRow } from './SongRow';
import { SongCard } from './SongCard';

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onRenameSong: (id: number, newTitle: string) => void;
  onDeleteSong: (id: number) => void
}

export const SongList: React.FC<SongListProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onRenameSong,
  onDeleteSong,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const isList = viewMode === 'list';
  const ItemComponent = isList ? SongRow : SongCard;

  const btnStyle = (mode: 'list' | 'grid') =>
    `p-1.5 rounded-lg transition-colors cursor-pointer ${
      viewMode === mode ? 'bg-[#1E222E] text-white' : 'text-zinc-500 hover:text-zinc-300'
    }`;

  if (songs.length === 0) {
    return (
      <div className="border border-dashed border-[#1C202C] rounded-2xl p-12 text-center text-zinc-500 text-sm">
        No tracks found in your vault yet. Paste a link above to get started!
      </div>
    );
  }

  return (
    <section>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white tracking-tight">Your library</h2>
          <span className="bg-[#151821] text-zinc-400 text-xs px-2.5 py-1 rounded-full font-medium border border-[#212634]">
            {songs.length} tracks
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#0F1117] border border-[#1A1E29] p-1 rounded-xl">
          <button onClick={() => setViewMode('list')} className={btnStyle('list')} aria-label="Vue liste">
            <List size={16} />
          </button>
          <button onClick={() => setViewMode('grid')} className={btnStyle('grid')} aria-label="Vue grille">
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Conteneur List ou Grid */}
      <div
        className={
          isList
            ? 'bg-[#0F1117] border border-[#1A1E29] rounded-2xl overflow-hidden shadow-lg'
            : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
        }
      >
        {isList && (
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#181C26] text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-5">Track</div>
            <div className="col-span-1 text-center">Format</div>
            <div className="col-span-2 text-center">Duration</div>
            <div className="col-span-2 text-center">File Size</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        )}

        <div className={isList ? 'divide-y divide-[#151822]' : 'contents'}>
          {songs.map((song) => (
            <ItemComponent
              key={song.id}
              song={song}
              isCurrent={currentSong?.id === song.id}
              isPlaying={isPlaying}
              onPlayToggle={() => onPlaySong(song)}
              onRename={(title) => onRenameSong(song.id, title)}
              onDelete={() => onDeleteSong(song.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};