import { z } from 'zod';

/**
 * Schémas de validation pour les entrées utilisateur
 */

// Validation du texte
export const textStepSchema = z.object({
  content: z
    .string()
    .min(1, 'Le texte ne peut pas être vide')
    .max(500, 'Le texte ne peut pas dépasser 500 caractères')
    .trim(),
});

// Validation du dessin (base64)
export const drawingStepSchema = z.object({
  content: z
    .string()
    .min(1, 'Le dessin ne peut pas être vide')
    .refine(
      (val) => val.startsWith('data:image/') || val.startsWith('data:image/png;base64,'),
      'Le format du dessin est invalide (attendu: base64 PNG)'
    ),
});

// Validation de l'audio (blob URL temporaire ou URL publique HTTPS)
export const audioStepSchema = z.object({
  content: z
    .string()
    .min(1, "L'enregistrement audio ne peut pas être vide")
    .refine(
      (val) =>
        val.startsWith('blob:') || // URL blob temporaire (avant upload)
        val.startsWith('https://'), // URL publique depuis Supabase Storage (après upload)
      "Le format de l'audio est invalide (attendu: blob: ou URL HTTPS)"
    ),
});

// Validation du code de room
export const roomCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Le code doit contenir exactement 6 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le code ne peut contenir que des lettres majuscules et des chiffres')
    .toUpperCase(),
});

// Validation du nickname
export const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, 'Le pseudo doit contenir au moins 2 caractères')
    .max(20, 'Le pseudo ne peut pas dépasser 20 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres, _ et -')
    .trim(),
});

// Validation de l'email (si nécessaire)
export const emailSchema = z.object({
  email: z.string().email('Email invalide'),
});

// Validation du mot de passe
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');

// Schéma pour la réinitialisation du mot de passe
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

// Fonction helper pour valider
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      };
    }
    return { success: false, error: 'Erreur de validation inconnue' };
  }
}
