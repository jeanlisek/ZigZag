// Layout pour la route dynamique [game_id]/results
// Exporte generateStaticParams pour permettre l'export statique

export function generateStaticParams() {
  // Retourne un tableau vide car les game_id sont générés dynamiquement
  // Le routing côté client gérera les routes via le .htaccess
  return [];
}

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
