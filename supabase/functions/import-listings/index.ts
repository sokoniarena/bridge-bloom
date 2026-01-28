import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Import raw listings data
import rawListings from "./data.json" with { type: "json" };

// Normalize phone number for consistent seller identification
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\?]/g, "").replace(/^0/, "254");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Starting import of ${rawListings.length} listings...`);

    // Admin user ID to exclude from deletion
    const adminUserId = "9a4d2fcb-847d-4ca5-8a93-e2e047c1bead";

    // Step 1: Clear existing listings (except admin user's)
    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .neq("user_id", adminUserId);

    if (deleteError) {
      console.error("Error deleting existing listings:", deleteError);
    } else {
      console.log("Cleared existing listings");
    }

    // Step 2: Group listings by seller (using normalized phone)
    const sellerMap = new Map<string, { seller: any; listings: any[] }>();

    for (const listing of rawListings) {
      const seller = listing.seller;
      const phone = normalizePhone(seller.phone || seller.whatsapp || "");
      
      if (!phone) {
        console.log(`Skipping listing ${listing.title} - no phone`);
        continue;
      }

      if (!sellerMap.has(phone)) {
        sellerMap.set(phone, { seller, listings: [] });
      }
      sellerMap.get(phone)!.listings.push(listing);
    }

    console.log(`Found ${sellerMap.size} unique sellers`);

    // Stats tracking
    let usersCreated = 0;
    let listingsCreated = 0;
    const errors: string[] = [];

    // Step 3: Create users and their listings
    for (const [phone, data] of sellerMap) {
      const { seller, listings } = data;
      const sellerName = seller.name || seller.username || "Seller";
      const email = `${phone}@kinembe.app`;
      
      try {
        let userId: string;
        const rawPhone = seller.phone || seller.whatsapp || "";
        
        // First check if user already exists via profile phone
        const { data: existingProfiles } = await supabase
          .from("profiles")
          .select("user_id")
          .or(`phone.eq.${rawPhone},phone.eq.0${phone.slice(3)}`)
          .limit(1);

        if (existingProfiles && existingProfiles.length > 0) {
          userId = existingProfiles[0].user_id;
          console.log(`Found existing user ${sellerName}`);
        } else {
          // Create new user account
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: `Kinembe${phone}!`,
            email_confirm: true,
            user_metadata: {
              username: sellerName,
              phone: seller.phone || seller.whatsapp,
            },
          });

          if (authError) {
            errors.push(`User ${sellerName}: ${authError.message}`);
            continue;
          }

          usersCreated++;
          userId = authData.user.id;

          // Update profile with seller info
          await supabase.from("profiles").update({
            username: sellerName,
            phone: seller.phone || seller.whatsapp,
            is_verified: seller.verified || false,
            location: listings[0]?.location || null,
          }).eq("user_id", userId);
        }

        // Insert all listings for this seller
        for (const listing of listings) {
          const { error: insertError } = await supabase.from("listings").insert({
            user_id: userId,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            original_price: listing.originalPrice,
            location: listing.location,
            category: listing.category,
            images: listing.images,
            listing_type: "product",
            status: "available",
            is_featured: listing.featured || false,
            is_negotiable: true,
          });

          if (insertError) {
            errors.push(`Listing ${listing.title}: ${insertError.message}`);
          } else {
            listingsCreated++;
          }
        }

        console.log(`Processed seller ${sellerName} with ${listings.length} listings`);

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`Seller ${sellerName}: ${message}`);
      }
    }

    const result = {
      success: true,
      summary: {
        totalListingsInFile: rawListings.length,
        uniqueSellers: sellerMap.size,
        usersCreated,
        listingsCreated,
        errorCount: errors.length,
      },
      errors: errors.slice(0, 20), // Show first 20 errors only
    };

    console.log("Import complete:", result.summary);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Import error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
