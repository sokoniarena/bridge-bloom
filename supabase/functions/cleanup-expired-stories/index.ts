import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get expired stories
    const { data: expiredStories, error: fetchError } = await supabase
      .from('fun_circle_stories')
      .select('id, images, user_id')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired stories:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredStories?.length || 0} expired stories to clean up`);

    let deletedImages = 0;
    let deletedStories = 0;

    if (expiredStories && expiredStories.length > 0) {
      // Delete images from storage
      for (const story of expiredStories) {
        if (story.images && story.images.length > 0) {
          for (const imageUrl of story.images) {
            try {
              // Extract path from URL
              const urlParts = imageUrl.split('/fun-circle/');
              if (urlParts.length > 1) {
                const imagePath = urlParts[1];
                const { error: deleteError } = await supabase.storage
                  .from('fun-circle')
                  .remove([imagePath]);
                
                if (!deleteError) {
                  deletedImages++;
                } else {
                  console.error('Error deleting image:', deleteError);
                }
              }
            } catch (e) {
              console.error('Error processing image deletion:', e);
            }
          }
        }
      }

      // Delete expired stories from database
      const storyIds = expiredStories.map(s => s.id);
      const { error: deleteError } = await supabase
        .from('fun_circle_stories')
        .delete()
        .in('id', storyIds);

      if (deleteError) {
        console.error('Error deleting stories:', deleteError);
        throw deleteError;
      }

      deletedStories = storyIds.length;
    }

    const result = {
      success: true,
      deletedStories,
      deletedImages,
      timestamp: new Date().toISOString(),
    };

    console.log('Cleanup completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cleanup error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});