import { useState } from "react";
import {
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { supabase, TABLES } from "../supabase";

interface RequestFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
}

export default function RequestFoodModal({
  isOpen,
  onClose,
  listing,
}: RequestFoodModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    quantity: "1",
    pickupDate: "",
    pickupTime: "",
    paymentMethod: "cash",
    phone: "",
    email: user?.email || "",
    notes: "",
  });

  const basePrice = listing.price || 0;
  const totalPrice = basePrice * parseInt(formData.quantity || "1");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user) {
      setError("Please sign in to request food.");
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.pickupDate || !formData.pickupTime) {
      setError("Please select pickup date and time.");
      setLoading(false);
      return;
    }

    if (!formData.phone) {
      setError("Please provide your phone number.");
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

      // Create request record
      const { data: requestData, error: requestError } = await supabase
        .from(TABLES.FOOD_REQUESTS)
        .insert({
          listing_id: listing.id,
          requester_id: user.id,
          requester_name: user.user_metadata?.name || user.email,
          requester_email: user.email,
          quantity: parseInt(formData.quantity),
          total_price: totalPrice,
          pickup_date_time: pickupDateTime.toISOString(),
          payment_method: formData.paymentMethod,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Create notification for donor
      if (donorId) {
        const { error: notificationError } = await supabase
          .from(TABLES.NOTIFICATIONS)
          .insert({
            user_id: donorId,
            type: "food_request",
            title: "New Food Purchase Request",
            message: `${
              user.user_metadata?.name || user.email
            } wants to buy your food: ${listing.title} (${
              formData.quantity
            } servings for LKR ${totalPrice})`,
            is_read: false,
            created_at: new Date().toISOString(),
            related_id: requestData.id,
          });

        if (notificationError) {
          console.error("Failed to create notification:", notificationError);
        }
      }
      setSuccess("Request submitted successfully! The donor will be notified.");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError("Failed to submit request. Please try again.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Request Food</h3>
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
              Location:{" "}
              {listing.pickupLocation?.city || listing.pickup_location?.city}
            </p>
            <p className="text-sm font-medium text-secondary-600">
              Price: LKR {basePrice} per serving
            </p>
          </div>

          {/* Quantity Selection */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Quantity *
            </label>
            <select
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              className="input-field"
              required
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num.toString()}>
                  {num} serving{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Total Price */}
          <div className="p-3 border rounded-lg border-secondary-200 bg-secondary-50">
            <div className="flex items-center justify-between">
              <span className="font-medium text-secondary-900">
                Total Price:
              </span>
              <span className="text-lg font-bold text-secondary-600">
                LKR {totalPrice.toLocaleString()}
              </span>
            </div>
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

          {/* Payment Method */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <CurrencyDollarIcon className="inline w-4 h-4 mr-1" />
              Payment Method *
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="cash"
                  checked={formData.paymentMethod === "cash"}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                  className="mr-3"
                />
                <span className="mr-2 text-2xl">💵</span>
                <span>Cash on Pickup</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="mobile"
                  checked={formData.paymentMethod === "mobile"}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                  className="mr-3"
                />
                <DevicePhoneMobileIcon className="w-5 h-5 mr-2" />
                <span>Mobile Payment (eZ Cash, Dialog Pay)</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="card"
                  checked={formData.paymentMethod === "card"}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                  className="mr-3"
                />
                <CreditCardIcon className="w-5 h-5 mr-2" />
                <span>Card Payment</span>
              </label>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 gap-4">
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
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="input-field"
              />
            </div>
          </div>

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
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
