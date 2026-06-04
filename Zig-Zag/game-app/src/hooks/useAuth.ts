'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

/**
 * Upload un avatar en attente (sauvegardé lors de l'inscription)
 */
async function uploadPendingAvatar(userId: string, avatarData: any) {
  try {
    logger.debug('📸 Début upload avatar en attente pour utilisateur:', userId);
    
    // Convertir base64 en Blob
    const base64Data = avatarData.imageData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: avatarData.fileType });
    
    // Déterminer l'extension
    const fileExtension = avatarData.fileName.split('.').pop()?.toLowerCase() || 'png';
    const fileName = `${userId}/avatar.${fileExtension}`;
    
    // Vérifier que le bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucket = buckets?.find(b => b.id === 'avatars');
    if (!avatarsBucket) {
      logger.error('❌ Bucket "avatars" non trouvé');
      return;
    }
    
    // Uploader
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: avatarData.fileType,
        upsert: true,
        cacheControl: '3600'
      });
    
    if (uploadError) {
      logger.error('❌ Erreur upload avatar:', uploadError);
      return;
    }
    
    logger.debug('✅ Upload réussi:', uploadData);
    
    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    const avatarUrl = urlData.publicUrl;
    
    // Mettre à jour user_metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl
      }
    });
    
    if (updateError) {
      logger.error('❌ Erreur mise à jour avatar dans user_metadata:', updateError);
    } else {
      logger.debug('✅ Avatar mis à jour dans user_metadata');
    }
    
    // Mettre à jour la table users
    const { error: updateUsersError } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);
    
    if (updateUsersError) {
      logger.error('❌ Erreur mise à jour avatar dans table users:', updateUsersError);
    } else {
      logger.debug('✅ Avatar mis à jour dans table users');
    }
    
    // Supprimer l'avatar en attente
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zigzag_pending_avatar');
      logger.debug('🗑️ Avatar en attente supprimé après upload réussi');
    }
  } catch (err) {
    logger.error('Erreur lors de l\'upload de l\'avatar en attente:', err);
  }
}

export function useAuth(requireAuth = false) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('Erreur lors de la récupération de la session:', error);
        if (requireAuth) {
          toast.error('Erreur de connexion. Redirection...');
          router.push('/jouer');
        }
      } else {
        setSession(session);
      }
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setLoading(false);

      // Si l'utilisateur se déconnecte et que l'auth est requise
      if (!session && requireAuth) {
        toast.error('Votre session a expiré');
        router.push('/jouer');
        return;
      }

      // Si l'utilisateur vient de se connecter, vérifier s'il y a un avatar en attente
      if (session?.user?.id && typeof window !== 'undefined') {
        try {
          // Essayer localStorage d'abord
          let pendingAvatarStr = localStorage.getItem('zigzag_pending_avatar');
          let source = 'localStorage';
          
          // Si pas dans localStorage, essayer sessionStorage
          if (!pendingAvatarStr) {
            pendingAvatarStr = sessionStorage.getItem('zigzag_pending_avatar');
            source = 'sessionStorage';
          }
          
          console.log('🔍 [useAuth] Vérification avatar en attente...', pendingAvatarStr ? `TROUVÉ (${source})` : 'AUCUN');
          
          if (pendingAvatarStr) {
            const pendingAvatar = JSON.parse(pendingAvatarStr);
            console.log('📋 [useAuth] Avatar en attente:', {
              source: source,
              userId: pendingAvatar.userId,
              currentUserId: session.user.id,
              match: pendingAvatar.userId === session.user.id
            });
            
            // Si trouvé dans sessionStorage mais pas localStorage, copier dans localStorage
            if (source === 'sessionStorage') {
              localStorage.setItem('zigzag_pending_avatar', pendingAvatarStr);
              console.log('📋 [useAuth] Avatar copié de sessionStorage vers localStorage');
            }
            
            // Vérifier que l'avatar correspond à l'utilisateur connecté
            if (pendingAvatar.userId === session.user.id) {
              console.log('📸 [useAuth] Avatar en attente détecté lors de la connexion, upload en cours...');
              logger.debug('📸 Avatar en attente détecté lors de la connexion, upload en cours...');
              // Uploader l'avatar en arrière-plan (ne pas bloquer)
              uploadPendingAvatar(session.user.id, pendingAvatar).catch(err => {
                console.error('❌ [useAuth] Erreur upload avatar en attente:', err);
                logger.error('Erreur upload avatar en attente:', err);
              });
            } else {
              console.log('⚠️ [useAuth] Avatar en attente pour un autre utilisateur, suppression');
              // Avatar d'un autre utilisateur, le supprimer
              localStorage.removeItem('zigzag_pending_avatar');
              sessionStorage.removeItem('zigzag_pending_avatar');
            }
          }
        } catch (err) {
          console.error('❌ [useAuth] Erreur vérification avatar en attente:', err);
          logger.error('Erreur vérification avatar en attente:', err);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [requireAuth, router]);

  return {
    session,
    loading,
    user: session?.user ?? null,
    isAuthenticated: !!session,
  };
}
