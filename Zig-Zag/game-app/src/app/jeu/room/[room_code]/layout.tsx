// Layout pour la route dynamique [room_code]
// Exporte generateStaticParams pour permettre l'export statique

export function generateStaticParams() {
  // Retourne un tableau vide car les room_code sont générés dynamiquement
  // Le routing côté client gérera les routes via le .htaccess
  return [];
}

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
