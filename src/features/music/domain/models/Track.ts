export interface Track {
    id: string; //ID unico (de Yotube Music o del archivo local)
    title: string; //Titulo de la cancion
    artist: string; // Artista, grupo o canal de Yotube
    album?: string; // Album al que pertenece la cancion (opcional)
    duration: number; // Duracion exacta en segundos
    artworkUrl: string; // URL de la caratula de fondo (diseño)
    streamUrl?: string; // Enlace directo del flujo de audio 
    isLocal?: boolean; // true si es un Mp3 del telefono false si es una de la nube
    lyrics?: string; // Letra de la cancion
    createdAt?: number; // para ordenar el hitorial de reproduccion
    }