package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	//loads the driver in the background
	_ "modernc.org/sqlite"
)

var db *sql.DB

type song struct {
	Id        uint32 `json:"id"`
	Title     string `json:"title"`
	Artist    string `json:"artist"`
	Format    string `json:"format"`
	Duration  string `json:"duration"`
	FileSize  string `json:"file_size"`
	CreatedAt string `json:"created_at"`
	CoverURL  string `json:"cover_url"`
	Path      string `json:"filepath"`
}

type metadata struct {
	Title     string  `json:"title"`
	Uploader  string  `json:"uploader"`
	Artist    string  `json:"artist"`
	Duration  float64 `json:"duration"` // In seconds
	Thumbnail string  `json:"thumbnail"`
}

func main() {
	// Creates folder "music" with rwxr-xr-x permissions
	if err := os.MkdirAll("music", 0o755); err != nil {
		log.Fatal(err)
	}

	initDB()

	http.HandleFunc("GET /api/songs", getSongsHandler)
	http.HandleFunc("GET /api/song/{id}", serveMusicHandler)
	http.HandleFunc("POST /api/download", downloadHandler)
	http.HandleFunc("DELETE /api/song/{id}", deleteSongHandler)
	http.HandleFunc("PUT /api/song/{id}", renameSongHandler)
	http.HandleFunc("PATCH /api/song/{id}", renameSongHandler)

	log.Println("Server is started : http://localhost:3000")
	log.Fatal(http.ListenAndServe("0.0.0.0:3000", nil))
}

// Initialize sqlite database
func initDB() {
	var err error
	// Connect to SQLite. It will automatically create 'music.db' if it's missing.
	db, err = sql.Open("sqlite", "music.db")

	if err != nil {
		log.Fatal("Connection to the database is impossible.")
	}

	var query string = `
		CREATE TABLE IF NOT EXISTS songs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT,
			artist TEXT,
			format TEXT,
			duration TEXT,
			file_size TEXT,
			cover_url TEXT,
			filepath TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`

	if _, err = db.Exec(query); err != nil {
		log.Fatal("Cannot create database table.")
	}
}

// Downloads the given music
func downloadHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		URL string `json:"url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.URL) == "" {
		http.Error(w, "URL manquante ou invalide", http.StatusBadRequest)
		return
	}

	url := strings.TrimSpace(req.URL)
	defer r.Body.Close()

	var metaDataCmd *exec.Cmd
	metaDataCmd = exec.Command("yt-dlp", "--no-playlist", "--dump-json", "--no-warnings", url)
	metaDataBytes, err := metaDataCmd.Output()

	log.Printf("Collecting metadata...")
	if err != nil {
		log.Println("Error: Could not fetch metadata.", err)
		return
	}

	var data metadata
	if err = json.Unmarshal(metaDataBytes, &data); err != nil {
		log.Println("Error: Could not parse metadata.", err)
		http.Error(w, "Could not parse metadata.", http.StatusBadRequest)
		return
	}

	artist := data.Artist
	if artist == "" {
		artist = data.Uploader
	}

	// Format time
	totalSec := int(data.Duration)
	duration := fmt.Sprintf("%d:%02d", totalSec/60, totalSec%60) // Seconds are 2 decimals

	// Formatting song title
	title := sanitizeFilename(data.Title)
	fileName := fmt.Sprintf("music/%s_%d.mp3", title, time.Now().Unix())

	// Download
	downloadCmd := exec.Command("yt-dlp", "-x", "--no-playlist", "--audio-format", "mp3", "-o", fileName, url)
	err = downloadCmd.Run()
	if err != nil {
		log.Println("Failed to download:", err)
		return
	}

	var fileInfo os.FileInfo
	fileInfo, err = os.Stat(fileName)
	fileSize := "Unknown"
	if err == nil {
		sizeMB := float64(fileInfo.Size()) / (1024 * 1024)
		fileSize = fmt.Sprintf("%.1f MB", sizeMB)
	}

	// Insertion in database
	query := `
	INSERT INTO songs (
	title, artist, format, duration, file_size, cover_url, filepath)
	VALUES (?, ?, ?, ?, ?, ?, ?)`

	var res sql.Result
	res, err = db.Exec(query, data.Title, artist, "MP3", duration, fileSize, data.Thumbnail, fileName)

	if err != nil {
		log.Println("Database error:", err)
		_ = os.Remove(fileName)
		return
	}

	log.Printf("Downloaded: %s - %s (%s)\n", data.Title, artist, duration)

	newID, _ := res.LastInsertId()

	DownloadedSong := song{
		Id:       uint32(newID),
		Title:    data.Title,
		Artist:   artist,
		Format:   "MP3",
		Duration: duration,
		FileSize: fileSize,
		CoverURL: data.Thumbnail,
		Path:     fileName,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	// Sends the data of the downloaded song to the UI
	json.NewEncoder(w).Encode(DownloadedSong)
}

// Returns all the downloaded songs
func getSongsHandler(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, title, artist, format, duration, file_size, created_at, cover_url, filepath FROM songs ORDER BY id DESC`
	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Query error: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	songs := make([]song, 0)
	for rows.Next() {
		var s song
		err = rows.Scan(
			&s.Id,
			&s.Title,
			&s.Artist,
			&s.Format,
			&s.Duration,
			&s.FileSize,
			&s.CreatedAt,
			&s.CoverURL,
			&s.Path,
		)
		if err != nil {
			http.Error(w, "Scan error", http.StatusInternalServerError)
			return
		}
		songs = append(songs, s)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Rows iteration error: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(songs)
}

