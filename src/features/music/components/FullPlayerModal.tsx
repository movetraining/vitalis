import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ImageBackground, ScrollView, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../context/MusicPlayerContext';
import { LyricsService, LyricLine } from '../infrastructure/services/LyricsService';

const lyricsService = new LyricsService();

export const FullPlayerModal: React.FC = () => {
  const { 
    currentTrack, isPlaying, playbackPosition, togglePlay, 
    isFullPlayerVisible, setFullPlayerVisible, playNext, playPrevious, tracks, playTrack 
  } = useMusic();

  const [showQueue, setShowQueue] = useState(false);
  // 'player' = vista normal | 'lyrics' = vista de letras
  const [view, setView] = useState<'player' | 'lyrics'>('player');
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const lyricsRef = useRef<FlatList>(null);

  // Busca las letras automáticamente cuando cambia la canción
  useEffect(() => {
    if (!currentTrack) return;
    setLyrics(null);
    setLoadingLyrics(true);
    lyricsService.getLyrics(currentTrack.title, currentTrack.artist, currentTrack.duration)
      .then((result) => setLyrics(result))
      .finally(() => setLoadingLyrics(false));
  }, [currentTrack?.id]);

  // Encuentra la línea activa según el tiempo actual
  const activeLine = lyrics
    ? lyrics.reduce((prev, curr, i) =>
        curr.time <= playbackPosition ? i : prev, 0)
    : 0;

  // Desplaza automáticamente la letra al verso activo
  useEffect(() => {
    if (lyrics && lyricsRef.current && view === 'lyrics') {
      lyricsRef.current.scrollToIndex({ index: activeLine, animated: true, viewPosition: 0.4 });
    }
  }, [activeLine]);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentTrack.duration > 0 ? (playbackPosition / currentTrack.duration) * 100 : 0;
  const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
  const upcomingTracks = tracks.slice(currentIndex + 1);

  return (
    <Modal visible={isFullPlayerVisible} animationType="slide" presentationStyle="fullScreen">

      {/* ── FONDO: imagen de portada de la canción ── 
          uri: cambia la fuente de la imagen
          resizeMode: 'cover' llena toda la pantalla */}
      <ImageBackground 
        source={{ uri: currentTrack.artworkUrl || 'https://via.placeholder.com/800' }} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >

        {/* ── CAPA OSCURA SOBRE EL FONDO ──
            backgroundColor rgba(7,7,9, X): cambia X (0-1) para más/menos oscuridad */}
        <View style={styles.overlayBlur}>
          <SafeAreaView style={styles.container}>

            {/* ══════════════════════════════════
                CABECERA — título + botón cerrar
                ══════════════════════════════════ */}
            <View style={styles.header}>

              {/* Botón cerrar (▼) — onPress cierra el modal */}
              <TouchableOpacity style={styles.closeButton} onPress={() => { setShowQueue(false); setView('player'); setFullPlayerVisible(false); }}>
                <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Título del header — cambia el texto aquí */}
              <Text style={styles.headerTitle}>
                {view === 'lyrics' ? 'LETRA' : 'REPRODUCIOENDO \n     TU MUSICA'}
              </Text>

              {/* Botón letra/player — alterna entre vista de letras y reproductor */}
              <TouchableOpacity style={styles.closeButton} onPress={() => setView(view === 'player' ? 'lyrics' : 'player')}>
                <Ionicons name={view === 'lyrics' ? 'musical-notes' : 'text'} size={22} color={lyrics ? '#1DB954' : '#666'} />
              </TouchableOpacity>
            </View>

            {/* ══════════════════════════════════
                CENTRO — letras O espacio vacío
                ══════════════════════════════════ */}
            <View style={styles.centerSpace}>
              {view === 'lyrics' ? (
                // ── VISTA DE LETRAS ──
                lyrics && lyrics.length > 0 ? (
                  <FlatList
                    ref={lyricsRef}
                    data={lyrics}
                    keyExtractor={(_, i) => i.toString()}
                    showsVerticalScrollIndicator={false}
                    onScrollToIndexFailed={() => {}}
                    renderItem={({ item, index }) => (
                      // Cada línea de la letra
                      // fontSize del verso activo: cámbialo en styles.activeLyricLine
                      // fontSize de versos inactivos: cámbialo en styles.inactiveLyricLine
                      <Text style={[
                        styles.lyricLine,
                        index === activeLine ? styles.activeLyricLine : styles.inactiveLyricLine
                      ]}>
                        {item.text}
                      </Text>
                    )}
                  />
                ) : (
                  <View style={styles.noLyricsBox}>
                    <Ionicons name="musical-note" size={40} color="#3A3A3C" />
                    <Text style={styles.noLyricsText}>
                      {loadingLyrics ? 'Buscando letra...' : 'Letra no disponible'}
                    </Text>
                  </View>
                )
              ) : (
                // ── VISTA NORMAL (espacio en blanco con badge) ──
                <View style={styles.liveTagContainer}>
                  <Text style={styles.liveTagText}>• DISEÑO ORIGINAL</Text>
                </View>
              )}
            </View>

            {/* ══════════════════════════════════
                PANEL INFERIOR DE CONTROLES
                ══════════════════════════════════ */}
            <View style={styles.bottomPanel}>

              {/* ── Nombre y artista de la canción ──
                  fontSize del título: cámbialo en styles.title
                  fontSize del artista: cámbialo en styles.artist */}
              <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={2}>{currentTrack.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
              </View>

              {/* ── Barra de progreso ──
                  height de la barra: cámbialo en styles.sliderTrack
                  color de la barra: cámbialo en styles.sliderFill (backgroundColor)
                  color del fondo de la barra: cámbialo en styles.sliderTrack (backgroundColor) */}
              <View style={styles.progressSection}>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{formatTime(playbackPosition)}</Text>
                  <Text style={styles.timeText}>{formatTime(currentTrack.duration)}</Text>
                </View>
              </View>

              {/* ── Botones de control ──
                  mainPlayButton: tamaño del círculo blanco de play/pausa
                  secondaryButton: tamaño de los botones anterior/siguiente
                  sideButton: botón de lista (☰) a la izquierda */}
              <View style={styles.controlsContainer}>

                {/* Botón lista de reproducción */}
                <TouchableOpacity style={styles.sideButton} onPress={() => setShowQueue(!showQueue)}>
                  <Ionicons name="list" size={24} color={showQueue ? '#1DB954' : '#A1A1AA'} />
                </TouchableOpacity>

                <View style={styles.mainControlsRow}>
                  {/* Botón anterior */}
                  <TouchableOpacity style={styles.secondaryButton} onPress={playPrevious}>
                    <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Botón play/pausa principal
                      width/height: tamaño del círculo — cámbialo en styles.mainPlayButton
                      borderRadius: debe ser siempre la mitad de width/height */}
                  <TouchableOpacity style={styles.mainPlayButton} onPress={togglePlay}>
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#000000" />
                  </TouchableOpacity>

                  {/* Botón siguiente */}
                  <TouchableOpacity style={styles.secondaryButton} onPress={playNext}>
                    <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Espaciador para centrar los controles */}
                <View style={styles.sideButton} />
              </View>
            </View>

            {/* ══════════════════════════════════
                PANEL DE COLA — próximas canciones
                Se muestra al tocar ☰
                top: cuánto espacio deja arriba antes de aparecer
                ══════════════════════════════════ */}
            {showQueue && (
              <View style={styles.queueOverlayContainer}>
                <View style={styles.queueHeader}>
                  <Text style={styles.queuePanelTitle}>Próximas canciones</Text>
                  <TouchableOpacity style={styles.closeQueueBtn} onPress={() => setShowQueue(false)}>
                    <Text style={styles.closeQueueText}>Ocultar</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.queueVerticalScroll} showsVerticalScrollIndicator={false}>
                  {upcomingTracks.length > 0 ? (
                    upcomingTracks.map((track, index) => (
                      <TouchableOpacity 
                        key={track.id ? `${track.id}-${index}` : index.toString()}
                        style={styles.verticalTrackRow}
                        onPress={() => { playTrack(track); setShowQueue(false); }}
                      >
                        {/* Portada de cada canción en la cola
                            width/height: tamaño de la imagen — cámbialo en styles.verticalTrackImg */}
                        <Image source={{ uri: track.artworkUrl }} style={styles.verticalTrackImg} />
                        <View style={styles.verticalTrackInfo}>
                          <Text style={styles.verticalTrackTitle} numberOfLines={1}>{track.title}</Text>
                          <Text style={styles.verticalTrackArtist} numberOfLines={1}>{track.artist}</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyQueueBox}>
                      <Text style={styles.emptyQueueBoxText}>No hay más canciones en la cola.</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

          </SafeAreaView>
        </View>
      </ImageBackground>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Imagen de fondo — ocupa toda la pantalla
  backgroundImage: { flex: 1 },

  // Capa oscura sobre la imagen — rgba(R,G,B, opacidad)
  overlayBlur: { flex: 1, backgroundColor: 'rgba(7, 7, 9, 0.78)' },

  // Contenedor principal — paddingHorizontal controla los márgenes laterales
  container: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24 },

  // Cabecera
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  closeButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  // fontSize del título del header — "REPRODUCTOR INMERSIVO"
  headerTitle: { color: '#E1E1E6', fontSize: 11, fontWeight: '700', letterSpacing: 2 },

  // Espacio central (donde van las letras o el badge)
  centerSpace: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Badge "DISEÑO ORIGINAL"
  liveTagContainer: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  liveTagText: { color: '#1DB954', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5 },

  // ── LETRAS ──
  // Contenedor cuando no hay letra disponible
  noLyricsBox: { alignItems: 'center', gap: 12 },
  noLyricsText: { color: '#71717A', fontSize: 14 },

  // Cada línea de letra — paddingVertical controla el espacio entre versos
  lyricLine: { textAlign: 'center', paddingHorizontal: 25, paddingVertical: 8 },
  // Verso activo — fontSize y color del verso que suena ahora
  activeLyricLine: { color: '#f7f7f7', fontSize: 30, fontWeight: 'bold' },
  // Versos inactivos — más pequeños y opacos
  inactiveLyricLine: { color: 'rgba(255,255,255,0.35)', fontSize: 18 },

  // Panel inferiorr
  bottomPanel: { marginBottom: 20 },
  infoContainer: { marginBottom: 26 },
  // fontSize del título de la canción — cámbialo aquí
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  // fontSize del artista — cámbialo aquí
  artist: { color: '#D4D4D8', fontSize: 16, marginTop: 6, fontWeight: '500' },

  // Barra de progreso
  progressSection: { marginBottom: 45 },
  // height: grosor de la barra — backgroundColor: color de fondo de la barra
  sliderTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, width: '100%' },
  // backgroundColor: color de la parte que avanza (verde)
  sliderFill: { height: '100%', backgroundColor: '#7c9183', borderRadius: 2 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  timeText: { color: '#A1A1AA', fontSize: 12, fontWeight: '500' },

  // Controles
  controlsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sideButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  mainControlsRow: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  secondaryButton: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  // Círculo blanco del botón play — width/height = tamaño, borderRadius = la mitad
  mainPlayButton: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 8 },

  // Panel de cola
  queueOverlayContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 100, backgroundColor: 'rgba(12,12,16,0.96)', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 24, paddingHorizontal: 20, elevation: 24 },
  queueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', paddingBottom: 14 },
  queuePanelTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  closeQueueBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  closeQueueText: { color: '#E1E1E6', fontSize: 12, fontWeight: '600' },
  queueVerticalScroll: { paddingBottom: 40 },
  verticalTrackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  // Tamaño de la portada en la cola — cámbialo aquí
  verticalTrackImg: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#282828' },
  verticalTrackInfo: { flex: 1, marginLeft: 16 },
  verticalTrackTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  verticalTrackArtist: { color: '#A1A1AA', fontSize: 13, marginTop: 3 },
  emptyQueueBox: { paddingVertical: 60, alignItems: 'center' },
  emptyQueueBoxText: { color: '#71717A', fontSize: 14 },
});