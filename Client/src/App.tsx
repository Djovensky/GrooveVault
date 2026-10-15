import { useState, useEffect, useRef } from 'react';
import type { Song } from './types/song';
import { Header } from './components/Header';
import { Downloader } from './components/Downloader';
import { SongList } from './components/SongList';
import { AudioPlayer } from './components/AudioPlayer';

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Charger les morceaux depuis l'API
  const fetchSongs = async () => {
    try {
      const res = await fetch('/api/songs');
      if (res.ok) setSongs((await res.json()) || []);
    } catch (err) {
      console.error('Erreur de chargement:', err);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Synchronisation de la balise <audio> avec l'état React
  const playAudio = () => {
    audioRef.current?.play().catch(() => setIsPlaying(false));
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  // Lecture d'un morceau spécifique
  const handlePlaySong = (song: Song) => {
    if (!audioRef.current) return;

    if (currentSong?.id === song.id) {
      isPlaying ? pauseAudio() : playAudio();
      return;
    }

    setCurrentSong(song);
    audioRef.current.src = `/api/song/${song.id}`;
    playAudio();
  };

  const handlePlayToggle = () => {
    if (currentSong) {
      isPlaying ? pauseAudio() : playAudio();
    } else if (songs.length > 0) {
      handlePlaySong(songs[0]);
    }
  };

  // Renommage
  const handleRenameSong = async (id: number, newTitle: string) => {
    try {
      const res = await fetch(`/api/song/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setSongs((prev) =>
          prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
        );
        if (currentSong?.id === id) {
          setCurrentSong((prev) => (prev ? { ...prev, title: newTitle } : null));
        }
      }
    } catch (err) {
      console.error('Erreur renommage:', err);
    }
  };

  const handleDeleteSong = async (id: number) => {
    if (!confirm('Do you really want to delete this song ?')) return;

    try {
      const res = await fetch(`/api/song/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== id));
        if (currentSong?.id === id) {
          audioRef.current?.pause();
          setCurrentSong(null);
          setIsPlaying(false);
        }
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const handleNextSong = () => {
    if (songs.length === 0) return;

    if (isShuffle) {
      if (songs.length === 1) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          playAudio();
        }
        return;
      }

      // On exclut le morceau actuellement joué du tirage
      const otherSongs = songs.filter((s) => s.id !== currentSong?.id);
      const randomIndex = Math.floor(Math.random() * otherSongs.length);
      const nextSong = otherSongs[randomIndex];

      // On force la lecture du nouveau morceau
      setCurrentSong(nextSong);
      if (audioRef.current) {
        audioRef.current.src = `/api/song/${nextSong.id}`;
        playAudio();
      }
      return;
  }
    
    const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    handlePlaySong(songs[nextIndex]);
  };

  const handlePreviousSong = () => {
    if (songs.length === 0) return;

    // Si on est déjà avancé dans la piste, revenir au début du morceau
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handlePlaySong(songs[prevIndex]);
  };

  // Filtre de recherche
  const query = searchQuery.trim().toLowerCase();
  const filteredSongs = query
    ? songs.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.artist?.toLowerCase().includes(query)
      )
    : songs;

  return (
    <div className="min-h-screen bg-[#08090C] text-[#E1E4EA] pb-32 font-sans">
      {/* Balise audio unique avec gestion du loop et passage au morceau suivant */}
      <audio
        ref={audioRef}
        loop={isRepeat}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          setDuration(e.currentTarget.duration || 0);
        }}
        onEnded={() => {
          if (!isRepeat) {
            handleNextSong();
          }
        }}
      />

      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-8">
        <section className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Your music. Your space.
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Save the sounds you love. Keep them close.
          </p>
        </section>

        <Downloader onDownloadComplete={fetchSongs} />

        <SongList
          songs={filteredSongs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaySong={handlePlaySong}
          onRenameSong={handleRenameSong}
          onDeleteSong={handleDeleteSong}
        />
      </main>

      <AudioPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        onPlayToggle={handlePlayToggle}
        onNext={handleNextSong}
        onPrevious={handlePreviousSong}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        onToggleRepeat={() => setIsRepeat((prev) => !prev)}
        onSeek={(time) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
          }
        }}
      />
    </div>
  );
}