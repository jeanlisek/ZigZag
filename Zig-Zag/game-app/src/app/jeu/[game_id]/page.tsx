import GamePageClient from './GamePageClient';

// Générer une page fallback pour l'export statique
export function generateStaticParams() {
  return [
    { game_id: '__fallback__' }
  ];
}

// Next.js 16 : params est maintenant une Promise
export default async function GamePage({ 
  params 
}: { 
  params: Promise<{ game_id: string }> 
}) {
  const resolvedParams = await params;
  const game_id = resolvedParams?.game_id;
  
  // Log pour débogage
  console.log('🔍 GamePage - game_id reçu:', game_id);
  
  return <GamePageClient gameId={game_id} />;
}
