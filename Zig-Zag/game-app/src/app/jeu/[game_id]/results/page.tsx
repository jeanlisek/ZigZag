import ResultsPageClient from './ResultsPageClient';

// Générer une page fallback pour l'export statique
export function generateStaticParams() {
  return [
    { game_id: '__fallback__' }
  ];
}

// Next.js 16 : params est maintenant une Promise
export default async function ResultsPage({ 
  params 
}: { 
  params: Promise<{ game_id: string }> 
}) {
  const { game_id } = await params;
  return <ResultsPageClient gameId={game_id} />;
}
