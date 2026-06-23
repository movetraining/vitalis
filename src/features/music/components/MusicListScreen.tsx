import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, ActivityIndicator, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TrackItem } from './TrackItem';
import { FloatingPlayer } from './FloatingPlayer';
import { FullPlayerModal } from './FullPlayerModal';
import { useMusic } from '../context/MusicPlayerContext';
import { Track } from '../domain/models/Track';

type FilterMode = 'canciones' | 'carpetas' | 'artista' | 'albumes';

const FILTER_LABELS: Record<FilterMode, string> = {
  canciones: 'Canciones',
  carpetas: 'Carpetas',
  artista: 'Artista',
  albumes: 'Álbumes',
};

const FIELD_MAP: Record<Exclude<FilterMode, 'canciones'>, keyof Track> = {
  carpetas: 'folderName',
  artista: 'artist',
  albumes: 'album',
};

interface GroupData {
  name: string;
  count: number;
  samples: Track[];
}

export const MusicListScreen: React.FC = () => {
  const router = useRouter();
  const { 
    currentTrack, isPlaying, playbackPosition, 
    playTrack, togglePlay, tracks, searchTracks, isSearching, loadTracks
  } = useMusic();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('canciones');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      if (text.trim() === '') {
        loadTracks();
      } else {
        searchTracks(text);
      }
    }, 400);

    setSearchTimeout(timeout);
  }, [searchTimeout, searchTracks, loadTracks]);

  const handleFilterChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setSelectedGroup(null);
  };

  const groups = useMemo((): GroupData[] => {
    if (filterMode === 'canciones') return [];
    const field = FIELD_MAP[filterMode];
    const map = new Map<string, GroupData>();
    tracks.forEach((t) => {
      const key = (t[field] as string) || 'Desconocido';
      if (!map.has(key)) map.set(key, { name: key, count: 0, samples: [] });
      const entry = map.get(key)!;
      entry.count += 1;
      if (entry.samples.length < 2) entry.samples.push(t);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [filterMode, tracks]);

  const groupTracks = useMemo(() => {
    if (filterMode === 'canciones' || !selectedGroup) return [];
    const field = FIELD_MAP[filterMode];
    return tracks.filter((t) => ((t[field] as string) || 'Desconocido') === selectedGroup);
  }, [filterMode, selectedGroup, tracks]);

  const showingFlatList = filterMode === 'canciones' || selectedGroup !== null;
  const listData = filterMode === 'canciones' ? tracks : groupTracks;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Tu Música</Text>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setSearchVisible((prev) => !prev)}
            >
              <Ionicons name="search" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {searchVisible && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar en tu música..."
              placeholderTextColor="#71717A"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCorrect={false}
              autoFocus
            />
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {(Object.keys(FILTER_LABELS) as FilterMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => handleFilterChange(mode)}
              style={[styles.filterPill, filterMode === mode && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, filterMode === mode && styles.filterPillTextActive]}>
                {FILTER_LABELS[mode]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filterMode !== 'canciones' && selectedGroup && (
          <TouchableOpacity style={styles.backRow} onPress={() => setSelectedGroup(null)}>
            <Ionicons name="chevron-back" size={12} color="#1DB954" />
            <Text style={styles.backText}>{selectedGroup}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1DB954" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      )}

      {showingFlatList ? (
        <FlatList
          data={listData}
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
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No se encontró música en tu celular'}
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => {
            const artwork = item.samples.find((s) => s.artworkUrl)?.artworkUrl;
            return (
              <TouchableOpacity style={styles.groupRow} onPress={() => setSelectedGroup(item.name)}>
                {artwork ? (
                  <Image source={{ uri: artwork }} style={styles.groupArtwork} />
                ) : (
                  <View style={styles.groupIconBox}>
                    <Ionicons
                      name={filterMode === 'carpetas' ? 'folder' : filterMode === 'artista' ? 'person' : 'albums'}
                      size={35}
                      color="#42c771"
                    />
                  </View>
                )}

                <View style={styles.groupInfo}>
                  <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
                  {item.samples.map((s) => (
                    <View key={s.id} style={styles.sampleRow}>
                      <Ionicons name="musical-note" size={11} color="#71717A" />
                      <Text style={styles.sampleText} numberOfLines={1}>{s.title}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.groupCountNumber}>{item.count}</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isSearching ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🎵</Text>
                <Text style={styles.emptyText}>No hay {FILTER_LABELS[filterMode].toLowerCase()}</Text>
              </View>
            ) : null
          }
        />
      )}

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
    paddingHorizontal: 2,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: '#121212',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E1E24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    width: '100%',
    backgroundColor: '#1E1E24',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    marginTop: 16,
  },
  searchInput: {
    color: '#FFFFFF',
    fontSize: 14,
    width: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingRight: 13,
  },
  filterPill: {
    paddingHorizontal: 23,
    paddingVertical: 11,
    borderRadius: 20,
    backgroundColor: '#1E1E24',
  },
  filterPillActive: {
    backgroundColor: '#1DB954',
  },
  filterPillText: {
    color: '#A2A2A5',
    fontSize: 14,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 4,
  },
  backText: {
    color: '#1DB954',
    fontSize: 15,
    fontWeight: '600',
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
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  groupArtwork: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#282828',
  },
  groupIconBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#1E1E24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sampleText: {
    color: '#71717A',
    fontSize: 12,
    flex: 1,
  },
  groupCountNumber: {
    color: '#71717A',
    fontSize: 14,
    fontWeight: '600',
  },
});