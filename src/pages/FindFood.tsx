import { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import FoodCard from "../components/FoodCard";
import { cn } from "../utils/cn";
import useCollection from "../hooks/useCollection";

export default function FindFood() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // LIVE DATA
  const { documents: foodListings = [], loading: listingsLoading } =
    useCollection("foodListings");
  const { documents: foodCategories = [], loading: categoriesLoading } =
    useCollection("foodCategories");
  const { documents: users = [], loading: usersLoading } =
    useCollection("users");

  const locations = [
    "All Locations",
    "Colombo",
    "Kandy",
    "Galle",
    "Jaffna",
    "Negombo",
  ];
  const types = ["All Types", "Free", "Half Price"];

  // For today's reference date since you included one:
  // const now = new Date("2025-07-18T15:46:00+05:30");
  // To always use real time:
  const now = new Date();

  // Look up and fill category object if only id provided
  function getCategoryObj(categoryField: any) {
    if (
      categoryField &&
      typeof categoryField === "object" &&
      categoryField.name
    )
      return categoryField;
    if (typeof categoryField === "string" && foodCategories.length > 0) {
      return (
        foodCategories.find((cat: any) => cat.id === categoryField) || {
          name: "Uncategorized",
          icon: "❓",
          color: "bg-gray-200 text-gray-700",
        }
      );
    }
    return {
      name: "Uncategorized",
      icon: "❓",
      color: "bg-gray-200 text-gray-700",
    };
  }

  // Look up donor info from users if needed
  function getDonorObj(donorField: any) {
    if (donorField && donorField.name) return donorField;
    if (donorField && donorField.email) {
      return (
        users.find((u: any) => u.email === donorField.email) || {
          name: donorField.email,
          stats: { donationsGiven: "?" },
        }
      );
    }
    if (donorField && donorField.id) {
      return (
        users.find((u: any) => u.id === donorField.id) || {
          name: "Unknown Donor",
          stats: { donationsGiven: "?" },
        }
      );
    }
    return { name: "Unknown Donor", stats: { donationsGiven: "?" } };
  }

  // Defensive expiry date conversion
  function toDate(val: any): Date | null {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (val.toDate && typeof val.toDate === "function") return val.toDate();
    if (typeof val === "string" || typeof val === "number") {
      const d = new Date(val);
      return isNaN(d.valueOf()) ? null : d;
    }
    return null;
  }

  const filteredListings = useMemo(() => {
    return foodListings.filter((listing: any) => {
      const matchesSearch =
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        (listing.category?.id || listing.category) === selectedCategory;
      const matchesType =
        !selectedType ||
        selectedType === "All Types" ||
        (selectedType === "Free" && listing.type === "free") ||
        (selectedType === "Half Price" && listing.type === "half-price");
      const matchesLocation =
        !selectedLocation ||
        selectedLocation === "All Locations" ||
        listing.pickupLocation?.city === selectedLocation;
      return matchesSearch && matchesCategory && matchesType && matchesLocation;
    });
  }, [
    foodListings,
    searchTerm,
    selectedCategory,
    selectedType,
    selectedLocation,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Find Food Near You
            </h1>
            <p className="text-lg text-gray-600">
              Discover fresh surplus food from your community
            </p>
          </div>
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search for food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <div className="flex-shrink-0 lg:w-64">
            <div className="sticky p-6 bg-white rounded-lg shadow-sm top-24">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <FunnelIcon className="w-5 h-5" />
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <MapPinIcon className="inline w-4 h-4 mr-1" />
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
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
                  <label className="block mb-3 text-sm font-medium text-gray-700">
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
                    {foodCategories.map((category: any) => (
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
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredListings.length} food items available
              </p>
              <select className="w-auto input-field">
                <option>Sort by: Newest</option>
                <option>Sort by: Expiry Time</option>
                <option>Sort by: Distance</option>
                <option>Sort by: Type</option>
              </select>
            </div>
            {listingsLoading || categoriesLoading || usersLoading ? (
              <div className="py-12 text-center">Loading...</div>
            ) : filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map((listing: any) => {
                  // fill in category/donor for each listing
                  const displayCategory = getCategoryObj(listing.category);
                  const displayDonor = getDonorObj(listing.donor);

                  // use spread to include them in FoodCard:
                  return (
                    <FoodCard
                      key={listing.id}
                      listing={{
                        ...listing,
                        category: displayCategory,
                        donor: displayDonor,
                      }}
                      onClaim={(id: string) => console.log("Claim:", id)}
                      onRequest={(id: string) => console.log("Request:", id)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No food items found
                </h3>
                <p className="mb-4 text-gray-600">
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
