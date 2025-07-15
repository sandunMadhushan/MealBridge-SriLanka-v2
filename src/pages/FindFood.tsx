import { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import FoodCard from "../components/FoodCard";
import { mockFoodListings, foodCategories } from "../data/mockData";
import { cn } from "../utils/cn";

export default function FindFood() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const locations = [
    "All Locations",
    "Colombo",
    "Kandy",
    "Galle",
    "Jaffna",
    "Negombo",
  ];
  const types = ["All Types", "Free", "Half Price"];

  const filteredListings = mockFoodListings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || listing.category.id === selectedCategory;
    const matchesType =
      !selectedType ||
      selectedType === "All Types" ||
      (selectedType === "Free" && listing.type === "free") ||
      (selectedType === "Half Price" && listing.type === "half-price");
    const matchesLocation =
      !selectedLocation ||
      selectedLocation === "All Locations" ||
      listing.pickupLocation.city === selectedLocation;

    return matchesSearch && matchesCategory && matchesType && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Food Near You
            </h1>
            <p className="text-lg text-gray-600">
              Discover fresh surplus food from your community
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <FunnelIcon className="h-5 w-5" />
                </button>
              </div>

              <div
                className={cn(
                  "space-y-6",
                  showFilters ? "block" : "hidden lg:block"
                )}
              >
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="inline h-4 w-4 mr-1" />
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="input-field"
                  >
                    {locations.map((location) => (
                      <option
                        key={location}
                        value={location === "All Locations" ? "" : location}
                      >
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="input-field"
                  >
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        !selectedCategory
                          ? "bg-primary-100 text-primary-800"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      All Categories
                    </button>
                    {foodCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2",
                          selectedCategory === category.id
                            ? "bg-primary-100 text-primary-800"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {filteredListings.length} food items available
              </p>
              <select className="input-field w-auto">
                <option>Sort by: Newest</option>
                <option>Sort by: Expiry Time</option>
                <option>Sort by: Distance</option>
                <option>Sort by: Type</option>
              </select>
            </div>

            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <FoodCard
                    key={listing.id}
                    listing={listing}
                    onClaim={(id) => console.log("Claim:", id)}
                    onRequest={(id) => console.log("Request:", id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No food items found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or check back later for new
                  listings.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedType("");
                    setSelectedLocation("");
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
