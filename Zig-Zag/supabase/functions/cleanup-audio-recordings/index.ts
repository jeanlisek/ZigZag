// Edge Function: cleanup-audio-recordings
// Supprime automatiquement les fichiers audio des parties créées il y a plus de 24h
// Exécuter via cron job quotidiennement

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
    // Lire le body si présent (optionnel pour cette fonction)
    let body = null;
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
      // Body vide ou invalide, ce n'est pas grave pour cette fonction
      console.log("⚠️ Body vide ou invalide, continuons quand même");
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

    // 1. Obtenir la liste des parties à nettoyer (créées il y a plus de 24h)
    const { data: gamesToCleanup, error: queryError } = await supabaseAdmin
      .rpc("get_audio_cleanup_list");

    if (queryError) {
      console.error("❌ Erreur lors de la récupération des parties:", queryError);
      return new Response(
        JSON.stringify({ error: queryError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!gamesToCleanup || gamesToCleanup.length === 0) {
      console.log("✅ Aucune partie à nettoyer");
      return new Response(
        JSON.stringify({ 
          message: "Aucune partie à nettoyer",
          cleaned: 0 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`📋 ${gamesToCleanup.length} partie(s) à nettoyer`);

    let totalFilesDeleted = 0;
    let totalGamesCleaned = 0;
    const errors: string[] = [];

    // 2. Pour chaque partie, supprimer tous les fichiers audio
    for (const game of gamesToCleanup) {
      const gameId = game.game_id;
      const folderPath = `${gameId}/`;

      try {
        // Lister tous les fichiers dans le dossier audio-recordings/{game_id}/
        const { data: files, error: listError } = await supabaseAdmin.storage
          .from("audio-recordings")
          .list(folderPath, {
            limit: 1000, // Limite pour éviter les problèmes
            sortBy: { column: "name", order: "asc" },
          });

        if (listError) {
          console.error(`❌ Erreur listing fichiers pour ${gameId}:`, listError);
          errors.push(`Erreur listing ${gameId}: ${listError.message}`);
          continue;
        }

        if (!files || files.length === 0) {
          console.log(`ℹ️ Aucun fichier trouvé pour ${gameId}`);
          continue;
        }

        console.log(`🗑️ Suppression de ${files.length} fichier(s) pour ${gameId}`);

        // Supprimer tous les fichiers
        const filePaths = files.map((file) => `${folderPath}${file.name}`);
        
        const { data: deleteData, error: deleteError } = await supabaseAdmin.storage
          .from("audio-recordings")
          .remove(filePaths);

        if (deleteError) {
          console.error(`❌ Erreur suppression fichiers pour ${gameId}:`, deleteError);
          errors.push(`Erreur suppression ${gameId}: ${deleteError.message}`);
          continue;
        }

        totalFilesDeleted += files.length;
        totalGamesCleaned++;

        console.log(`✅ ${files.length} fichier(s) supprimé(s) pour ${gameId}`);

      } catch (error) {
        console.error(`❌ Erreur lors du nettoyage de ${gameId}:`, error);
        errors.push(`Erreur ${gameId}: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
      }
    }

    // 3. Retourner le résultat
    const result = {
      success: errors.length === 0,
      message: `Nettoyage terminé: ${totalGamesCleaned} partie(s) nettoyée(s), ${totalFilesDeleted} fichier(s) supprimé(s)`,
      stats: {
        gamesCleaned: totalGamesCleaned,
        filesDeleted: totalFilesDeleted,
        gamesProcessed: gamesToCleanup.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("✅ Nettoyage terminé:", result);

    return new Response(
      JSON.stringify(result),
      {
        status: errors.length === 0 ? 200 : 207, // 207 Multi-Status si certaines erreurs
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("❌ Erreur fatale:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erreur inconnue",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

