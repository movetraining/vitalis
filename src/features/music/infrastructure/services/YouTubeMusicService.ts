import axios from 'axios';
import { Track } from '../../domain/models/Track';

// Aquí va la IP de tu computadora (no localhost, porque el teléfono no lo reconoce)
const BACKEND_URL = 'http://192.168.100.52:3000';

export class YouTubeMusicService {

  async searchTracks(query: string): Promise<Track[]> {
    try {
      if (!query.trim()) return [];

      const response = await axios.get(`${BACKEND_URL}/api/music/search`, {
        params: { q: query },
        timeout: 10000,
      });

      return response.data.tracks || [];
    } catch (error) {
      console.error('Error buscando música:', error);
      return [];
    }
  }

  async getAudioStreamUrl(videoId: string): Promise<string | null> {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/music/stream/${videoId}`, {
        timeout: 15000,
      });
      return response.data.streamUrl || null;
    } catch (error) {
      console.error('Error obteniendo stream:', error);
      return null;
    }
  }
}