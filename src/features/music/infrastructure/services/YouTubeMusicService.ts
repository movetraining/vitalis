import axios from 'axios';
import { Track } from '../../domain/models/Track';

export class YouTubeMusicService {
  // Usamos la API de piped (o Invidious) que no pide API Key y es rápida para buscar música y audio
  private baseUrl = 'https://pipedapi.kavin.rocks';

  /**
   * Busca canciones en YouTube Music según el texto que escriba el usuario
   * @param query Nombre de la canción o artista (ej: "Anuel AA", "Duki")
   */
  async searchTracks(query: string): Promise<Track[]> {
    try {
      if (!query.trim()) return [];

      // Hacemos la petición de búsqueda filtrando solo por música/videos
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          filter: 'music_videos' // Filtra para traer contenido musical
        }
      });

      // Si no hay resultados válidos, devolvemos una lista vacía
      if (!response.data || !response.data.items) {
        return [];
      }

      // Mapeamos los resultados de YouTube directamente a tu modelo de "Track"
      return response.data.items.map((item: any) => {
        // Obtenemos la mejor calidad de portada disponible
        const thumbnail = item.thumbnail || 'https://via.placeholder.com/150';

        return {
          id: item.id || Math.random().toString(), // ID del video de YouTube
          title: item.title || 'Canción Desconocida',
          artist: item.uploaderName || 'Artista Desconocido',
          artworkUrl: thumbnail,
          // Guardamos la URL directa del stream de audio si existe, o la dejamos lista
          url: item.url ? `${this.baseUrl}${item.url}` : '', 
          duration: item.duration || 180, // Duración en segundos
        };
      });

    } catch (error) {
      console.error('Error buscando música en YouTube Music:', error);
      return [];
    }
  }

  /**
   * Obtiene la URL de streaming directo en formato de audio (.mp3 / .m4a) para reproducir con Expo Audio
   * @param videoId El ID del video que obtuvimos en la búsqueda
   */
  async getAudioStreamUrl(videoId: string): Promise<string | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/streams/${videoId}`);
      
      if (response.data && response.data.audioStreams) {
        // Filtramos las pistas de audio y agarramos la que tenga mejor calidad
        const streams = response.data.audioStreams;
        const bestAudio = streams[streams.length - 1]; // Usualmente la última tiene mayor bitrate
        return bestAudio.url; // Esta es la URL directa que se le pasa a useMusicPlayer
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo el stream de audio de YT:', error);
      return null;
    }
  }
}