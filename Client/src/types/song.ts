export interface Song {
  id: number;
  title: string;
  artist?: string;
  format?: string;
  duration?: string;
  file_size?: string;
  created_at?: string;
  cover_url?: string;
  filepath: string;
}