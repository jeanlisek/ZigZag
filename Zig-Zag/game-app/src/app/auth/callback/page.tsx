'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/utils/logger';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Upload un avatar en attente (sauvegardé lors de l'inscription)
 */
async function uploadPendingAvatar(userId: string, avatarData: any) {
  try {
    console.log('📸 Début upload avatar en attente pour utilisateur:', userId);
    logger.debug('📸 Début upload avatar en attente pour utilisateur:', userId);
    
    // Convertir base64 en Blob
    // Format base64: "data:image/png;base64,iVBORw0KGgo..."
    const base64Data = avatarData.imageData.split(',')[1]; // Enlever le préfixe "data:image/..."
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: avatarData.fileType });
    
    // Déterminer l'extension du fichier
    const fileExtension = avatarData.fileName.split('.').pop()?.toLowerCase() || 'png';
    const fileName = `${userId}/avatar.${fileExtension}`;
    
    console.log('📁 Nom de fichier:', fileName);
    console.log('📏 Taille du fichier:', avatarData.fileSize, 'bytes');
    logger.debug('📁 Nom de fichier:', fileName);
    logger.debug('📏 Taille du fichier:', avatarData.fileSize, 'bytes');
    
    // Vérifier que le bucket existe
    console.log('🔍 Vérification du bucket avatars...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la vérification des buckets:', listError);
      logger.error('Erreur lors de la vérification des buckets:', listError);
      throw listError;
    }
    
    const avatarsBucket = buckets?.find(b => b.id === 'avatars');
    if (!avatarsBucket) {
      console.error('❌ Bucket "avatars" non trouvé');
      logger.error('❌ Bucket "avatars" non trouvé');
      throw new Error('Bucket "avatars" non trouvé');
    } else {
      console.log('✅ Bucket "avatars" trouvé:', avatarsBucket);
    }
    
    // Uploader vers Supabase Storage
    console.log('⬆️ Upload vers Supabase Storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: avatarData.fileType,
        upsert: true,
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('❌ Erreur upload avatar:', uploadError);
      console.error('Détails:', JSON.stringify(uploadError, null, 2));
      logger.error('❌ Erreur upload avatar:', uploadError);
      throw uploadError;
    }
    
    console.log('✅ Upload réussi:', uploadData);
    logger.debug('✅ Upload réussi:', uploadData);
    
    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    const avatarUrl = urlData.publicUrl;
    console.log('🔗 URL publique de l\'avatar:', avatarUrl);
    logger.debug('🔗 URL publique de l\'avatar:', avatarUrl);
    
    // Mettre à jour user_metadata
    console.log('🔄 Mise à jour user_metadata...');
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl
      }
    });
    
    if (updateError) {
      console.error('❌ Erreur mise à jour avatar dans user_metadata:', updateError);
      logger.error('❌ Erreur mise à jour avatar dans user_metadata:', updateError);
    } else {
      console.log('✅ Avatar mis à jour dans user_metadata');
      logger.debug('✅ Avatar mis à jour dans user_metadata');
    }
    
    // Mettre à jour la table users
    console.log('🔄 Mise à jour table users...');
    const { error: updateUsersError } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);
    
    if (updateUsersError) {
      console.error('❌ Erreur mise à jour avatar dans table users:', updateUsersError);
      logger.error('❌ Erreur mise à jour avatar dans table users:', updateUsersError);
    } else {
      console.log('✅ Avatar mis à jour dans table users');
      logger.debug('✅ Avatar mis à jour dans table users');
    }
    
    // Supprimer l'avatar en attente
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zigzag_pending_avatar');
      console.log('🗑️ Avatar en attente supprimé après upload réussi');
      logger.debug('🗑️ Avatar en attente supprimé après upload réussi');
    }
    
    console.log('🎉 Avatar uploadé avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors de l\'upload de l\'avatar en attente:', err);
    logger.error('Erreur lors de l\'upload de l\'avatar en attente:', err);
    // Ne pas supprimer l'avatar en attente en cas d'erreur, pour réessayer plus tard
  }
}

