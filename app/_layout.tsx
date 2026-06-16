import { Slot } from 'expo-router';
import { MusicPlayerProvider } from '../src/features/music/context/MusicPlayerContext';

export default function RootLayout() {
  return (
    <MusicPlayerProvider>
      <Slot/>
    </MusicPlayerProvider>
  );
}