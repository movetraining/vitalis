import { Track } from '../models/Track';

export interface MusicRepository {
  /**
   * Busca canciones en la plataforma (YouTube Music / Servidor)
   * @param query Término de búsqueda (Nombre de canción, artista)
   */
  searchTracks(query: string): Promise<Track[]>;

  /**
   * Obtiene la URL de streaming de alta calidad de forma segura
   * @param trackId ID de la canción a reproducir
   */
  getStreamUrl(trackId: string): Promise<string>;

  /**
   * Obtiene las letras de una canción si están disponibles
   * @param trackId ID de la canción
   */
  getLyrics?(trackId: string): Promise<string>;
}