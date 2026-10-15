import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface DownloaderProps {
  onDownloadComplete: () => void;
}

interface DownloadPayload {
  url: string;
}

export const Downloader: React.FC<DownloaderProps> = ({ onDownloadComplete }) => {
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsDownloading(true);
    setStatusMessage('Fetching metadata & downloading audio...');

    try {
      const payload: DownloadPayload = { url: url.trim() };

      const res = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setUrl('');
        setStatusMessage('Morceau ajouté à votre bibliothèque !');
        // Mise à jour immédiate
        onDownloadComplete();
        setTimeout(() => setStatusMessage(null), 2500);
      } else {
          setStatusMessage('Échec du téléchargement du morceau.');
        }
    } catch {
        setStatusMessage('Erreur de connexion au serveur.');
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <section className="bg-[#0F1117] border border-[#1A1E29] rounded-2xl p-5 mb-10 shadow-xl">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-zinc-300 flex items-center gap-2">
          <Download size={14} className="text-[#A855F7]" />
          Add to your vault
        </span>
        <span className="text-zinc-500 hidden sm:inline">
          YouTube, SoundCloud & direct audio links
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Paste YouTube or audio link..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isDownloading}
          className="flex-1 bg-[#08090C] border border-[#1E222E] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#7C3AED] transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isDownloading || !url.trim()}
          className="bg-gradient-to-r from-[#6366F1] to-[#9333EA] hover:opacity-90 transition-opacity text-white font-medium px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-purple-900/30 disabled:opacity-50 cursor-pointer"
        >
          {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          <span>Download</span>
        </button>
      </form>

      {statusMessage && (
        <div className="mt-3 flex items-center gap-2 text-xs text-purple-400">
          <Loader2 size={13} className="animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}
    </section>
  );
};