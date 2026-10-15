# GrooveVault

> **Your music. Your space.**  
> Save the sounds you love. Keep them close.

GrooveVault is a self-hosted personal audio hub featuring a lightweight Go backend, an embedded SQLite catalog, and a modern React interface. It leverages `yt-dlp` to extract audio streams, parse metadata, and organize your music library locally with built-in playback controls.

---

## Preview
![GrooveVault UI](<UI Preview.png>)

## Features

- **Audio Extraction**: Downloads and converts media links (YouTube, SoundCloud, direct audio) directly to 128kbps/best-quality MP3 via `yt-dlp`.
- **Automatic Metadata**: Captures song title, uploader/artist, duration, file size, and cover artwork automatically.
- **Embedded Storage**: Zero-setup SQLite persistence with modern Go (`modernc.org/sqlite`—pure Go, no CGO required).
- **In-Browser Audio Player**: Integrated bottom playback bar with progress seeking, shuffle, repeat, and play/pause controls.
- **Library Management**: In-line title renaming, track deletion with automatic disk cleanup, and real-time list synchronization.



## ⚠️ Disclaimer
This project is intended strictly for personal archiving, educational use, and local media playback. Please respect the terms of service of the respective streaming platforms and download only content you have the right to access.


## Tech stack

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
   
   # macOS (Homebrew)
   brew install yt-dlp ffmpeg
   
   # Linux (Ubuntu/Debian)
   sudo apt install yt-dlp ffmpeg
   ```

## Running the project
### 1. Start the Backend:
Open a terminal, navigate to the Server directory, and run the Go server.
```# Navigate to the Go backend folder (update path if different)
cd Server

# Download Go module dependencies
go mod tidy

# Start the server
go run main.go
```
(The server will be accessible at http://localhost:3000)

### 2. Start the frontend:
Open a new terminal window, navigate to the Client directory, and start the React development server.
```# Navigate to the Go backend folder (update path if different)
cd Client

# Install dependencies
npm install

# Start the development server
npm run dev
```

(The frontend will be accessible at http://localhost:5173)

## API Reference
| Method | Endpoint | Description | 
| --- | --- | --- |
| GET | /api/songs | Fetch all saved tracks ordered by newest first |
| GET | /api/song/{id} | Stream the audio file to the client |
| POST | /api/download | Trigger yt-dlp to fetch metadata, download the track, and save it |
| PUT/PATCH | /api/song/{id} | Update the song title |
| DELETE | /api/song/{id} | Remove track from database and delete the file |

## What I learned
Building GrooveVault was a deep dive into full-stack development, specifically bridging a Go backend with a modern web frontend. Key takeaways include:
- Go Fundamentals & HTTP: Setting up a lightweight, fast web server using Go's standard library for routing and handling HTTP requests.
- CLI Integration in Go: Learning how to execute and manage external command-line tools (yt-dlp and ffmpeg) securely from within a Go application using the os/exec package.
- Embedded Databases: Integrating SQLite with Go natively (modernc.org/sqlite) without relying on CGO, making the application highly portable.
- TypeScript & React: Building a type-safe, component-driven user interface, managing complex audio player state (seeking, queues), and consuming a RESTful API.

##  What could be improved ?
- Playlists & Tagging: Allow users to group tracks into custom playlists or tag them by genre.
- Dockerization: Create a Dockerfile and docker-compose.yml to bundle Go, Node, yt-dlp, and ffmpeg into a single, one-click deployable container.
- Advanced Search & Filtering: Add a search bar to instantly filter the local library by artist or track name.
- Batch Downloading: Support pasting entire playlist URLs to queue up multiple tracks sequentially.
