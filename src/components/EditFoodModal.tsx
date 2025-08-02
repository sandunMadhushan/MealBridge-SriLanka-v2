import { useState, useEffect } from "react";
import {
  XMarkIcon,
  ClockIcon,
  MapPinIcon,
  PhotoIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { supabase, TABLES } from "../supabase";

interface EditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  onListingUpdated: () => void;
}

export default function EditFoodModal({
  isOpen,
  onClose,
  listing,
  onListingUpdated,
}: EditFoodModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    type: "free",
    price: "",
    category_id: "",
    pickup_location: {
      address: "",
      city: "",
      district: "",
      postalCode: "",
    },
    pickup_date: "",
    pickup_time: "",
    expiry_date: "",
    expiry_time: "",
    allergen_info: "",
    preparation_notes: "",
    delivery_requested: false,
    urgent: false,
    images: [] as File[],
    existingImageUrls: [] as string[],
  });

  // Populate form data when listing changes
  useEffect(() => {
    if (listing && isOpen) {
      setFormData({
        title: listing.title || "",
        description: listing.description || "",
        quantity: listing.quantity || "",
        type: listing.type || "free",
        price: listing.price || "",
        category_id: listing.category_id || "",
        pickup_location: {
          address: listing.pickup_location?.address || "",
          city: listing.pickup_location?.city || "",
          district: listing.pickup_location?.district || "",
          postalCode: listing.pickup_location?.postalCode || "",
        },
        pickup_date: listing.pickup_date
          ? listing.pickup_date.split("T")[0]
          : "",
        pickup_time: listing.pickup_time
          ? listing.pickup_time.split("T")[1]?.substring(0, 5)
          : "",
        expiry_date: listing.expiry_date
          ? listing.expiry_date.split("T")[0]
          : "",
        expiry_time: listing.expiry_time
          ? listing.expiry_time.split("T")[1]?.substring(0, 5)
          : "",
        allergen_info: listing.allergen_info || "",
        preparation_notes: listing.preparation_notes || "",
        delivery_requested: listing.delivery_requested || false,
        urgent: listing.urgent || false,
        images: [],
        existingImageUrls: listing.image_urls || [],
      });
    }
  }, [listing, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("pickup_location.")) {
      const locationField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        pickup_location: {
          ...prev.pickup_location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 3), // Limit to 3 images
      }));
    }
  };

  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingImageUrls: prev.existingImageUrls.filter((_, i) => i !== index),
    }));
  };

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user) {
      setError("Please sign in to edit listings.");
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.quantity) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (formData.type === "half-price" && !formData.price) {
      setError("Please set a price for half-price items.");
      setLoading(false);
      return;
    }

    try {
      let newImageUrls = [...formData.existingImageUrls];

      // Upload new images if any
      if (formData.images.length > 0) {
        for (const image of formData.images) {
          const fileExt = image.name.split(".").pop();
          const fileName = `${Date.now()}_${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;
          const filePath = `foodImages/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("food-images")
            .upload(filePath, image);

          if (uploadError) {
            console.error("Image upload error:", uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("food-images").getPublicUrl(filePath);

          newImageUrls.push(publicUrl);
        }
      }

      // Combine date and time for pickup and expiry
      const pickupDateTime =
        formData.pickup_date && formData.pickup_time
          ? new Date(`${formData.pickup_date}T${formData.pickup_time}`)
          : null;

      const expiryDateTime =
        formData.expiry_date && formData.expiry_time
          ? new Date(`${formData.expiry_date}T${formData.expiry_time}`)
          : null;

      // Update the listing
      const quantity = parseInt(formData.quantity) || 1;
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        quantity: quantity,
        type: formData.type,
        price:
          formData.type === "half-price" ? parseFloat(formData.price) : null,
        category_id: formData.category_id || null,
        pickup_location: formData.pickup_location,
        pickup_date: pickupDateTime?.toISOString(),
        pickup_time_start: pickupDateTime?.toISOString(),
        pickup_time_end: pickupDateTime
          ? new Date(pickupDateTime.getTime() + 3600000).toISOString()
          : null, // Add 1 hour
        expiry_date: expiryDateTime?.toISOString(),
        allergen_info: formData.allergen_info ? [formData.allergen_info] : [],
        preparation_notes: formData.preparation_notes,
        delivery_requested: formData.delivery_requested,
        urgent: formData.urgent,
        image_urls: newImageUrls,
        updated_at: new Date().toISOString(),
        // Ensure status is "available" if quantity > 0
        status: quantity > 0 ? "available" : listing.status,
      };

      const { error: updateError } = await supabase
        .from(TABLES.FOOD_LISTINGS)
        .update(updateData)
        .eq("id", listing.id);

      if (updateError) throw updateError;

      // Debug log to verify the update
      console.log("Food listing updated:", {
        id: listing.id,
        quantity: updateData.quantity,
        status: updateData.status,
        updateData,
      });

      setSuccess("Food listing updated successfully!");
      onListingUpdated();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError("Failed to update listing. Please try again.");
      console.error("Update error:", err);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Food Listing
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Food Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Fresh Vegetable Bundle"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the food items, freshness, preparation method..."
                rows={3}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Quantity/Servings *
                </label>
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", e.target.value)
                  }
                  placeholder="e.g., 5 servings, 2kg"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="free">Free</option>
                  <option value="half-price">Half Price</option>
                </select>
              </div>
            </div>

            {formData.type === "half-price" && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <CurrencyDollarIcon className="inline w-4 h-4 mr-1" />
                  Price (LKR) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="input-field"
                  required
                />
              </div>
            )}
          </div>

          {/* Pickup Location */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              <MapPinIcon className="inline w-5 h-5 mr-2" />
              Pickup Location
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.pickup_location.address}
                  onChange={(e) =>
                    handleInputChange("pickup_location.address", e.target.value)
                  }
                  placeholder="Street address"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.pickup_location.city}
                  onChange={(e) =>
                    handleInputChange("pickup_location.city", e.target.value)
                  }
                  placeholder="City"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  District *
                </label>
                <input
                  type="text"
                  value={formData.pickup_location.district}
                  onChange={(e) =>
                    handleInputChange(
                      "pickup_location.district",
                      e.target.value
                    )
                  }
                  placeholder="District"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.pickup_location.postalCode}
                  onChange={(e) =>
                    handleInputChange(
                      "pickup_location.postalCode",
                      e.target.value
                    )
                  }
                  placeholder="e.g., 10400"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Pickup & Expiry Times */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">
              <ClockIcon className="inline w-5 h-5 mr-2" />
              Timing
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Available From (Date)
                </label>
                <input
                  type="date"
                  value={formData.pickup_date}
                  onChange={(e) =>
                    handleInputChange("pickup_date", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Available From (Time)
                </label>
                <input
                  type="time"
                  value={formData.pickup_time}
                  onChange={(e) =>
                    handleInputChange("pickup_time", e.target.value)
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Best Before (Date)
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    handleInputChange("expiry_date", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Best Before (Time)
                </label>
                <input
                  type="time"
                  value={formData.expiry_time}
                  onChange={(e) =>
                    handleInputChange("expiry_time", e.target.value)
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Allergen Information
              </label>
              <input
                type="text"
                value={formData.allergen_info}
                onChange={(e) =>
                  handleInputChange("allergen_info", e.target.value)
                }
                placeholder="e.g., Contains nuts, dairy"
                className="input-field"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Preparation Notes
              </label>
              <textarea
                value={formData.preparation_notes}
                onChange={(e) =>
                  handleInputChange("preparation_notes", e.target.value)
                }
                placeholder="Heating instructions, storage notes, etc."
                rows={2}
                className="input-field"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.delivery_requested}
                onChange={(e) =>
                  handleInputChange("delivery_requested", e.target.checked)
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Accept delivery requests
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.urgent}
                onChange={(e) => handleInputChange("urgent", e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Mark as urgent (expires soon)
              </span>
            </label>
          </div>

          {/* Images */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <PhotoIcon className="inline w-4 h-4 mr-1" />
              Food Images (Max 3)
            </label>

            {/* Existing Images */}
            {formData.existingImageUrls.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-600">Current Images:</p>
                <div className="flex space-x-2">
                  {formData.existingImageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Food ${index + 1}`}
                        className="object-cover w-20 h-20 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {formData.images.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-600">New Images:</p>
                <div className="flex space-x-2">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="object-cover w-20 h-20 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {formData.existingImageUrls.length + formData.images.length < 3 && (
              <div className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400">
                <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <label
                    htmlFor="images-upload"
                    className="cursor-pointer text-primary-600 hover:text-primary-500"
                  >
                    Click to upload images
                  </label>
                  <input
                    id="images-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            )}
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

          {/* Submit Buttons */}
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
              {loading ? "Updating..." : "Update Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
