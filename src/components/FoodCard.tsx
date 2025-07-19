import { FoodListing } from "../types";
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../utils/cn";

interface FoodCardProps {
  listing: FoodListing;
  foodCategories: any[];
  users: any[];
  onClaim?: (id: string) => void;
  onRequest?: (id: string) => void;
  onDelivery?: () => void;
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
  onClaim,
  onRequest,
  onDelivery,
}: FoodCardProps) {
  const expiryDate = toDate(listing.expiryDate);
  const now = Date.now();
  const timeUntilExpiry =
    expiryDate && expiryDate.getTime
      ? Math.ceil((expiryDate.getTime() - now) / (1000 * 60 * 60))
      : null;
  const isUrgent = timeUntilExpiry !== null && timeUntilExpiry <= 6;

  const category = getCategoryObj(listing.category, foodCategories);
  const donor = getDonorObj(listing.donor, users);
  const donorName = donor.name || "Unknown Donor";
  const donorInitial = donor.name ? donor.name.charAt(0) : "?";
  const donationsGiven =
    typeof donor.stats?.donationsGiven === "number"
      ? donor.stats.donationsGiven
      : "?";

  return (
    <div className="transition-all duration-300 card hover:shadow-lg group">
      {/* Image */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img
          src={
            listing.images?.[0] ||
            "https://via.placeholder.com/300x200?text=No+Image"
          }
          alt={listing.title}
          className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
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
        {isUrgent && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full animate-pulse">
              Urgent
            </span>
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
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100">
            <span className="text-sm font-medium text-primary-600">
              {donorInitial}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{donorName}</p>
            <p className="text-xs text-gray-500">{`${donationsGiven} donations`}</p>
          </div>
        </div>
        {/* Actions */}
        <div className="flex pt-2 space-x-2">
          {listing.type === "free" ? (
            <button
              onClick={() => onClaim?.(listing.id)}
              className="flex-1 text-sm btn-primary"
              disabled={listing.status !== "available"}
            >
              {listing.status === "available" ? "Claim Food" : "Not Available"}
            </button>
          ) : (
            <button
              onClick={() => onRequest?.(listing.id)}
              className="flex-1 text-sm btn-secondary"
              disabled={listing.status !== "available"}
            >
              {listing.status === "available"
                ? "Request Food"
                : "Not Available"}
            </button>
          )}
          {listing.deliveryRequested && (
            <button 
              onClick={onDelivery}
              className="px-3 text-sm btn-outline"
              disabled={listing.status !== "available"}
            >
              🚚 Delivery
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
