import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track } from '../domain/models/Track';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { YouTubeMusicRepository } from '../infrastructure/repositories/YouTubeMusicRepository';

interface MusicPlayerContextType {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackPosition: number;
  isFullPlayerVisible: boolean;
  isSearching: boolean;
  setFullPlayerVisible: (visible: boolean) => void;
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  playNext: () => void;
  playPrevious: () => void;
  searchTracks: (query: string) => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

const repository = new YouTubeMusicRepository();

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isFullPlayerVisible, setFullPlayerVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const playNextRef = useRef<() => void>(() => {});

  const {
    currentTrack,
    isPlaying,
    playbackPosition,
    playTrack,
    togglePlay,
  } = useMusicPlayer({
    onTrackFinished: () => {
      playNextRef.current();
    }
  });

  const searchTracks = async (query: string) => {
    if (!query.trim()) {
      setTracks([]);
      return;
    }
    try {
      setIsSearching(true);
      const results = await repository.searchTracks(query);
      setTracks(results);
    } catch (error) {
      console.error('Error buscando canciones:', error);
      setTracks([]);
    } finally {
      setIsSearching(false);
    }
  };

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
        isSearching,
        setFullPlayerVisible,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        searchTracks,
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