// Serves the file to the client
func serveMusicHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID Missing", http.StatusBadRequest)
		return
	}

	if _, err := strconv.Atoi(id); err != nil {
		http.Error(w, "Bad ID", http.StatusBadRequest)
		return
	}

	var path string
	err := db.QueryRow("SELECT filepath FROM songs WHERE id = ?", id).Scan(&path)
	if err != nil {
		log.Print("Couln't find song with the ID : ", id)
		http.Error(w, "Couldn't find song", http.StatusNotFound)
		return
	}

	http.ServeFile(w, r, path)
}

func sanitizeFilename(title string) string {
	badChars := []string{"/", "\\", "?", "%", "*", ":", "|", "\"", "<", ">"}

	for _, char := range badChars {
		title = strings.ReplaceAll(title, char, "_")
	}

	return title
}

// Deletes the song
func deleteSongHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID Missing", http.StatusBadRequest)
		return
	}

	if _, err := strconv.Atoi(id); err != nil {
		http.Error(w, "Bad ID", http.StatusBadRequest)
		return
	}

	query := "SELECT filepath FROM songs WHERE id = ?"
	var songFilepath string

	err := db.QueryRow(query, id).Scan(&songFilepath)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Song not found", http.StatusNotFound)
			return
		}

		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if err = os.Remove(songFilepath); err != nil && !os.IsNotExist(err) {
		log.Printf("Failed to remove file: %v", err)
		http.Error(w, "Couldn't delete file", http.StatusInternalServerError)
		return
	}

	// Querying db
	if _, err = db.Exec("DELETE FROM songs WHERE id = ?", id); err != nil {
		log.Printf("Query error: %v", err)
		http.Error(w, "Couldn't delete song", http.StatusInternalServerError)
		return
	}

	log.Printf("Deleted song : %v", songFilepath)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

// Renames the title in the database
func renameSongHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID Missing", http.StatusBadRequest)
		return
	}

	if _, err := strconv.Atoi(id); err != nil {
		http.Error(w, "Bad ID", http.StatusBadRequest)
		return
	}

	// JSON
	var req struct {
		Title string `json:"title"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	defer r.Body.Close()

	if err != nil || strings.TrimSpace(req.Title) == "" {
		http.Error(w, "Titre invalide", http.StatusBadRequest)
		return
	}

	// Querying database
	var res sql.Result
	res, err = db.Exec("UPDATE songs SET title = ? WHERE id = ?", strings.TrimSpace(req.Title), id)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	var rowsAff int64
	rowsAff, err = res.RowsAffected()
	if rowsAff == 0 {
		http.Error(w, "Song not found", http.StatusNotFound)
		return
	}

	log.Printf("Renamed song : %v to %v", id, req.Title)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "Titre mis à jour"}`))
}
