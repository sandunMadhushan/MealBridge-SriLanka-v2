import { FoodListingWithDonor } from "../types";
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../utils/cn";

interface FoodCardProps {
  listing: FoodListingWithDonor;
  foodCategories: any[];
  users: any[];
  currentUserId?: string;
  onClaim?: (id: string) => void;
  onRequest?: (id: string) => void;
  onDelivery?: () => void;
  onEdit?: (listing: any) => void;
}

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

// Gets the full category object, whether stored as object or id
function getCategoryObj(categoryField: any, foodCategories: any[]) {
  if (categoryField && typeof categoryField === "object" && categoryField.name)
    return categoryField;
  if (typeof categoryField === "string" && foodCategories.length > 0)
    return (
      foodCategories.find((cat: any) => cat.id === categoryField) || {
        name: "Uncategorized",
        icon: "❓",
        color: "bg-gray-200 text-gray-700",
      }
    );
  return {
    name: "Uncategorized",
    icon: "❓",
    color: "bg-gray-200 text-gray-700",
  };
}

// Gets the full donor object (with name), whether stored as object, email, or id
function getDonorObj(donorField: any, users: any[]) {
  if (donorField && donorField.name) return donorField;
  // Find in users by email or id
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

export default function FoodCard({
  listing,
  foodCategories,
  users,
  currentUserId,
  onClaim,
  onRequest,
  onDelivery,
  onEdit,
}: FoodCardProps) {
  const expiryDate = toDate(listing.expiryDate);
  const now = Date.now();
  const timeUntilExpiry =
    expiryDate && expiryDate.getTime
      ? Math.ceil((expiryDate.getTime() - now) / (1000 * 60 * 60))
      : null;
  const isUrgent = timeUntilExpiry !== null && timeUntilExpiry <= 6;

  const category = getCategoryObj(listing.category, foodCategories);

  // Use the joined donor data from the new hook if available
  let donorName = "Unknown Donor";
  let donorInitial = "?";
  let donationsGiven: string | number = "?";
  let donorAvatar = null;

  if (listing.donor_name) {
    // Data from the new hook with joined donor info
    donorName = listing.donor_name;
    donorInitial = listing.donor_name.charAt(0);
    donationsGiven = listing.donation_count || 0;
    donorAvatar = listing.donor_avatar;
  } else {
    // Fallback to old method
    const donor = getDonorObj(listing.donor, users);
    donorName = donor.name || "Unknown Donor";
    donorInitial = donor.name ? donor.name.charAt(0) : "?";
    donationsGiven =
      typeof donor.stats?.donationsGiven === "number"
        ? donor.stats.donationsGiven
        : "?";
  }

  // Debug logging
  console.log("FoodCard donor debug:", {
    listing_id: listing.id,
    donor_name: donorName,
    donor_avatar: donorAvatar,
    donation_count: donationsGiven,
    created_by: listing.created_by,
    has_joined_data: !!listing.donor_name,
  });

  // Check if this is the donor's own listing
  const isDonorOwnListing =
    currentUserId &&
    (listing.donorId === currentUserId ||
      (listing as any).donor_id === currentUserId);

  // Check if listing is unavailable (quantity is 0 or status is not available)
  const parseQuantity = (qty: any) => {
    if (!qty) return 0;
    if (typeof qty === "number") return qty;
    if (typeof qty === "string") {
      const match = qty.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    }
    return 0;
  };

  const parsedQuantity = parseQuantity(listing.quantity);
  const isUnavailable = listing.status !== "available" || parsedQuantity <= 0;

  // Debug log for troubleshooting
  if (isDonorOwnListing) {
    console.log(`Food Card Debug - ${listing.title}:`, {
      quantity: listing.quantity,
      parsedQuantity,
      status: listing.status,
      isUnavailable,
    });
  }

  return (
    <div
      className={cn(
        "transition-all duration-300 card hover:shadow-lg group",
        isUnavailable && "opacity-60 bg-gray-100"
      )}
    >
      {/* Image */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img
          src={
            listing.images?.[0] ||
            "https://via.placeholder.com/300x200?text=No+Image"
          }
          alt={listing.title}
          className={cn(
            "object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105",
            isUnavailable && "grayscale"
          )}
        />
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              listing.type === "free"
                ? "bg-primary-100 text-primary-800"
                : "bg-secondary-100 text-secondary-800"
            )}
          >
            {listing.type === "free" ? "Free" : "Half Price"}
          </span>
        </div>
        {isUrgent && !isUnavailable && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full animate-pulse">
              Urgent
            </span>
          </div>
        )}
        {isUnavailable && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">
              Not Available
            </span>
          </div>
        )}
        {isDonorOwnListing && (
          <div className="absolute bottom-2 right-2">
            <button
              onClick={() => onEdit?.(listing)}
              className="p-2 text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-colors"
              title="Edit listing"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            {listing.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {listing.description}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              category.color
            )}
          >
            {category.icon} {category.name}
          </span>
          <span className="text-sm text-gray-500">• {listing.quantity}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {listing.pickupLocation?.city || "Unknown"}
            {listing.pickupLocation?.district
              ? `, ${listing.pickupLocation.district}`
              : ""}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span className={cn(isUrgent && "text-red-600 font-medium")}>
              {timeUntilExpiry !== null
                ? timeUntilExpiry > 0
                  ? `${timeUntilExpiry}h remaining`
                  : "Expired"
                : "No Expiry"}
            </span>
          </div>
        </div>
        {listing.type === "half-price" && listing.price && (
          <div className="flex items-center text-sm">
            <CurrencyDollarIcon className="w-4 h-4 mr-1 text-secondary-600" />
            <span className="font-medium text-secondary-600">
              LKR {listing.price}
            </span>
          </div>
        )}
        {/* Donor Info */}
        <div className="flex items-center pt-2 space-x-2 border-t border-gray-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 overflow-hidden">
            {donorAvatar ? (
              <img
                src={donorAvatar}
                alt={donorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-primary-600">
                {donorInitial}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{donorName}</p>
            <p className="text-xs text-gray-500">{`${donationsGiven} donations`}</p>
          </div>
        </div>
        {/* Actions */}
        <div className="flex pt-2 space-x-2">
          {isDonorOwnListing ? (
            <button
              onClick={() => onEdit?.(listing)}
              className="flex-1 text-sm btn-outline"
            >
              Edit Listing
            </button>
          ) : (
            <>
              {listing.type === "free" ? (
                <button
                  onClick={() => onClaim?.(listing.id)}
                  className={cn(
                    "flex-1 text-sm transition-colors",
                    isUnavailable
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "btn-primary"
                  )}
                  disabled={isUnavailable}
                >
                  {isUnavailable ? "Not Available" : "Claim Food"}
                </button>
              ) : (
                <button
                  onClick={() => onRequest?.(listing.id)}
                  className={cn(
                    "flex-1 text-sm transition-colors",
                    isUnavailable
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "btn-secondary"
                  )}
                  disabled={isUnavailable}
                >
                  {isUnavailable ? "Not Available" : "Request Food"}
                </button>
              )}
              {listing.deliveryRequested && !isUnavailable && (
                <button
                  onClick={onDelivery}
                  className="px-3 text-sm btn-outline"
                >
                  🚚 Delivery
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
