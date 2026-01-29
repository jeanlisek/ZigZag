-- ============================================
-- MISE À JOUR: Ajouter tous les jours à la checklist
-- ============================================
-- Exécutez ce script dans le SQL Editor de Supabase
-- pour permettre tous les jours de la semaine dans la checklist
-- ============================================

-- Supprimer l'ancienne contrainte CHECK
ALTER TABLE public.weekly_checklist 
DROP CONSTRAINT IF EXISTS weekly_checklist_day_check;

-- Ajouter la nouvelle contrainte avec tous les jours
ALTER TABLE public.weekly_checklist 
ADD CONSTRAINT weekly_checklist_day_check 
CHECK (day IN ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'));

-- Vérification
-- SELECT column_name, check_clause 
-- FROM information_schema.check_constraints 
-- WHERE constraint_name = 'weekly_checklist_day_check';

