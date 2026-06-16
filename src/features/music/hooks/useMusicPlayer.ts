import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Track } from '../domain/models/Track';

// Definimos que el hook ahora puede recibir una función de aviso
interface UseMusicPlayerProps {
  onTrackFinished?: () => void;
}

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

      // ¡EL MOMENTO CLAVE!: Si la canción terminó de sonar
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
        // Si nos pasaron la función de aviso, la ejecutamos aquí
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

      // Mapeo dinámico temporal usando las URLs reales de prueba de audio
      const audioSource = track.id === '1' 
        ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioSource },
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