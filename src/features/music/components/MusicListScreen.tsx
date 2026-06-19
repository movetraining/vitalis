import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrackItem } from './TrackItem';
import { FloatingPlayer } from './FloatingPlayer';
import { FullPlayerModal } from './FullPlayerModal';
import { useMusic } from '../context/MusicPlayerContext';

export const MusicListScreen: React.FC = () => {
  const { 
    currentTrack, isPlaying, playbackPosition, 
    playTrack, togglePlay, tracks, searchTracks, isSearching
  } = useMusic();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      searchTracks(text);
    }, 600);

    setSearchTimeout(timeout);
  }, [searchTimeout, searchTracks]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tu Música</Text>
        <Text style={styles.headerSubtitle}>Busca cualquier canción</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué deseas escuchar?..."
            placeholderTextColor="#71717A"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCorrect={false}
          />
        </View>
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1DB954" />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      )}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackItem track={item} onPress={(track) => playTrack(track)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isSearching ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? `Sin resultados para "${searchQuery}"` : 'Escribe algo para buscar música'}
              </Text>
            </View>
          ) : null
        }
      />

      <FloatingPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        playbackPosition={playbackPosition}
      />

      <FullPlayerModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#121212',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#1DB954',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    marginBottom: 16,
  },
  searchContainer: {
    width: '100%',
    backgroundColor: '#1E1E24',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  searchInput: {
    color: '#FFFFFF',
    fontSize: 14,
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    color: '#1DB954',
    fontSize: 13,
  },
  listContent: {
    paddingVertical: 10,
    paddingBottom: 160,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    color: '#71717A',
    fontSize: 14,
    textAlign: 'center',
  },
});