/**
 * Page de callback pour gérer la réception des tokens d'authentification
 * depuis zig-zag.fun/jouer.html
 * 
 * Cette page :
 * 1. Attend que Supabase détecte et stocke la session depuis l'URL hash
 * 2. Nettoie l'URL (enlève le hash avec les tokens)
 * 3. Redirige vers /jeu
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Vérifier IMMÉDIATEMENT si l'avatar est dans localStorage ou sessionStorage (avant toute autre opération)
        if (typeof window !== 'undefined') {
          // Essayer localStorage d'abord
          let pendingAvatarStr = localStorage.getItem('zigzag_pending_avatar');
          let source = 'localStorage';
          
          // Si pas dans localStorage, essayer sessionStorage
          if (!pendingAvatarStr) {
            pendingAvatarStr = sessionStorage.getItem('zigzag_pending_avatar');
            source = 'sessionStorage';
          }
          
          console.log('🔍 [Callback] Vérification IMMÉDIATE avatar en attente:', pendingAvatarStr ? `TROUVÉ (${source})` : 'AUCUN');
          
          if (pendingAvatarStr) {
            try {
              const pendingAvatar = JSON.parse(pendingAvatarStr);
              console.log('📋 [Callback] Avatar trouvé immédiatement:', {
                source: source,
                userId: pendingAvatar.userId,
                fileName: pendingAvatar.fileName,
                fileSize: pendingAvatar.fileSize
              });
              
              // Si trouvé dans sessionStorage mais pas localStorage, copier dans localStorage
              if (source === 'sessionStorage') {
                localStorage.setItem('zigzag_pending_avatar', pendingAvatarStr);
                console.log('📋 [Callback] Avatar copié de sessionStorage vers localStorage');
              }
            } catch (err) {
              console.error('❌ [Callback] Erreur parsing avatar immédiat:', err);
            }
          } else {
            console.warn('⚠️ [Callback] Aucun avatar trouvé ni dans localStorage ni dans sessionStorage');
          }
        }
        
        // Vérifier d'abord le type dans l'URL hash pour détecter la réinitialisation de mot de passe
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        
        // Si c'est une réinitialisation de mot de passe, rediriger vers la page dédiée
        if (type === 'recovery') {
          logger.debug('Type recovery détecté, redirection vers la page de réinitialisation');
          // Conserver le hash pour la page de réinitialisation
          // Utiliser window.location.href pour préserver le hash (router.push ne le préserve pas)
          window.location.href = '/auth/reset-password' + window.location.hash;
          return;
        }
        
        // Attendre un peu pour que Supabase détecte et stocke la session
        // Supabase avec detectSessionInUrl: true le fait automatiquement
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Vérifier que la session a bien été récupérée
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Erreur lors de la récupération de la session:', error);
          // Rediriger vers /jeu même en cas d'erreur (l'utilisateur pourra se reconnecter)
          router.push('/jeu');
          return;
        }
        
        if (session) {
          logger.debug('Session récupérée avec succès depuis l\'URL');
          console.log('✅ Session récupérée, utilisateur:', session.user.id);
          
          // Vérifier s'il y a un avatar en attente à uploader (depuis l'inscription)
          if (typeof window !== 'undefined') {
            // Essayer localStorage d'abord
            let pendingAvatarStr = localStorage.getItem('zigzag_pending_avatar');
            let source = 'localStorage';
            
            // Si pas dans localStorage, essayer sessionStorage
            if (!pendingAvatarStr) {
              pendingAvatarStr = sessionStorage.getItem('zigzag_pending_avatar');
              source = 'sessionStorage';
            }
            
            console.log('🔍 Vérification avatar en attente...', pendingAvatarStr ? `TROUVÉ (${source})` : 'AUCUN');
            
            if (pendingAvatarStr) {
              try {
                const pendingAvatar = JSON.parse(pendingAvatarStr);
                console.log('📋 Avatar en attente:', {
                  source: source,
                  userId: pendingAvatar.userId,
                  currentUserId: session.user.id,
                  match: pendingAvatar.userId === session.user.id
                });
                
                // Si trouvé dans sessionStorage mais pas localStorage, copier dans localStorage
                if (source === 'sessionStorage') {
                  localStorage.setItem('zigzag_pending_avatar', pendingAvatarStr);
                  console.log('📋 Avatar copié de sessionStorage vers localStorage');
                }
                
                // Vérifier que l'avatar correspond à l'utilisateur connecté
                if (pendingAvatar.userId === session.user.id) {
                  console.log('📸 Avatar en attente détecté, upload en cours...');
                  logger.debug('📸 Avatar en attente détecté, upload en cours...');
                  // Uploader l'avatar en arrière-plan (ne pas bloquer la redirection)
                  uploadPendingAvatar(session.user.id, pendingAvatar).catch(err => {
                    console.error('❌ Erreur upload avatar en attente:', err);
                    logger.error('Erreur upload avatar en attente:', err);
                  });
                } else {
                  console.log('⚠️ Avatar en attente pour un autre utilisateur, suppression');
                  // Avatar d'un autre utilisateur, le supprimer
                  localStorage.removeItem('zigzag_pending_avatar');
                  sessionStorage.removeItem('zigzag_pending_avatar');
                }
              } catch (err) {
                console.error('❌ Erreur parsing avatar en attente:', err);
                logger.error('Erreur parsing avatar en attente:', err);
                localStorage.removeItem('zigzag_pending_avatar');
                sessionStorage.removeItem('zigzag_pending_avatar');
              }
            } else {
              console.log('ℹ️ Aucun avatar en attente ni dans localStorage ni dans sessionStorage');
            }
          }
        } else {
          logger.warn('Aucune session détectée dans l\'URL');
          console.warn('⚠️ Aucune session détectée dans l\'URL');
        }
        
        // Nettoyer l'URL (enlever le hash avec les tokens)
        // Utiliser replaceState pour ne pas ajouter d'entrée dans l'historique
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        
        // Rediriger vers /jeu
        router.push('/jeu');
      } catch (err) {
        logger.error('Erreur dans le callback d\'authentification:', err);
        // Rediriger vers /jeu même en cas d'erreur
        router.push('/jeu');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #40C4D4 0%, #F54291 50%, #FF912D 100%)'
    }}>
      <LoadingSpinner size="large" message="Connexion en cours..." />
    </div>
  );
}
