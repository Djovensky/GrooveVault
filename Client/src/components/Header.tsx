import React from 'react';
import { Search } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#08090C]/80 backdrop-blur-md border-b border-[#1A1D27] px-6 lg:px-12 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo_vBlue.svg" alt="GrooveVault Logo" width={35}/>
          <span className="font-bold tracking-tight text-lg text-white">GrooveVault</span>
        </div>

        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-2.5 text-zinc-500" size={17} />
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#11131A] border border-[#1E222E] rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#7C3AED] transition-colors"
          />
        </div>
      </div>
    </header>
  );
};
