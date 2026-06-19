import axios from 'axios';
import { Track } from '../../domain/models/Track';
import ytdl from 'react-native-ytdl';

const BACKEND_URL = 'https://vitalis-backend-g7bz.onrender.com';

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
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const info = await ytdl.getInfo(url);
      const formats = ytdl.filterFormats(info.formats, 'audioonly');

      if (!formats.length) return null;

      const best = formats.sort(
        (a: any, b: any) => (b.audioBitrate || 0) - (a.audioBitrate || 0)
      )[0];

      return best.url;
    } catch (error) {
      console.error('Error obteniendo stream:', error);
      return null;
    }
  }
}