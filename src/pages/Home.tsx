import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  HeartIcon,
  UsersIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import ImpactCard from "../components/ImpactCard";
import FoodCard from "../components/FoodCard";
import StoryCard from "../components/StoryCard";
import useCollection from "../hooks/useCollection";
import ClaimFoodModal from "../components/ClaimFoodModal";
import RequestFoodModal from "../components/RequestFoodModal";
import DeliveryModal from "../components/DeliveryModal";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

export default function Home() {
  const { user } = useAuth();

  // Modal states
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  // Load Firestore data for food listings, categories, users, stories (collections)
  const { documents: foodListings = [], loading: listingsLoading } =
    useCollection("food_listings");
  const { documents: foodCategories = [], loading: categoriesLoading } =
    useCollection("food_categories");
  const { documents: users = [], loading: usersLoading } =
    useCollection("users");
  const { documents: communityStories = [], loading: storiesLoading } =
    useCollection("community_stories");

  // --- Fetch impact stats from Supabase stats table ---
  const [impactStats, setImpactStats] = useState({
    totalMealsShared: 0,
    totalUsersActive: 0,
    totalFoodWasteSaved: 0,
    co2Saved: 0,
  });
  const [impactLoading, setImpactLoading] = useState(true);

  useEffect(() => {
    async function fetchImpactStats() {
      setImpactLoading(true);
      try {
        const { data, error } = await supabase
          .from('stats')
          .select('*')
          .eq('type', 'impact')
          .single();
        
        if (error) throw error;
        if (data) {
          setImpactStats({
            totalMealsShared: data.total_meals_shared || 0,
            totalUsersActive: data.total_users_active || 0,
            totalFoodWasteSaved: data.total_food_waste_saved || 0,
            co2Saved: data.co2_saved || 0,
          });
        }
      } catch (e) {
        // Optionally handle error here
      }
      setImpactLoading(false);
    }
    fetchImpactStats();
  }, []);

  // Pick top 3 for featured, top 2 for stories
  const featuredListings = foodListings.slice(0, 3);
  const featuredStories = communityStories.slice(0, 2);

  const handleClaim = (listing: any) => {
    if (!user) {
      alert("Please sign in to claim food.");
      return;
    }
    setSelectedListing(listing);
    setClaimModalOpen(true);
  };

  const handleRequest = (listing: any) => {
    if (!user) {
      alert("Please sign in to request food.");
      return;
    }
    setSelectedListing(listing);
    setRequestModalOpen(true);
  };

  const handleDelivery = (listing: any) => {
    if (!user) {
      alert("Please sign in to request delivery.");
      return;
    }
    setSelectedListing(listing);
    setDeliveryModalOpen(true);
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-white hero-gradient">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl animate-fade-in">
              Bridge the Gap Between
              <span className="block text-secondary-300">Surplus & Need</span>
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-xl text-green-100 md:text-2xl animate-slide-up">
              Join Sri Lanka's youth-led movement to reduce food waste and fight
              hunger. Connect surplus food with those who need it most.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row animate-slide-up">
              <Link to="/find-food" className="px-8 py-3 text-lg btn-secondary">
                Find Food Near You
              </Link>
              <Link
                to="/donate"
                className="px-8 py-3 text-lg text-white border-white btn-outline hover:bg-white hover:text-primary-600"
              >
                Donate Surplus Food
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Our Community Impact
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Together, we're making a real difference in reducing food waste
              and supporting communities across Sri Lanka.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ImpactCard
              title="Meals Shared"
              value={
                impactLoading
                  ? "..."
                  : impactStats.totalMealsShared?.toLocaleString?.() ?? "0"
              }
              subtitle="Nutritious meals distributed"
              icon={<HeartIcon className="w-6 h-6" />}
              color="primary"
              trend={{ value: 23, label: "vs last month" }}
            />
            <ImpactCard
              title="Active Users"
              value={
                impactLoading
                  ? "..."
                  : impactStats.totalUsersActive?.toLocaleString?.() ?? "0"
              }
              subtitle="Community members"
              icon={<UsersIcon className="w-6 h-6" />}
              color="accent"
              trend={{ value: 15, label: "vs last month" }}
            />
            <ImpactCard
              title="Food Waste Saved"
              value={
                impactLoading
                  ? "..."
                  : impactStats.totalFoodWasteSaved
                  ? `${impactStats.totalFoodWasteSaved.toLocaleString()}kg`
                  : "0kg"
              }
              subtitle="Prevented from landfills"
              icon={<GlobeAltIcon className="w-6 h-6" />}
              color="secondary"
              trend={{ value: 31, label: "vs last month" }}
            />
            <ImpactCard
              title="CO₂ Reduced"
              value={
                impactLoading
                  ? "..."
                  : impactStats.co2Saved
                  ? `${impactStats.co2Saved.toLocaleString()}kg`
                  : "0kg"
              }
              subtitle="Environmental impact"
              icon={<GlobeAltIcon className="w-6 h-6" />}
              color="primary"
              trend={{ value: 18, label: "vs last month" }}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              How MealBridge Works
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Simple steps to make a big impact in your community
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                List Surplus Food
              </h3>
              <p className="text-gray-600">
                Restaurants, bakeries, and households can easily list their
                surplus food with photos, expiry times, and pickup details.
              </p>
            </div>
            {/* Step 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-100">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Find & Request
              </h3>
              <p className="text-gray-600">
                Recipients browse available food by location, request items they
                need, and get matched with nearby donations.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-accent-100">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Pickup & Deliver
              </h3>
              <p className="text-gray-600">
                Volunteers help with deliveries, or recipients can arrange
                direct pickup. Everyone wins!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Food Listings */}
      <section className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                Available Food Near You
              </h2>
              <p className="text-gray-600">
                Fresh donations from your community
              </p>
            </div>
            <Link
              to="/find-food"
              className="flex items-center space-x-2 btn-outline"
            >
              <span>View All</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {listingsLoading || categoriesLoading || usersLoading ? (
            <div className="py-12 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredListings.map((listing) => (
                <FoodCard
                  key={listing.id}
                  listing={listing}
                  foodCategories={foodCategories}
                  users={users}
                  onClaim={() => handleClaim(listing)}
                  onRequest={() => handleRequest(listing)}
                  onDelivery={() => handleDelivery(listing)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community Stories */}
      <section className="py-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                Community Stories
              </h2>
              <p className="text-gray-600">Real impact from real people</p>
            </div>
            <Link
              to="/community"
              className="flex items-center space-x-2 btn-outline"
            >
              <span>Read More</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {storiesLoading ? (
            <div className="py-12 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {featuredStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onLike={(id) => console.log("Like:", id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 text-white community-gradient">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Make a Difference?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-xl text-orange-100">
            Join thousands of Sri Lankans who are already part of the MealBridge
            community. Every meal shared is a step towards a more sustainable
            future.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/auth"
              className="px-8 py-3 text-lg bg-white btn-primary text-secondary-600 hover:bg-gray-100"
            >
              Join MealBridge Today
            </Link>
            <Link
              to="/auth"
              className="px-8 py-3 text-lg text-white border-white btn-outline hover:bg-white hover:text-secondary-600"
            >
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Modals */}
      {selectedListing && (
        <>
          <ClaimFoodModal
            isOpen={claimModalOpen}
            onClose={() => {
              setClaimModalOpen(false);
              setSelectedListing(null);
            }}
            listing={selectedListing}
          />
          <RequestFoodModal
            isOpen={requestModalOpen}
            onClose={() => {
              setRequestModalOpen(false);
              setSelectedListing(null);
            }}
            listing={selectedListing}
          />
          <DeliveryModal
            isOpen={deliveryModalOpen}
            onClose={() => {
              setDeliveryModalOpen(false);
              setSelectedListing(null);
            }}
            listing={selectedListing}
          />
        </>
      )}
    </div>
  );
}
