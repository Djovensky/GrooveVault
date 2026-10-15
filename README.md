# GrooveVault

> **Your music. Your space.**  
> Save the sounds you love. Keep them close.

GrooveVault is a self-hosted personal audio hub featuring a lightweight Go backend, an embedded SQLite catalog, and a modern React interface. It leverages `yt-dlp` to extract audio streams, parse metadata, and organize your music library locally with built-in playback controls.

---

## Preview
![GrooveVault UI](<Capture d'écran 2026-10-15 180355.png>)

## Features

- **Audio Extraction**: Downloads and converts media links (YouTube, SoundCloud, direct audio) directly to 128kbps/best-quality MP3 via `yt-dlp`.
- **Automatic Metadata**: Captures song title, uploader/artist, duration, file size, and cover artwork automatically.
- **Embedded Storage**: Zero-setup SQLite persistence with modern Go (`modernc.org/sqlite`—pure Go, no CGO required).
- **In-Browser Audio Player**: Integrated bottom playback bar with progress seeking, shuffle, repeat, and play/pause controls.
- **Library Management**: In-line title renaming, track deletion with automatic disk cleanup, and real-time list synchronization.



## ⚠️ Disclaimer
This project is intended strictly for personal archiving, educational use, and local media playback. Please respect the terms of service of the respective streaming platforms and download only content you have the right to access.


## Tech Stack

- **Backend**: Go (Standard library HTTP routing with Go 1.27)
- **Database**: SQLite (`modernc.org/sqlite`)
- **CLI Utilities**: [`yt-dlp`](https://github.com/yt-dlp/yt-dlp), [`ffmpeg`](https://ffmpeg.org/) (for audio extraction)
- **Frontend**: React, Tailwind CSS / Modern CSS, Lucide Icons

---

## Prerequisites

Ensure you have the following installed on your host system:

1. **Go** (v1.22 or higher)
2. **Node.js** (v18+ recommended) and `npm` or `pnpm`
3. **yt-dlp & ffmpeg:**:
   ```bash
   # Windows (winget)
   winget install yt-dlp ffmpeg
   ```

## API Reference
| Method | Endpoint | Description | 
| --- | --- | --- |
| GET | /api/songs | Fetch all saved tracks ordered by newest first |
| GET | /api/song/{id} | Stream the audio file to the client |
| POST | /api/download | Trigger yt-dlp to fetch metadata, download the track, and save it |
| PUT/PATCH | /api/song/{id} | Update the song title |
| DELETE | /api/song/{id} | Remove track from database and delete the file |

