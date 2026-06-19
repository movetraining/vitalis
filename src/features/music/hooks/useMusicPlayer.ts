import { useState, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Track } from '../domain/models/Track';
import { YouTubeMusicRepository } from '../infrastructure/repositories/YouTubeMusicRepository';

interface UseMusicPlayerProps {
  onTrackFinished?: () => void;
}

const repository = new YouTubeMusicRepository();

export const useMusicPlayer = ({ onTrackFinished }: UseMusicPlayerProps = {}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing;
  const playbackPosition = Math.floor(status.currentTime || 0);

  useEffect(() => {
    if (status.didJustFinish) {
      if (onTrackFinished) onTrackFinished();
    }
  }, [status.didJustFinish]);

  const playTrack = async (track: Track) => {
    try {
      setCurrentTrack(track);

      const audioUrl = await repository.getStreamUrl(track.id);
      if (!audioUrl) throw new Error('No se encontró URL de audio');

      player.replace({ uri: audioUrl });
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