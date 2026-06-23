import { useState, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync} from 'expo-audio';
import { Track } from '../domain/models/Track';

interface UseMusicPlayerProps {
  onTrackFinished?: () => void;
}

export const useMusicPlayer = ({ onTrackFinished }: UseMusicPlayerProps = {}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing;
  const playbackPosition = Math.floor(status.currentTime || 0);

  useEffect(() => {
    // Configura el audio para segundo plano
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    });
  }, []);

  useEffect(() => {
    if (status.didJustFinish) {
      if (onTrackFinished) onTrackFinished();
    }
  }, [status.didJustFinish]);

  const playTrack = async (track: Track) => {
    try {
      setCurrentTrack(track);
      if (!track.uri) throw new Error('No se encontró el archivo de audio');
      player.replace({ uri: track.uri });
      player.play();
    } catch (error) {
      console.log('Error en el motor de reproducción:', error);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const stopTrack = () => {
    player.pause();
    setCurrentTrack(null);
  };

  const setPlaybackPosition = (seconds: number) => {
    player.seekTo(seconds);
  };

  return {
    currentTrack,
    isPlaying,
    playbackPosition,
    playTrack,
    togglePlay,
    stopTrack,
    setPlaybackPosition,
  };
};