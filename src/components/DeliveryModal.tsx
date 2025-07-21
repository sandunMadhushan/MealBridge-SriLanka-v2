import { useState } from "react";
import {
  XMarkIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, Timestamp, getDoc, doc } from "firebase/firestore";

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
    postalCode: "",
    deliveryDate: "",
    deliveryTime: "",
    phone: "",
    email: user?.email || "",
    specialInstructions: "",
    urgentDelivery: false,
  });

  const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
    "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
    "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
    "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
    "Trincomalee", "Vavuniya"
  ];

  // Calculate delivery fee based on district and urgency
  const calculateDeliveryFee = () => {
    let baseFee = 200; // Base fee in LKR
    
    // Distance-based pricing
    const districtFees: { [key: string]: number } = {
      "Colombo": 200,
      "Gampaha": 250,
      "Kalutara": 300,
      "Kandy": 400,
      "Galle": 350,
      "Matara": 400,
      "Hambantota": 450,
      "Jaffna": 500,
      "Anuradhapura": 450,
      "Polonnaruwa": 400,
      "Kurunegala": 350,
      "Puttalam": 400,
      "Ratnapura": 350,
      "Kegalle": 300,
      "Badulla": 400,
      "Monaragala": 450,
      "Trincomalee": 450,
      "Batticaloa": 400,
      "Ampara": 400,
      "Nuwara Eliya": 350,
      "Matale": 350,
      "Vavuniya": 450,
      "Mannar": 500,
      "Kilinochchi": 500,
      "Mullaitivu": 500,
    };

    baseFee = districtFees[formData.district] || 300;
    
    // Urgent delivery surcharge
    if (formData.urgentDelivery) {
      baseFee += 100;
    }

    return baseFee;
  };

  const deliveryFee = calculateDeliveryFee();

  const handleInputChange = (field: string, value: string | boolean) => {
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
      setError("Please fill in all address fields.");
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
      const deliveryDateTime = new Date(
        `${formData.deliveryDate}T${formData.deliveryTime}`
      );

      // Get donor information from the listing
      const listingDoc = await getDoc(doc(db, "foodListings", listing.id));
      const listingData = listingDoc.data();
      const donorId = listingData?.donor?.id;

      // Create delivery request record
      const deliveryRef = await addDoc(collection(db, "deliveryRequests"), {
        listingId: listing.id,
        requesterId: user.uid,
        requesterName: user.displayName || user.email,
        requesterEmail: user.email,
        deliveryAddress: {
          address: formData.deliveryAddress,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
        },
        deliveryDateTime: Timestamp.fromDate(deliveryDateTime),
        phone: formData.phone,
        email: formData.email,
        specialInstructions: formData.specialInstructions,
        urgentDelivery: formData.urgentDelivery,
        deliveryFee: deliveryFee,
        status: "pending",
        createdAt: Timestamp.now(),
      });

      // Create notification for donor
      if (donorId) {
        await addDoc(collection(db, "notifications"), {
          userId: donorId,
          type: "delivery_request",
          title: "New Delivery Request",
          message: `${user.displayName || user.email} requested delivery for: ${listing.title} to ${formData.city}, ${formData.district}`,
          read: false,
          createdAt: Timestamp.now(),
          relatedId: deliveryRef.id,
        });
      }

      // Create notifications for volunteers in the same district
      // Note: In a real app, you'd query volunteers by location
      const volunteersQuery = collection(db, "users");
      const volunteersSnapshot = await getDocs(volunteersQuery);
      
      volunteersSnapshot.docs.forEach(async (volunteerDoc) => {
        const volunteerData = volunteerDoc.data();
        if (volunteerData.role === "volunteer" && 
            (volunteerData.location?.includes(formData.district) || 
             volunteerData.district === formData.district)) {
          await addDoc(collection(db, "notifications"), {
            userId: volunteerDoc.id,
            type: "delivery_request",
            title: "New Delivery Opportunity",
            message: `Delivery needed in ${formData.district} - Fee: LKR ${deliveryFee}`,
            read: false,
            createdAt: Timestamp.now(),
            relatedId: deliveryRef.id,
          });
        }
      });

      setSuccess("Delivery request submitted successfully! Volunteers in your area will be notified.");
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
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
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
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <MapPinIcon className="inline w-4 h-4 mr-1" />
              Delivery Address *
            </label>
            <input
              type="text"
              value={formData.deliveryAddress}
              onChange={(e) =>
                handleInputChange("deliveryAddress", e.target.value)
              }
              placeholder="Street address, building name, apartment number"
              className="input-field"
              required
            />
          </div>

          {/* City and District */}
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
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Postal Code (Optional)
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleInputChange("postalCode", e.target.value)}
              placeholder="e.g., 10400"
              className="input-field"
            />
          </div>

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
                onChange={(e) =>
                  handleInputChange("deliveryDate", e.target.value)
                }
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
                onChange={(e) =>
                  handleInputChange("deliveryTime", e.target.value)
                }
                className="input-field"
                required
              >
                <option value="">Select time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="18:00">6:00 PM</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
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
              Special Instructions (Optional)
            </label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) =>
                handleInputChange("specialInstructions", e.target.value)
              }
              placeholder="Any special delivery instructions, landmarks, or notes for the volunteer..."
              rows={3}
              className="input-field"
            />
          </div>

          {/* Urgent Delivery Option */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.urgentDelivery}
                onChange={(e) =>
                  handleInputChange("urgentDelivery", e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Urgent delivery (+LKR 100)
              </span>
            </label>
          </div>

          {/* Delivery Fee */}
          <div className="p-4 border rounded-lg border-primary-200 bg-primary-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2 text-primary-600" />
                <span className="font-medium text-primary-900">
                  Delivery Fee:
                </span>
              </div>
              <span className="text-lg font-bold text-primary-600">
                LKR {deliveryFee.toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-primary-700">
              Fee varies by distance and urgency. Payment to volunteer on delivery.
            </p>
          </div>

          {/* Volunteer Information */}
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 mt-0.5 mr-2 text-blue-600" />
              <div>
                <h5 className="text-sm font-medium text-blue-800">
                  About Our Volunteers
                </h5>
                <p className="text-xs text-blue-700">
                  Our verified volunteers will handle your delivery with care. 
                  You'll receive volunteer contact details once assigned.
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
              {loading ? "Requesting..." : `Request Delivery (LKR ${deliveryFee})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}