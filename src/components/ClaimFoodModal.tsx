import { useState } from "react";
import {
  XMarkIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { supabase, TABLES } from "../supabase";

interface ClaimFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
}

export default function ClaimFoodModal({
  isOpen,
  onClose,
  listing,
}: ClaimFoodModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    pickupDate: "",
    pickupTime: "",
    contactMethod: "phone",
    phone: "",
    email: user?.email || "",
    notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user) {
      setError("Please sign in to claim food.");
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.pickupDate || !formData.pickupTime) {
      setError("Please select pickup date and time.");
      setLoading(false);
      return;
    }

    if (formData.contactMethod === "phone" && !formData.phone) {
      setError("Please provide your phone number.");
      setLoading(false);
      return;
    }

    if (formData.contactMethod === "email" && !formData.email) {
      setError("Please provide your email address.");
      setLoading(false);
      return;
    }

    try {
      const pickupDateTime = new Date(
        `${formData.pickupDate}T${formData.pickupTime}`
      );

      // Get donor information from the listing
      const { data: listingData, error: listingError } = await supabase
        .from(TABLES.FOOD_LISTINGS)
        .select("*")
        .eq("id", listing.id)
        .single();

      if (listingError) throw listingError;

      const donorId = listingData?.donor_id;

      // Create claim record
      const { data: claimData, error: claimError } = await supabase
        .from(TABLES.FOOD_CLAIMS)
        .insert({
          listing_id: listing.id,
          claimant_id: user.id,
          claimant_name: user.user_metadata?.name || user.email,
          claimant_email: user.email,
          pickup_date_time: pickupDateTime.toISOString(),
          contact_method: formData.contactMethod,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (claimError) throw claimError;

      // Create notification for donor
      if (donorId) {
        const { error: notificationError } = await supabase
          .from(TABLES.NOTIFICATIONS)
          .insert({
            user_id: donorId,
            type: "food_claim",
            title: "New Food Claim Request",
            message: `${
              user.user_metadata?.name || user.email
            } wants to claim your food: ${listing.title}`,
            read: false,
            created_at: new Date().toISOString(),
            related_id: claimData.id,
          });

        if (notificationError) {
          console.error("Failed to create notification:", notificationError);
        }
      }

      // Update listing status
      const { error: updateError } = await supabase
        .from(TABLES.FOOD_LISTINGS)
        .update({
          status: "claimed",
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
        })
        .eq("id", listing.id);

      if (updateError) throw updateError;

      setSuccess("Food claimed successfully! The donor will be notified.");
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show updated status
      }, 2000);
    } catch (err: any) {
      setError("Failed to claim food. Please try again.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Claim Free Food
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Food Details */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900">{listing.title}</h4>
            <p className="text-sm text-gray-600">{listing.quantity}</p>
            <p className="text-sm text-gray-600">
              Location: {listing.pickupLocation?.city}
            </p>
          </div>

          {/* Pickup Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <ClockIcon className="inline w-4 h-4 mr-1" />
                Pickup Date *
              </label>
              <input
                type="date"
                value={formData.pickupDate}
                onChange={(e) =>
                  handleInputChange("pickupDate", e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Pickup Time *
              </label>
              <input
                type="time"
                value={formData.pickupTime}
                onChange={(e) =>
                  handleInputChange("pickupTime", e.target.value)
                }
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Contact Method */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Preferred Contact Method *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="phone"
                  checked={formData.contactMethod === "phone"}
                  onChange={(e) =>
                    handleInputChange("contactMethod", e.target.value)
                  }
                  className="mr-2"
                />
                <PhoneIcon className="w-4 h-4 mr-1" />
                Phone
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="email"
                  checked={formData.contactMethod === "email"}
                  onChange={(e) =>
                    handleInputChange("contactMethod", e.target.value)
                  }
                  className="mr-2"
                />
                <EnvelopeIcon className="w-4 h-4 mr-1" />
                Email
              </label>
            </div>
          </div>

          {/* Contact Details */}
          {formData.contactMethod === "phone" && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+94 XX XXX XXXX"
                className="input-field"
                required
              />
            </div>
          )}

          {formData.contactMethod === "email" && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="input-field"
                required
              />
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any special requirements or messages..."
              rows={3}
              className="input-field"
            />
          </div>

          {/* Safety Reminder */}
          <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 mr-2 text-yellow-600" />
              <div>
                <h5 className="text-sm font-medium text-yellow-800">
                  Food Safety Reminder
                </h5>
                <p className="text-xs text-yellow-700">
                  Please check food quality upon pickup and consume before
                  expiry time.
                </p>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? "Claiming..." : "Claim Food"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
