import { Tabs } from 'expo-router';
import { MusicPlayerProvider } from '../src/features/music/context/MusicPlayerContext';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <MusicPlayerProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(17, 17, 17, 0.85)',
            borderTopColor: 'rgba(255, 255, 255, 0.08)',
            borderTopWidth: 1,
            height: 68,
            paddingBottom: 10,
            paddingTop: 2,
            position: 'absolute',
          },
          tabBarActiveTintColor: '#1DB954',
          tabBarInactiveTintColor: '#666666',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="(app)/index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/search"
          options={{
            title: 'Buscar',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/playlist"
          options={{
            title: 'Playlist',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="library" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/settings"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </MusicPlayerProvider>
  );
}