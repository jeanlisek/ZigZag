'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirection pour éviter les erreurs 404 sur /matchmaking
export default function MatchmakingRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/jeu/matchmaking');
  }, [router]);
  
  return null;
}





