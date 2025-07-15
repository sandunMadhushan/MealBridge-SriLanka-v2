import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, HeartIcon, UsersIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import ImpactCard from '../components/ImpactCard';
import FoodCard from '../components/FoodCard';
import StoryCard from '../components/StoryCard';
import { impactStats, mockFoodListings, communityStories } from '../data/mockData';

export default function Home() {
  const featuredListings = mockFoodListings.slice(0, 3);
  const featuredStories = communityStories.slice(0, 2);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Bridge the Gap Between
              <span className="block text-secondary-300">Surplus & Need</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-green-100 animate-slide-up">
              Join Sri Lanka's youth-led movement to reduce food waste and fight hunger. 
              Connect surplus food with those who need it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/find-food" className="btn-secondary text-lg px-8 py-3">
                Find Food Near You
              </Link>
              <Link to="/donate" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
                Donate Surplus Food
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Community Impact</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Together, we're making a real difference in reducing food waste and supporting communities across Sri Lanka.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ImpactCard
              title="Meals Shared"
              value={impactStats.totalMealsShared}
              subtitle="Nutritious meals distributed"
              icon={<HeartIcon className="h-6 w-6" />}
              color="primary"
              trend={{ value: 23, label: 'vs last month' }}
            />
            <ImpactCard
              title="Active Users"
              value={impactStats.totalUsersActive}
              subtitle="Community members"
              icon={<UsersIcon className="h-6 w-6" />}
              color="accent"
              trend={{ value: 15, label: 'vs last month' }}
            />
            <ImpactCard
              title="Food Waste Saved"
              value={`${impactStats.totalFoodWasteSaved}kg`}
              subtitle="Prevented from landfills"
              icon={<GlobeAltIcon className="h-6 w-6" />}
              color="secondary"
              trend={{ value: 31, label: 'vs last month' }}
            />
            <ImpactCard
              title="CO₂ Reduced"
              value={`${impactStats.co2Saved}kg`}
              subtitle="Environmental impact"
              icon={<GlobeAltIcon className="h-6 w-6" />}
              color="primary"
              trend={{ value: 18, label: 'vs last month' }}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How MealBridge Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to make a big impact in your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">List Surplus Food</h3>
              <p className="text-gray-600">
                Restaurants, bakeries, and households can easily list their surplus food with photos, expiry times, and pickup details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find & Request</h3>
              <p className="text-gray-600">
                Recipients browse available food by location, request items they need, and get matched with nearby donations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pickup & Deliver</h3>
              <p className="text-gray-600">
                Volunteers help with deliveries, or recipients can arrange direct pickup. Everyone wins!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Food Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Food Near You</h2>
              <p className="text-gray-600">Fresh donations from your community</p>
            </div>
            <Link to="/find-food" className="btn-outline flex items-center space-x-2">
              <span>View All</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <FoodCard
                key={listing.id}
                listing={listing}
                onClaim={(id) => console.log('Claim:', id)}
                onRequest={(id) => console.log('Request:', id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Community Stories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Stories</h2>
              <p className="text-gray-600">Real impact from real people</p>
            </div>
            <Link to="/community" className="btn-outline flex items-center space-x-2">
              <span>Read More</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onLike={(id) => console.log('Like:', id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="community-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 text-orange-100 max-w-2xl mx-auto">
            Join thousands of Sri Lankans who are already part of the MealBridge community. 
            Every meal shared is a step towards a more sustainable future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="btn-primary bg-white text-secondary-600 hover:bg-gray-100 text-lg px-8 py-3">
              Join MealBridge Today
            </Link>
            <Link to="/volunteer" className="btn-outline border-white text-white hover:bg-white hover:text-secondary-600 text-lg px-8 py-3">
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}