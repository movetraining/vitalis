import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Track } from '../domain/models/Track';
import { YouTubeMusicRepository } from '../infrastructure/repositories/YouTubeMusicRepository';

interface UseMusicPlayerProps {
  onTrackFinished?: () => void;
}

const repository = new YouTubeMusicRepository();

export const useMusicPlayer = ({ onTrackFinished }: UseMusicPlayerProps = {}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const nextRequestId = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(Math.floor(status.positionMillis / 1000));
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
        if (onTrackFinished) {
          onTrackFinished();
        }
      }
    }
  };

  const playTrack = async (track: Track) => {
    const requestId = ++nextRequestId.current;

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setCurrentTrack(track);
      setPlaybackPosition(0);
      setIsPlaying(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      // Usa el streamUrl del track, o lo pide a la API si no lo tiene
      let audioUrl = track.streamUrl;
      if (!audioUrl) {
        audioUrl = await repository.getStreamUrl(track.id);
      }

      if (!audioUrl) throw new Error('No se encontró URL de audio');

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      if (requestId !== nextRequestId.current) {
        await sound.unloadAsync();
        return;
      }

      soundRef.current = sound;
    } catch (error) {
      console.log('Error en el motor de reproducción:', error);
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!soundRef.current) return;
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('Error al pausar/reproducir:', error);
    }
  };

  const stopTrack = async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
      setPlaybackPosition(0);
    } catch (error) {
      console.log('Error al detener audio:', error);
    }
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