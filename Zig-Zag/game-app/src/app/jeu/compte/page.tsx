'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { UserMenu } from '@/components/ui/UserMenu';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface UserStats {
  totalGames: number;
  completedGames: number;
  totalSteps: number;
  createdAt: string | null;
}

export default function ComptePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/jeu');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      loadUserStats();
      // Vérifier s'il y a un avatar en attente à uploader
      checkAndUploadPendingAvatar();
    }
  }, [user]);

  const checkAndUploadPendingAvatar = async () => {
    if (!user?.id || typeof window === 'undefined') {
      console.log('⚠️ [Compte] Pas d\'utilisateur ou window non disponible');
      return;
    }
    
    try {
      console.log('🔍 [Compte] Vérification avatar en attente pour utilisateur:', user.id);
      
      // Essayer localStorage d'abord
      let pendingAvatarStr = localStorage.getItem('zigzag_pending_avatar');
      let source = 'localStorage';
      
      // Si pas dans localStorage, essayer sessionStorage
      if (!pendingAvatarStr) {
        pendingAvatarStr = sessionStorage.getItem('zigzag_pending_avatar');
        source = 'sessionStorage';
      }
      
      if (!pendingAvatarStr) {
        console.log('ℹ️ [Compte] Aucun avatar en attente ni dans localStorage ni dans sessionStorage');
        return;
      }
      
      console.log('📋 [Compte] Avatar en attente trouvé dans', source);
      const pendingAvatar = JSON.parse(pendingAvatarStr);
      
      // Si trouvé dans sessionStorage mais pas localStorage, copier dans localStorage
      if (source === 'sessionStorage') {
        localStorage.setItem('zigzag_pending_avatar', pendingAvatarStr);
        console.log('📋 [Compte] Avatar copié de sessionStorage vers localStorage');
      }
      console.log('📋 [Compte] Détails avatar en attente:', {
        userId: pendingAvatar.userId,
        currentUserId: user.id,
        match: pendingAvatar.userId === user.id,
        fileName: pendingAvatar.fileName,
        fileSize: pendingAvatar.fileSize
      });
      
      // Vérifier que l'avatar correspond à l'utilisateur connecté
      if (pendingAvatar.userId === user.id) {
        console.log('📸 [Compte] Avatar en attente détecté, upload en cours...');
        logger.debug('📸 Avatar en attente détecté sur la page compte, upload en cours...');
        await uploadPendingAvatar(user.id, pendingAvatar);
      } else {
        console.log('⚠️ [Compte] Avatar en attente pour un autre utilisateur, suppression');
        // Avatar d'un autre utilisateur, le supprimer
        localStorage.removeItem('zigzag_pending_avatar');
      }
    } catch (err) {
      console.error('❌ [Compte] Erreur vérification avatar en attente:', err);
      logger.error('Erreur vérification avatar en attente:', err);
    }
  };

  const uploadPendingAvatar = async (userId: string, avatarData: any) => {
    try {
      console.log('📸 [Compte] Début upload avatar en attente pour utilisateur:', userId);
      logger.debug('📸 Début upload avatar en attente pour utilisateur:', userId);
      
      // Convertir base64 en Blob
      console.log('🔄 [Compte] Conversion base64 en Blob...');
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
      
      console.log('📁 [Compte] Nom de fichier:', fileName);
      console.log('📏 [Compte] Taille du fichier:', avatarData.fileSize, 'bytes');
      logger.debug('📁 Nom de fichier:', fileName);
      
      // Vérifier que le bucket existe
      console.log('🔍 [Compte] Vérification du bucket avatars...');
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('❌ [Compte] Erreur lors de la vérification des buckets:', listError);
        logger.error('Erreur lors de la vérification des buckets:', listError);
        toast.error('Erreur lors de la vérification du bucket');
        return;
      }
      
      const avatarsBucket = buckets?.find(b => b.id === 'avatars');
      if (!avatarsBucket) {
        console.error('❌ [Compte] Bucket "avatars" non trouvé');
        logger.error('❌ Bucket "avatars" non trouvé');
        toast.error('Le bucket "avatars" n\'existe pas. Veuillez le créer dans Supabase Dashboard > Storage.');
        return;
      } else {
        console.log('✅ [Compte] Bucket "avatars" trouvé:', avatarsBucket);
      }
      
      // Uploader
      console.log('⬆️ [Compte] Upload vers Supabase Storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: avatarData.fileType,
          upsert: true,
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error('❌ [Compte] Erreur upload avatar:', uploadError);
        console.error('❌ [Compte] Détails:', JSON.stringify(uploadError, null, 2));
        logger.error('❌ Erreur upload avatar:', uploadError);
        if (uploadError.message.includes('new row violates row-level security policy')) {
          toast.error('Les politiques RLS ne sont pas configurées. Exécutez sql/12_avatars_storage_setup.sql dans Supabase.');
        } else {
          toast.error('Erreur lors de l\'upload de l\'avatar: ' + uploadError.message);
        }
        return;
      }
      
      console.log('✅ [Compte] Upload réussi:', uploadData);
      logger.debug('✅ Upload réussi:', uploadData);
      
      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const avatarUrl = urlData.publicUrl;
      console.log('🔗 [Compte] URL publique de l\'avatar:', avatarUrl);
      
      // Mettre à jour user_metadata
      console.log('🔄 [Compte] Mise à jour user_metadata...');
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl
        }
      });
      
      if (updateError) {
        console.error('❌ [Compte] Erreur mise à jour avatar dans user_metadata:', updateError);
        logger.error('❌ Erreur mise à jour avatar dans user_metadata:', updateError);
      } else {
        console.log('✅ [Compte] Avatar mis à jour dans user_metadata');
        logger.debug('✅ Avatar mis à jour dans user_metadata');
      }
      
      // Mettre à jour la table users
      console.log('🔄 [Compte] Mise à jour table users...');
      const { error: updateUsersError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);
      
      if (updateUsersError) {
        console.error('❌ [Compte] Erreur mise à jour avatar dans table users:', updateUsersError);
        logger.error('❌ Erreur mise à jour avatar dans table users:', updateUsersError);
      } else {
        console.log('✅ [Compte] Avatar mis à jour dans table users');
        logger.debug('✅ Avatar mis à jour dans table users');
      }
      
      // Supprimer l'avatar en attente
      localStorage.removeItem('zigzag_pending_avatar');
      console.log('🗑️ [Compte] Avatar en attente supprimé après upload réussi');
      logger.debug('🗑️ Avatar en attente supprimé après upload réussi');
      
      // Rafraîchir la page pour afficher le nouvel avatar
      console.log('🔄 [Compte] Rafraîchissement de la page...');
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      toast.success('Photo de profil uploadée avec succès !');
      console.log('🎉 [Compte] Avatar uploadé avec succès !');
    } catch (err) {
      console.error('❌ [Compte] Erreur lors de l\'upload de l\'avatar en attente:', err);
      logger.error('Erreur lors de l\'upload de l\'avatar en attente:', err);
      toast.error('Erreur lors de l\'upload de l\'avatar');
    }
  };

  const loadUserStats = async () => {
    if (!user?.id) return;

    try {
      setLoadingStats(true);

      // Compter les parties créées
      const { count: totalGames } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Compter les parties terminées
      const { count: completedGames } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // Compter les étapes créées
      const { count: totalSteps } = await supabase
        .from('steps')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        totalGames: totalGames || 0,
        completedGames: completedGames || 0,
        totalSteps: totalSteps || 0,
        createdAt: user.created_at || null,
      });
    } catch (error) {
      logger.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Déconnexion réussie');
      router.push('/jeu');
    } catch (error) {
      logger.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.onchange = handleAvatarChange;
    input.click();
  };

  const handleAvatarChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !user?.id) return;

    // Valider la taille (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image est trop grande (max 2 MB)');
      return;
    }

    // Valider le format
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      toast.error('Format d\'image non supporté. Utilisez JPG, PNG, WEBP ou GIF.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      logger.debug('📸 Début upload avatar pour utilisateur:', user.id);
      
      // Déterminer l'extension
      const extension = fileExtension;
      const fileName = `${user.id}/avatar.${extension}`;
      logger.debug('📁 Nom de fichier:', fileName);
      logger.debug('📏 Taille du fichier:', file.size, 'bytes');

      // Vérifier d'abord si le bucket existe
      logger.debug('🔍 Vérification du bucket avatars...');
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        logger.error('Erreur lors de la vérification des buckets:', listError);
      } else {
        const avatarsBucket = buckets?.find(b => b.id === 'avatars');
        if (!avatarsBucket) {
          logger.error('❌ Bucket "avatars" non trouvé');
          toast.error('Le bucket "avatars" n\'existe pas. Veuillez le créer dans Supabase Dashboard > Storage. Voir sql/README_AVATARS.md pour les instructions.');
          setIsUploadingAvatar(false);
          return;
        } else {
          logger.debug('✅ Bucket "avatars" trouvé:', avatarsBucket);
        }
      }

      // Uploader vers Supabase Storage
      logger.debug('⬆️ Upload vers Supabase Storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        logger.error('❌ Erreur upload avatar:', uploadError);
        logger.error('Détails:', JSON.stringify(uploadError, null, 2));
        
        let errorMsg = 'Erreur lors de l\'upload de la photo.';
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('does not exist') || uploadError.message.includes('not found')) {
          errorMsg = 'Le bucket "avatars" n\'existe pas. Veuillez le créer dans Supabase Dashboard > Storage.';
        } else if (uploadError.message.includes('new row violates row-level security policy') || uploadError.message.includes('RLS')) {
          errorMsg = 'Les politiques RLS ne sont pas configurées. Exécutez sql/12_avatars_storage_setup.sql dans Supabase.';
        } else if (uploadError.message.includes('File size limit')) {
          errorMsg = 'Le fichier est trop volumineux (max 2 MB).';
        } else {
          errorMsg = 'Erreur: ' + uploadError.message;
        }
        toast.error(errorMsg);
        setIsUploadingAvatar(false);
        return;
      }
      
      logger.debug('✅ Upload réussi:', uploadData);

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;
      logger.debug('🔗 URL publique de l\'avatar:', avatarUrl);

      // Mettre à jour user_metadata
      logger.debug('🔄 Mise à jour user_metadata...');
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl
        }
      });

      if (updateError) {
        logger.error('❌ Erreur mise à jour avatar dans user_metadata:', updateError);
        toast.error('Erreur lors de la mise à jour du profil');
        setIsUploadingAvatar(false);
        return;
      } else {
        logger.debug('✅ Avatar mis à jour dans user_metadata');
      }

      // Mettre à jour la table users
      logger.debug('🔄 Mise à jour table users...');
      const { error: updateUsersError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateUsersError) {
        logger.error('❌ Erreur mise à jour avatar dans table users:', updateUsersError);
        // Ce n'est pas bloquant, l'avatar est déjà dans user_metadata
      } else {
        logger.debug('✅ Avatar sauvegardé avec succès dans user_metadata et table users');
      }

      // Rafraîchir la session pour mettre à jour user_metadata
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // La session sera automatiquement mise à jour via onAuthStateChange
        // On force un refresh en rechargeant la page après un court délai
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }

      toast.success('Photo de profil mise à jour avec succès !');
    } catch (error) {
      logger.error('Erreur lors de l\'upload de l\'avatar:', error);
      toast.error('Une erreur inattendue est survenue');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (authLoading || loadingStats) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #40C4D4 0%, #F54291 50%, #FF912D 100%)'
      }}>
        <LoadingSpinner size="large" message="Chargement..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = user.user_metadata?.username || user.email?.split('@')[0] || 'Joueur';
  const getInitials = () => {
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const headerStyle = {
    background: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))',
    backgroundImage: 'linear-gradient(90deg, rgba(64, 196, 212, 0.85), rgba(255, 145, 45, 0.85), rgba(245, 66, 145, 0.85))'
  };

  return (
    <div className="compte-container">
      <header className="compte-header" style={headerStyle}>
        <div className="header-content">
          <Link href="/jeu" className="logo-link">
            <img
              src="/assets/logo.png"
              alt="ZigZag"
              className="header-logo"
            />
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="compte-content">
        <div className="container">
          <div className="compte-card">
            <div className="compte-header-section">
              <div 
                className="compte-avatar-large compte-avatar-editable"
                onClick={handleAvatarClick}
                style={{ cursor: isUploadingAvatar ? 'wait' : 'pointer' }}
                title={isUploadingAvatar ? 'Upload en cours...' : 'Cliquez pour modifier la photo'}
              >
                {isUploadingAvatar ? (
                  <div className="avatar-upload-spinner">
                    <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  </div>
                ) : user.user_metadata?.avatar_url ? (
                  <>
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={displayName}
                    className="compte-avatar-img"
                  />
                    <div className="avatar-edit-overlay">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </div>
                  </>
                ) : (
                  <>
                  <span className="compte-avatar-initials">{getInitials()}</span>
                    <div className="avatar-edit-overlay">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </div>
                  </>
                )}
              </div>
              <div className="compte-info">
                <h1 className="compte-name">{displayName}</h1>
                <p className="compte-email">{user.email}</p>
                {user.user_metadata?.username && (
                  <p className="compte-username">@{user.user_metadata.username}</p>
                )}
              </div>
            </div>

            <div className="compte-divider"></div>

            <section className="compte-section">
              <h2 className="section-title">Statistiques</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon stat-icon-games">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="3" x2="9" y2="21"/>
                      <line x1="15" y1="3" x2="15" y2="21"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="3" y1="15" x2="21" y2="15"/>
                    </svg>
                  </div>
                  <div className="stat-value">{stats?.totalGames || 0}</div>
                  <div className="stat-label">Parties créées</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-completed">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div className="stat-value">{stats?.completedGames || 0}</div>
                  <div className="stat-label">Parties terminées</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-icon-steps">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="stat-value">{stats?.totalSteps || 0}</div>
                  <div className="stat-label">Étapes créées</div>
                </div>
              </div>
            </section>

            <div className="compte-divider"></div>

            <section className="compte-section">
              <h2 className="section-title">Informations</h2>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Membre depuis</span>
                  <span className="info-value">{formatDate(user.created_at)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">ID utilisateur</span>
                  <span className="info-value info-value-small">{user.id}</span>
                </div>
              </div>
            </section>

            <div className="compte-divider"></div>

            <section className="compte-section">
              <button 
                className="btn-signout"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <>
                    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    <span>Déconnexion...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span>Se déconnecter</span>
                  </>
                )}
              </button>
            </section>
          </div>
        </div>
      </main>

      <style jsx>{`
        .compte-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #40C4D4 0%, #F54291 50%, #FF912D 100%);
        }

        .compte-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 20px 0;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          transition: transform 0.2s ease;
        }

        .logo-link:hover {
          transform: scale(1.05);
        }

        .header-logo {
          height: 50px;
          width: auto;
        }

        .compte-content {
          padding: 40px 20px;
        }

        .compte-card {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
          padding: 40px;
        }

        .compte-header-section {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
        }

        .compte-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--rose), var(--orange));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          border: 4px solid rgba(255, 255, 255, 0.5);
          position: relative;
          transition: all 0.3s ease;
        }

        .compte-avatar-editable:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(245, 66, 145, 0.4);
        }

        .avatar-edit-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 50%;
        }

        .compte-avatar-editable:hover .avatar-edit-overlay {
          opacity: 1;
        }

        .avatar-upload-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: white;
        }

        .compte-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .compte-avatar-initials {
          color: white;
          font-weight: 800;
          font-size: 40px;
          font-family: 'Poppins', sans-serif;
        }

        .compte-info {
          flex: 1;
        }

        .compte-name {
          font-family: 'Poppins', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: var(--charcoal);
          margin-bottom: 8px;
        }

        .compte-email {
          font-size: 16px;
          color: rgba(44, 42, 53, 0.7);
          margin-bottom: 4px;
        }

        .compte-username {
          font-size: 14px;
          color: var(--rose);
          font-weight: 600;
        }

        .compte-divider {
          height: 1px;
          background: rgba(44, 42, 53, 0.1);
          margin: 32px 0;
        }

        .compte-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-family: 'Poppins', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--charcoal);
          margin-bottom: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: rgba(245, 66, 145, 0.05);
          border: 2px solid rgba(245, 66, 145, 0.1);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(245, 66, 145, 0.2);
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .stat-icon-games {
          background: linear-gradient(135deg, rgba(64, 196, 212, 0.2), rgba(64, 196, 212, 0.4));
          color: var(--turquoise);
        }

        .stat-icon-completed {
          background: linear-gradient(135deg, rgba(46, 213, 115, 0.2), rgba(46, 213, 115, 0.4));
          color: #2ed573;
        }

        .stat-icon-steps {
          background: linear-gradient(135deg, rgba(255, 145, 45, 0.2), rgba(255, 145, 45, 0.4));
          color: var(--orange);
        }

        .stat-value {
          font-family: 'Poppins', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: var(--charcoal);
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(44, 42, 53, 0.7);
          font-weight: 500;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(245, 66, 145, 0.05);
          border-radius: 12px;
        }

        .info-label {
          font-weight: 600;
          color: var(--charcoal);
        }

        .info-value {
          color: rgba(44, 42, 53, 0.7);
          font-size: 14px;
        }

        .info-value-small {
          font-size: 12px;
          font-family: monospace;
          word-break: break-all;
          text-align: right;
          max-width: 60%;
        }

        .btn-signout {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 71, 87, 0.1);
          border: 2px solid rgba(255, 71, 87, 0.3);
          border-radius: 12px;
          color: #ff4757;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Poppins', sans-serif;
        }

        .btn-signout:hover:not(:disabled) {
          background: rgba(255, 71, 87, 0.2);
          border-color: rgba(255, 71, 87, 0.5);
          transform: translateY(-2px);
        }

        .btn-signout:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .compte-card {
            padding: 24px;
          }

          .compte-header-section {
            flex-direction: column;
            text-align: center;
          }

          .compte-name {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
