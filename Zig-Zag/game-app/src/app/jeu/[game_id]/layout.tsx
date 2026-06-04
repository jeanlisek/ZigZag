// Layout pour la route dynamique [game_id]
// Exporte generateStaticParams pour permettre l'export statique

export function generateStaticParams() {
  // Retourne un tableau vide car les game_id sont générés dynamiquement
  // Le routing côté client gérera les routes via le .htaccess
  return [];
}

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
