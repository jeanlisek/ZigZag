// Import du composant client
import RoomLobbyPageClient from './RoomLobbyPageClient';

// Générer une page fallback pour l'export statique
export function generateStaticParams() {
  return [
    { room_code: '__fallback__' }
  ];
}

// Next.js 16 : params est maintenant une Promise
export default async function RoomLobbyPage({ 
  params 
}: { 
  params: Promise<{ room_code: string }> 
}) {
  const { room_code } = await params;
  return <RoomLobbyPageClient roomCode={room_code} />;
}
