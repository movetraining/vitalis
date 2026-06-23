import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Track } from '../domain/models/Track';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { LocalMusicRepository } from '../infrastructure/repositories/LocalMusicRepository';

interface MusicPlayerContextType {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackPosition: number;
  isFullPlayerVisible: boolean;
  isSearching: boolean;
  setFullPlayerVisible: (visible: boolean) => void;
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  searchTracks: (query: string) => Promise<void>;
  loadTracks: () => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

const repository = new LocalMusicRepository();

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
  const allTracksRef = useRef<Track[]>([]);
  const loadTracks = async () => {
    try {
      setIsSearching(true);
      const results = await repository.getAllTracks();
      allTracksRef.current = results;
      setTracks(results);
    } catch (error) {
      console.error('Error cargando canciones:', error);
      setTracks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchTracks = async (query: string) => {
    if (!query.trim()){
      setTracks(allTracksRef.current);
      return;
    }
    const lowerQuery = query.toLocaleLowerCase();
    const filteder = allTracksRef.current.filter(
      (track) =>
        track.title.toLowerCase().includes(lowerQuery) ||
        track.artist.toLowerCase().includes(lowerQuery)
    );
    setTracks(filteder);
  };

  useEffect(() => {
    loadTracks();
  }, []);

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
        loadTracks,
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