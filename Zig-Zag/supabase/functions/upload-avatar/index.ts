// Edge Function: upload-avatar
// Permet d'uploader un avatar lors de l'inscription, même si l'utilisateur n'est pas encore connecté
// Utilise le service_role pour contourner les restrictions RLS

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // SÉCURITÉ: Vérifier l'authentification via le header Authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentification requise" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Créer un client avec la clé anon pour vérifier le JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Extraire le token et vérifier l'utilisateur
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Lire le body
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userIdFromForm = formData.get("userId") as string;

    if (!file || !userIdFromForm) {
      return new Response(
        JSON.stringify({ error: "Fichier et userId requis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // SÉCURITÉ CRITIQUE: Vérifier que le userId correspond à l'utilisateur authentifié
    if (userIdFromForm !== user.id) {
      return new Response(
        JSON.stringify({ error: "Vous ne pouvez uploader un avatar que pour votre propre compte" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Utiliser le userId vérifié depuis le JWT (plus sûr)
    const userId = user.id;

    // Vérifier la taille (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Fichier trop volumineux (max 2 MB)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Vérifier le type MIME
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: "Type de fichier non supporté" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Créer le client Supabase avec service role pour avoir tous les droits
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Déterminer l'extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `${userId}/avatar.${fileExtension}`;

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("❌ Erreur upload avatar:", uploadError);
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Mettre à jour user_metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          avatar_url: avatarUrl,
        },
      }
    );

    if (updateError) {
      console.error("❌ Erreur mise à jour user_metadata:", updateError);
      // Ne pas échouer si la mise à jour user_metadata échoue, l'avatar est déjà uploadé
    }

    // Mettre à jour la table users
    const { error: updateUsersError } = await supabaseAdmin
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (updateUsersError) {
      console.error("❌ Erreur mise à jour table users:", updateUsersError);
      // Ne pas échouer si la mise à jour table users échoue, l'avatar est déjà uploadé
    }

    return new Response(
      JSON.stringify({
        success: true,
        avatarUrl: avatarUrl,
        fileName: fileName,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("❌ Erreur inattendue:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erreur inattendue",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

