import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrackItem } from './TrackItem';
import { FloatingPlayer } from './FloatingPlayer';
import { FullPlayerModal } from './FullPlayerModal';
import { useMusic } from '../context/MusicPlayerContext';

export const MusicListScreen: React.FC = () => {
  const { currentTrack, isPlaying, playbackPosition, playTrack, togglePlay, tracks } = useMusic();
  
  // Estado para capturar lo que el usuario escribe
  const [searchQuery, setSearchQuery] = useState('');

  // LÓGICA DE FILTRADO: Filtra por título o artista sin importar mayúsculas o minúsculas
  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabecera de la App */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tu Música</Text>
        <Text style={styles.headerSubtitle}>Módulo de audio profesional</Text>
        
        {/* BARRA DE BÚSQUEDA (Nueva herramienta funcional) */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué deseas escuchar? (Escribe canción o artista)..."
            placeholderTextColor="#71717A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Lista de reproducción filtrada dinámicamente */}
      <FlatList
        data={filteredTracks} 
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackItem track={item} onPress={(track) => playTrack(track)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron canciones para "{searchQuery}"</Text>
          </View>
        }
      />

      {/* Reproductor Flotante Inferior */}
      <FloatingPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        playbackPosition={playbackPosition}
      />

      {/* Modal Inmersivo */}
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
  listContent: {
    paddingVertical: 10,
    paddingBottom: 90,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717A',
    fontSize: 14,
    textAlign: 'center',
  },
});