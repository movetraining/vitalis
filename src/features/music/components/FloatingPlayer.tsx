import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Track } from '../domain/models/Track';
import { useMusic } from '../context/MusicPlayerContext';

interface FloatingPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackPosition: number;
}

export const FloatingPlayer: React.FC<FloatingPlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  playbackPosition,
}) => {
  const { setFullPlayerVisible } = useMusic(); // Traemos el disparador

  if (!currentTrack) return null;

  const progress = currentTrack.duration > 0 ? (playbackPosition / currentTrack.duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Al presionar toda el área de información se abrirá el modal */}
      <TouchableWithoutFeedback onPress={() => setFullPlayerVisible(true)}>
        <View style={styles.content}>
          <Image source={{ uri: currentTrack.artworkUrl || 'https://via.placeholder.com/150' }} style={styles.artwork} />
          
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <TouchableOpacity style={styles.playButton} onPress={onTogglePlay}>
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
    elevation: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  artwork: {
    width: 42,
    height: 42,
    borderRadius: 4,
    backgroundColor: '#282828',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#A2A2A5',
    fontSize: 12,
    marginTop: 2,
  },
  playButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  progressBarBackground: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#3A3A3C',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
});