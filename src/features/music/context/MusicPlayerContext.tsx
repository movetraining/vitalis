import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track } from '../domain/models/Track';
import { useMusicPlayer } from '../hooks/useMusicPlayer';

interface MusicPlayerContextType {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackPosition: number;
  isFullPlayerVisible: boolean;
  setFullPlayerVisible: (visible: boolean) => void;
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  playNext: () => void;
  playPrevious: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// NOTA: Modifica los datos de aquí adentro con tus canciones reales si quieres, 
// el "as unknown as Track[]" al final blinda el archivo para que no marque errores de tipo.
const MOCK_TRACKS = [
  {
    id: '1',
    title: 'Cyberpunk Ambient Beat',
    artist: 'SynthWave Lab',
    artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
    duration: 180,
  },
  {
    id: '2',
    title: 'Lo-Fi Chill Study',
    artist: 'Café Beats',
    artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500',
    duration: 180,
  },
  {
    id: '3',
    title: 'HyperDrive Neon',
    artist: 'RetroFuture',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500',
    duration: 240,
  }
] as unknown as Track[];

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks] = useState<Track[]>(MOCK_TRACKS);
  const [isFullPlayerVisible, setFullPlayerVisible] = useState(false);

  // El Puente: Evita bucles infinitos de renderizado
  const playNextRef = useRef<() => void>(() => {});

  const {
    currentTrack,
    isPlaying,
    playbackPosition,
    playTrack,
    togglePlay,
  } = useMusicPlayer({
    onTrackFinished: () => {
      // Se dispara automáticamente al terminar el tema
      playNextRef.current();
    }
  });

  const playNext = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1) return;

    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  // Mantiene el puente sincronizado
  useEffect(() => {
    playNextRef.current = playNext;
  }, [currentTrack, tracks]);

  return (
    <MusicPlayerContext.Provider
      value={{
        tracks,
        currentTrack,
        isPlaying,
        playbackPosition,
        isFullPlayerVisible,
        setFullPlayerVisible,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusic debe ser usado dentro de un MusicPlayerProvider');
  }
  return context;
};