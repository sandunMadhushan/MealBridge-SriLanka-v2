import { useState, useEffect, useCallback } from "react";
import { supabase, TABLES } from "../supabase";
import { FoodListingWithDonor } from "../types";

function useFoodListingsWithDonors() {
  const [listings, setListings] = useState<FoodListingWithDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListingsWithDonors = useCallback(async () => {
    setLoading(true);
    try {
      // First, get all food listings
      const { data: foodListings, error: listingsError } = await supabase
        .from(TABLES.FOOD_LISTINGS)
        .select("*");

      if (listingsError) throw listingsError;

      if (!foodListings || foodListings.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      // Debug: Log the first listing to see available fields
      console.log("First food listing structure:", foodListings[0]);

      // Get unique donor IDs - use donor_id as the primary field
      const donorIds = [
        ...new Set(
          foodListings.map((listing) => listing.donor_id).filter(Boolean)
        ),
      ];

      console.log("Found donor IDs:", donorIds);

      // Get donor information from users table
      const { data: donors, error: donorsError } = await supabase
        .from(TABLES.USERS)
        .select("id, email, name, profile_image_url")
        .in("id", donorIds);

      if (donorsError) {
        console.warn("Could not fetch donor details:", donorsError);
      }

      console.log("Found donors:", donors);

      // Calculate donation counts for each donor
      const donationCounts: { [key: string]: number } = {};
      for (const donorId of donorIds) {
        console.log("Calculating donations for donor:", donorId);

        // First, let's see what data is actually in the table for this donor
        const { data: donorListings } = await supabase
          .from(TABLES.FOOD_LISTINGS)
          .select("id, donor_id, title")
          .eq("donor_id", donorId);

        console.log(`Listings for donor ${donorId}:`, donorListings);

        // Now get the count
        const { count, error: countError } = await supabase
          .from(TABLES.FOOD_LISTINGS)
          .select("*", { count: "exact", head: true })
          .eq("donor_id", donorId);

        if (countError) {
          console.warn(
            "Error counting donations for donor",
            donorId,
            countError
          );
        }

        console.log(`Donor ${donorId} has ${count} donations`);
        donationCounts[donorId] = count || 0;
      }

      console.log("Final donation counts:", donationCounts);

      // Combine the data
      const enrichedListings = foodListings.map((listing) => {
        const donorId = listing.donor_id; // Use donor_id as the primary field
        const donor = donors?.find((d) => d.id === donorId);

        console.log("Processing listing:", {
          listing_id: listing.id,
          donor_id: listing.donor_id,
          resolved_donor_id: donorId,
          found_donor: donor,
          donation_count_for_donor: donationCounts[donorId],
        });

        return {
          ...listing,
          donor_name: donor?.name || donor?.email || "Unknown Donor",
          donor_email: donor?.email,
          donor_avatar: donor?.profile_image_url,
          donation_count: donationCounts[donorId] || 0,
          // Create a normalized donor object for FoodCard compatibility
          donor: {
            id: donorId,
            name: donor?.name || donor?.email || "Unknown Donor",
            email: donor?.email,
            avatar_url: donor?.profile_image_url,
            stats: {
              donationsGiven: donationCounts[donorId] || 0,
            },
          },
        };
      });

      setListings(enrichedListings);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setListings([]);
      console.error("Error fetching food listings with donors:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchListingsWithDonors();
  }, [fetchListingsWithDonors]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("food_listings_with_donors")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLES.FOOD_LISTINGS,
        },
        (payload) => {
          console.log("Food listings changed:", payload);
          fetchListingsWithDonors();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchListingsWithDonors]);

  return { listings, loading, error, refresh: fetchListingsWithDonors };
}

export default useFoodListingsWithDonors;
