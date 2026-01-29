-- ============================================
-- Migration 06 : Fonction de vérification de disponibilité username
-- ============================================
-- Date : 2025-01-XX
-- Description : Ajoute une fonction SQL sécurisée pour vérifier si un username est disponible
--               Permet aux utilisateurs non authentifiés (anon) de vérifier la disponibilité
--               sans exposer les données sensibles de la table users

-- Fonction pour vérifier la disponibilité d'un username
-- Accessible publiquement (anon) mais ne retourne que l'existence, pas les données sensibles
CREATE OR REPLACE FUNCTION public.check_username_available(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier si le username existe (insensible à la casse)
    RETURN NOT EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE LOWER(username) = LOWER(username_to_check)
    );
END;
$$;

-- Donner les permissions pour que les utilisateurs anon puissent l'appeler
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO authenticated;

-- Commentaire pour documentation
COMMENT ON FUNCTION public.check_username_available IS 'Vérifie si un username est disponible. Retourne TRUE si disponible, FALSE si déjà pris. Accessible publiquement. Sécurisé : ne retourne que l''existence, pas les données sensibles.';






