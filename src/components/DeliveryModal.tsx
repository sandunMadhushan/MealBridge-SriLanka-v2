import { useState } from "react";
import {
  XMarkIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../utils/cn";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
}

export default function DeliveryModal({
  isOpen,
  onClose,
  listing,
}: DeliveryModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    deliveryAddress: "",
    city: "",
    district: "",
    deliveryDate: "",
    deliveryTime: "",
    phone: "",
    email: user?.email || "",
    specialInstructions: "",
  });

  // Calculate delivery fee based on district
  const getDeliveryFee = (district: string) => {
    const fees: { [key: string]: number } = {
      Colombo: 200,
      Kandy: 300,
      Galle: 350,
      Jaffna: 500,
      Negombo: 250,
      Matara: 400,
      Kurunegala: 350,
    };
    return fees[district] || 300;
  };

  const deliveryFee = getDeliveryFee(formData.district);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user) {
      setError("Please sign in to request delivery.");
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.deliveryAddress || !formData.city || !formData.district) {
      setError("Please provide complete delivery address.");
      setLoading(false);
      return;
    }

    if (!formData.deliveryDate || !formData.deliveryTime) {
      setError("Please select delivery date and time.");
      setLoading(false);
      return;
    }

    if (!formData.phone) {
      setError("Please provide your phone number.");
      setLoading(false);
      return;
    }

    try {
      const deliveryDateTime = new Date(`${formData.deliveryDate}T${formData.deliveryTime}`);

      // Create delivery request record
      await addDoc(collection(db, "deliveryRequests"), {
        listingId: listing.id,
        requesterId: user.uid,
        requesterName: user.displayName || user.email,
        requesterEmail: user.email,
        deliveryAddress: {
          address: formData.deliveryAddress,
          city: formData.city,
          district: formData.district,
        },
        deliveryDateTime: Timestamp.fromDate(deliveryDateTime),
        deliveryFee: deliveryFee,
        phone: formData.phone,
        email: formData.email,
        specialInstructions: formData.specialInstructions,
        status: "pending",
        createdAt: Timestamp.now(),
      });

      setSuccess("Delivery request submitted! A volunteer will be assigned soon.");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError("Failed to submit delivery request. Please try again.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            <TruckIcon className="inline w-5 h-5 mr-2" />
            Request Delivery
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
              From: {listing.pickupLocation?.city}
            </p>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <MapPinIcon className="inline w-4 h-4 mr-1" />
              Delivery Address *
            </label>
            <input
              type="text"
              value={formData.deliveryAddress}
              onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
              placeholder="Street address, building name, etc."
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                District *
              </label>
              <select
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select district</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Negombo">Negombo</option>
                <option value="Matara">Matara</option>
                <option value="Kurunegala">Kurunegala</option>
              </select>
            </div>
          </div>

          {/* Delivery Fee */}
          {formData.district && (
            <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-900">
                  <CurrencyDollarIcon className="inline w-4 h-4 mr-1" />
                  Delivery Fee:
                </span>
                <span className="font-bold text-orange-600">
                  LKR {deliveryFee}
                </span>
              </div>
            </div>
          )}

          {/* Delivery Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <ClockIcon className="inline w-4 h-4 mr-1" />
                Delivery Date *
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Preferred Time *
              </label>
              <select
                value={formData.deliveryTime}
                onChange={(e) => handleInputChange("deliveryTime", e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select time</option>
                <option value="09:00">9:00 AM - 11:00 AM</option>
                <option value="11:00">11:00 AM - 1:00 PM</option>
                <option value="13:00">1:00 PM - 3:00 PM</option>
                <option value="15:00">3:00 PM - 5:00 PM</option>
                <option value="17:00">5:00 PM - 7:00 PM</option>
              </select>
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

          {/* Special Instructions */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Special Delivery Instructions (Optional)
            </label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
              placeholder="Building entrance, floor number, landmarks, etc."
              rows={3}
              className="input-field"
            />
          </div>

          {/* Volunteer Info */}
          <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 mt-0.5 mr-2 text-blue-600" />
              <div>
                <h5 className="text-sm font-medium text-blue-800">
                  Volunteer Delivery
                </h5>
                <p className="text-xs text-blue-700">
                  Our volunteers will handle the pickup and delivery. You'll receive
                  tracking updates and volunteer contact details.
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
              {loading ? "Submitting..." : "Request Delivery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}