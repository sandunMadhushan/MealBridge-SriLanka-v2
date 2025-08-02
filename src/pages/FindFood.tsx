import { useState, useMemo, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import FoodCard from "../components/FoodCard";
import { cn } from "../utils/cn";
import useCollection from "../hooks/useCollection";
import useFoodListingsWithDonors from "../hooks/useFoodListingsWithDonors";
import ClaimFoodModal from "../components/ClaimFoodModal";
import RequestFoodModal from "../components/RequestFoodModal";
import DeliveryModal from "../components/DeliveryModal";
import EditFoodModal from "../components/EditFoodModal";
import { useAuth } from "../context/AuthContext";
import { TABLES } from "../supabase";

export default function FindFood() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    city: string;
    district: string;
  } | null>(null);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);

  // Modal states
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const { user } = useAuth();

  // LIVE DATA
  const {
    listings: foodListings = [],
    loading: listingsLoading,
    refresh: refreshListings,
  } = useFoodListingsWithDonors();
  const { documents: foodCategories = [], loading: categoriesLoading } =
    useCollection(TABLES.FOOD_CATEGORIES);
  const { documents: users = [], loading: usersLoading } = useCollection(
    TABLES.USERS
  );

  // Get unique locations from food listings
  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>();
    foodListings.forEach((listing: any) => {
      if (listing.pickup_location?.city) {
        uniqueLocations.add(listing.pickup_location.city);
      }
    });

    const locationArray = ["All Locations"];
    if (userLocation) {
      locationArray.push(`Your Location (${userLocation.city})`);
    }
    locationArray.push(...Array.from(uniqueLocations).sort());

    return locationArray;
  }, [foodListings, userLocation]);

  const types = ["All Types", "Free", "Half Price"];

  // Request location permission on component mount
  useEffect(() => {
    if (!locationPermissionAsked && navigator.geolocation) {
      setLocationPermissionAsked(true);

      const requestLocation = () => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Use reverse geocoding to get city/district
              // For demo purposes, we'll simulate this with a simple mapping
              // In production, you'd use a service like Google Maps Geocoding API
              const { latitude, longitude } = position.coords;

              // Simulate reverse geocoding based on coordinates
              let city = "Unknown";
              let district = "Unknown";

              // Simple coordinate-based city detection for Sri Lanka
              if (
                latitude >= 6.9 &&
                latitude <= 7.0 &&
                longitude >= 79.8 &&
                longitude <= 80.0
              ) {
                city = "Colombo";
                district = "Colombo";
              } else if (
                latitude >= 7.2 &&
                latitude <= 7.4 &&
                longitude >= 80.6 &&
                longitude <= 80.8
              ) {
                city = "Kandy";
                district = "Kandy";
              } else if (
                latitude >= 6.0 &&
                latitude <= 6.1 &&
                longitude >= 80.2 &&
                longitude <= 80.3
              ) {
                city = "Galle";
                district = "Galle";
              }

              setUserLocation({ city, district });
              setSelectedLocation(`Your Location (${city})`);
            } catch (error) {
              console.error("Error getting location details:", error);
            }
          },
          (error) => {
            console.log("Location permission denied or error:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      };

      // Ask for permission with a small delay to ensure UI is ready
      setTimeout(requestLocation, 1000);
    }
  }, [locationPermissionAsked]);
  // For today's reference date since you included one:
  // const now = new Date("2025-07-18T15:46:00+05:30");
  // To always use real time:
  // const now = new Date();

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

  // Defensive expiry date conversion
  // function toDate(val: any): Date | null {
  //   if (!val) return null;
  //   if (val instanceof Date) return val;
  //   if (val.toDate && typeof val.toDate === "function") return val.toDate();
  //   if (typeof val === "string" || typeof val === "number") {
  //     const d = new Date(val);
  //     return isNaN(d.valueOf()) ? null : d;
  //   }
  //   return null;
  // }

  const filteredAndSortedListings = useMemo(() => {
    let filtered = foodListings.filter((listing: any) => {
      const matchesSearch =
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        (listing.category_id || listing.category?.id || listing.category) ===
          selectedCategory;
      const matchesType =
        !selectedType ||
        selectedType === "All Types" ||
        (selectedType === "Free" && listing.type === "free") ||
        (selectedType === "Half Price" && listing.type === "half-price");

      let matchesLocation = true;
      if (selectedLocation && selectedLocation !== "All Locations") {
        if (selectedLocation.startsWith("Your Location")) {
          // Match user's location
          matchesLocation =
            !!userLocation &&
            (listing.pickup_location?.city === userLocation.city ||
              listing.pickup_location?.district === userLocation.district);
        } else {
          matchesLocation = listing.pickup_location?.city === selectedLocation;
        }
      }

      return matchesSearch && matchesCategory && matchesType && matchesLocation;
    });

    // Sort by location proximity if user location is available
    if (userLocation && selectedLocation.startsWith("Your Location")) {
      filtered.sort((a: any, b: any) => {
        const aIsUserCity = a.pickup_location?.city === userLocation.city;
        const bIsUserCity = b.pickup_location?.city === userLocation.city;
        const aIsUserDistrict =
          a.pickup_location?.district === userLocation.district;
        const bIsUserDistrict =
          b.pickup_location?.district === userLocation.district;

        // Prioritize: same city > same district > others
        if (aIsUserCity && !bIsUserCity) return -1;
        if (!aIsUserCity && bIsUserCity) return 1;
        if (aIsUserDistrict && !bIsUserDistrict) return -1;
        if (!aIsUserDistrict && bIsUserDistrict) return 1;

        return 0;
      });
    }

    // Sort unavailable items (quantity = 0 or status not available) to the end
    filtered.sort((a: any, b: any) => {
      // Parse quantity from string (e.g., "5 servings" -> 5)
      const parseQuantity = (qty: any) => {
        if (!qty) return 0;
        if (typeof qty === "number") return qty;
        if (typeof qty === "string") {
          const match = qty.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        }
        return 0;
      };

      const aQuantity = parseQuantity(a.quantity);
      const bQuantity = parseQuantity(b.quantity);
      const aUnavailable = aQuantity <= 0 || a.status !== "available";
      const bUnavailable = bQuantity <= 0 || b.status !== "available";

      if (aUnavailable && !bUnavailable) return 1;
      if (!aUnavailable && bUnavailable) return -1;
      return 0;
    });

    return filtered;
  }, [
    foodListings,
    searchTerm,
    selectedCategory,
    selectedType,
    selectedLocation,
    userLocation,
  ]);

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

  const handleEdit = (listing: any) => {
    setSelectedListing(listing);
    setEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Find Food Near You
            </h1>
            <div className="text-lg text-gray-600">
              <p>Discover fresh surplus food from your community</p>
              {userLocation && (
                <p className="mt-1 text-sm text-primary-600">
                  📍 Showing results near {userLocation.city},{" "}
                  {userLocation.district}
                </p>
              )}
            </div>
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
                {filteredAndSortedListings.length} food items available
                {userLocation &&
                  selectedLocation.startsWith("Your Location") && (
                    <span className="text-primary-600">
                      {" "}
                      (sorted by proximity)
                    </span>
                  )}
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
            ) : filteredAndSortedListings.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredAndSortedListings.map((listing: any) => {
                  // fill in category for each listing
                  const displayCategory = getCategoryObj(
                    listing.category_id || listing.category
                  );

                  // Use the donor data from the hook directly (it's already enriched)
                  const displayDonor = listing.donor || {
                    name: listing.donor_name || "Unknown Donor",
                    stats: { donationsGiven: listing.donation_count || "?" },
                  };

                  // Normalize the data structure for FoodCard
                  const normalizedListing = {
                    ...listing,
                    category: displayCategory,
                    donor: displayDonor,
                    pickupLocation: listing.pickup_location, // Map pickup_location to pickupLocation
                    expiryDate: listing.expiry_date, // Map expiry_date to expiryDate
                    images: listing.image_urls || [], // Map image_urls to images
                    deliveryRequested: listing.delivery_requested, // Map delivery_requested to deliveryRequested
                  };

                  // use spread to include them in FoodCard:
                  return (
                    <FoodCard
                      key={listing.id}
                      foodCategories={foodCategories}
                      users={users}
                      listing={normalizedListing}
                      currentUserId={user?.id}
                      onClaim={() => handleClaim(listing)}
                      onRequest={() => handleRequest(listing)}
                      onDelivery={() => handleDelivery(listing)}
                      onEdit={() => handleEdit(listing)}
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
          <EditFoodModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedListing(null);
            }}
            listing={selectedListing}
            onListingUpdated={() => {
              // Manually refresh the listings to ensure immediate update
              refreshListings();
            }}
          />
        </>
      )}
    </div>
  );
}
