import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ImageBackground, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMusic } from '../context/MusicPlayerContext';

export const FullPlayerModal: React.FC = () => {
  const { 
    currentTrack, isPlaying, playbackPosition, togglePlay, 
    isFullPlayerVisible, setFullPlayerVisible, playNext, playPrevious, tracks, playTrack 
  } = useMusic();

  // Estado local para mostrar/ocultar la lista de reproducción
  const [showQueue, setShowQueue] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentTrack.duration > 0 ? (playbackPosition / currentTrack.duration) * 100 : 0;

  // Filtrar las canciones que vienen a continuación
  const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
  const upcomingTracks = tracks.slice(currentIndex + 1);

  return (
    <Modal visible={isFullPlayerVisible} animationType="slide" presentationStyle="fullScreen">
      <ImageBackground 
        source={{ uri: currentTrack.artworkUrl || 'https://via.placeholder.com/800' }} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlayBlur}>
          <SafeAreaView style={styles.container}>
            
            {/* CABECERA */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={() => { setShowQueue(false); setFullPlayerVisible(false); }}>
                <Text style={styles.closeIcon}>▼</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>REPRODUCTOR INMERSIVO</Text>
              <View style={{ width: 40 }} /> 
            </View>

            {/* CENTRO COMPLETAMENTE LIMPIO (Tu idea original) */}
            <View style={styles.centerSpace}>
              <View style={styles.liveTagContainer}>
                <Text style={styles.liveTagText}>• DISEÑO ORIGINAL</Text>
              </View>
            </View>

            {/* PANEL INFERIOR DE CONTROL */}
            <View style={styles.bottomPanel}>
              
              {/* Info de la canción activa */}
              <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={2}>{currentTrack.title}</Text>
                <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
              </View>

              {/* Barra de Progreso */}
              <View style={styles.progressSection}>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{formatTime(playbackPosition)}</Text>
                  <Text style={styles.timeText}>{formatTime(currentTrack.duration)}</Text>
                </View>
              </View>

              {/* Mandos Multimedia + Botón de Lista Oculta */}
              <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.sideButton} onPress={() => setShowQueue(!showQueue)}>
                  <Text style={[styles.queueIcon, showQueue && styles.queueIconActive]}>☰</Text>
                </TouchableOpacity>

                <View style={styles.mainControlsRow}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={playPrevious}>
                    <Text style={styles.secondaryIcon}>⏮</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.mainPlayButton} onPress={togglePlay}>
                    <Text style={styles.mainPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryButton} onPress={playNext}>
                    <Text style={styles.secondaryIcon}>⏭</Text>
                  </TouchableOpacity>
                </View>

                {/* Espaciador estético para centrar los mandos perfectamente */}
                <View style={styles.sideButton} />
              </View>

            </View>

            {/* PANEL DESPLEGABLE VERTICAL DE LA COLA DE REPRODUCCIÓN */}
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
                    upcomingTracks.map((track) => (
                      <TouchableOpacity 
                        key={track.id} 
                        style={styles.verticalTrackRow}
                        onPress={() => {
                          playTrack(track);
                          setShowQueue(false); // Cierra el panel al cambiar de tema
                        }}
                      >
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
  backgroundImage: {
    flex: 1,
  },
  overlayBlur: {
    flex: 1,
    backgroundColor: 'rgba(7, 7, 9, 0.78)',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    opacity: 0.8,
  },
  headerTitle: {
    color: '#E1E1E6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  centerSpace: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveTagContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  liveTagText: {
    color: '#1DB954',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  bottomPanel: {
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 26,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  artist: {
    color: '#D4D4D8',
    fontSize: 16,
    marginTop: 6,
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 35,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    width: '100%',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sideButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueIcon: {
    color: '#A1A1AA',
    fontSize: 24,
  },
  queueIconActive: {
    color: '#1DB954',
  },
  mainControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  secondaryButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    opacity: 0.9,
  },
  mainPlayButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  mainPlayIcon: {
    color: '#000000',
    fontSize: 28,
    marginLeft: 4,
  },
  
  /* ESTILOS DEL PANEL DESPLEGABLE VERTICAL */
  queueOverlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 100, // Deja ver la cabecera del fondo
    backgroundColor: 'rgba(12, 12, 16, 0.96)', // Fondo traslúcido oscuro premium
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 24,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 14,
  },
  queuePanelTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeQueueBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  closeQueueText: {
    color: '#E1E1E6',
    fontSize: 12,
    fontWeight: '600',
  },
  queueVerticalScroll: {
    paddingBottom: 40,
  },
  verticalTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  verticalTrackImg: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#282828',
  },
  verticalTrackInfo: {
    flex: 1,
    marginLeft: 16,
  },
  verticalTrackTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  verticalTrackArtist: {
    color: '#A1A1AA',
    fontSize: 13,
    marginTop: 3,
  },
  emptyQueueBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyQueueBoxText: {
    color: '#71717A',
    fontSize: 14,
  },
});