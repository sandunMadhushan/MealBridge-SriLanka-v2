export interface User {
  photoURL: any;
  id: string;
  email: string;
  name: string;
  role: "donor" | "recipient" | "volunteer" | "admin";
  avatar?: string;
  location: string;
  phone?: string;
  verified: boolean;
  joinedAt: Date;
  stats: UserStats;
}

export interface UserStats {
  donationsGiven?: number;
  donationsReceived?: number;
  volunteersHours?: number;
  impactScore: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface FoodListing {
  id: string;
  title: string;
  description: string;
  category: FoodCategory;
  quantity: string;
  expiryDate: Date;
  pickupLocation: Location;
  images: string[];
  donorId: string;
  donor: User;
  type: "free" | "half-price";
  price?: number;
  status: "available" | "claimed" | "completed" | "expired";
  createdAt: Date;
  claimedBy?: string;
  claimedAt?: Date;
  deliveryRequested: boolean;
  safetyChecklist: SafetyChecklist;
}

export interface Location {
  address: string;
  city: string;
  district: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SafetyChecklist {
  freshness: boolean;
  properStorage: boolean;
  hygieneStandards: boolean;
  labelingComplete: boolean;
  allergenInfo: string[];
}

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "new_listing"
    | "claim_approved"
    | "delivery_assigned"
    | "impact_milestone";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface ImpactStats {
  totalMealsShared: number;
  totalUsersActive: number;
  totalFoodWasteSaved: number; // in kg
  totalBusinessesJoined: number;
  co2Saved: number; // in kg
  peopleReached: number;
}

export interface VolunteerRequest {
  id: string;
  listingId: string;
  volunteerId: string;
  status: "pending" | "accepted" | "completed";
  pickupTime: Date;
  deliveryTime: Date;
  notes?: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  author?: User; // Optional for backward compatibility
  author_id?: string; // Database field
  author_name?: string; // Database field
  author_email?: string; // Database field
  author_photo_url?: string; // Database field for profile image
  images: string[];
  category: "success" | "impact" | "community";
  createdAt?: Date; // Legacy field
  created_at?: string; // Database field
  updated_at?: string; // Database field
  likes: number;
  liked_by?: string[]; // Database field
  status?: string; // Database field
  is_featured?: boolean; // Database field
}
