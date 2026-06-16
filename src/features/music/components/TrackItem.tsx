import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Track } from '../domain/models/Track';

interface TrackItemProps {
  track: Track;
  onPress: (track: Track) => void;
}

export const TrackItem: React.FC<TrackItemProps> = ({ track, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(track)}>
      <Image 
        source={{ uri: track.artworkUrl || 'https://via.placeholder.com/150' }} 
        style={styles.artwork} 
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist} {track.album ? `• ${track.album}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#121212', // Fondo oscuro premium
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  artwork: {
    width: 55,
    height: 55,
    borderRadius: 6,
    backgroundColor: '#282828',
  },
  infoContainer: {
    marginLeft: 14,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  artist: {
    color: '#B3B3B3', // Gris claro estilo Spotify
    fontSize: 13,
    marginTop: 4,
  },
});