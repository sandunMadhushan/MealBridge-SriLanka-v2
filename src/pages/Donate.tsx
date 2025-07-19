import { useState, useEffect } from "react";
import {
  PhotoIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../utils/cn";
import { db, storage } from "../firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";

interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface DonationForm {
  title: string;
  description: string;
  category: string;
  quantity: string;
  expiryDate: string;
  expiryTime: string;
  type: "free" | "half-price";
  price: string;
  address: string;
  city: string;
  district: string;
  deliveryAvailable: boolean;
  images: File[];
  safetyChecklist: {
    freshness: boolean;
    properStorage: boolean;
    hygieneStandards: boolean;
    labelingComplete: boolean;
  };
  allergenInfo: string[];
}

export default function Donate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [form, setForm] = useState<DonationForm>({
    title: "",
    description: "",
    category: "",
    quantity: "",
    expiryDate: "",
    expiryTime: "",
    type: "free",
    price: "",
    address: "",
    city: "",
    district: "",
    deliveryAvailable: false,
    images: [],
    safetyChecklist: {
      freshness: false,
      properStorage: false,
      hygieneStandards: false,
      labelingComplete: false,
    },
    allergenInfo: [],
  });

  const { user } = useAuth();

  // Load foodCategories from Firestore
  useEffect(() => {
    async function getCategories() {
      try {
        const { getDocs } = await import("firebase/firestore");
        const qsnap = await getDocs(collection(db, "foodCategories"));
        const docs = qsnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name ?? "",
            icon: data.icon ?? "",
            color: data.color ?? "",
          } as FoodCategory;
        });
        setFoodCategories(docs);
      } catch (err) {
        setFoodCategories([]);
      }
    }
    getCategories();
  }, []);

  const steps = [
    {
      id: 1,
      name: "Food Details",
      description: "Basic information about your donation",
    },
    {
      id: 2,
      name: "Location & Pickup",
      description: "Where and when to collect",
    },
    {
      id: 3,
      name: "Safety & Quality",
      description: "Food safety confirmation",
    },
    {
      id: 4,
      name: "Review & Submit",
      description: "Final review of your listing",
    },
  ];

  const districts = [
    "Colombo",
    "Kandy",
    "Galle",
    "Jaffna",
    "Negombo",
    "Matara",
    "Kurunegala",
  ];
  const allergens = [
    "Gluten",
    "Dairy",
    "Eggs",
    "Nuts",
    "Soy",
    "Fish",
    "Shellfish",
    "Sesame",
  ];

  const handleInputChange = (field: keyof DonationForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSafetyChecklistChange = (
    field: keyof DonationForm["safetyChecklist"],
    value: boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      safetyChecklist: { ...prev.safetyChecklist, [field]: value },
    }));
  };

  const handleAllergenToggle = (allergen: string) => {
    setForm((prev) => ({
      ...prev,
      allergenInfo: prev.allergenInfo.includes(allergen)
        ? prev.allergenInfo.filter((a) => a !== allergen)
        : [...prev.allergenInfo, allergen],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm((prev) => ({ ...prev, images: Array.from(e.target.files!) }));
    }
  };

  function validateStep(step: number): string | null {
    if (step === 1) {
      if (!form.title.trim()) return "Food title is required.";
      if (!form.category.trim()) return "Category is required.";
      if (!form.description.trim()) return "Description is required.";
      if (!form.quantity.trim()) return "Quantity/Servings is required.";
      if (
        form.type === "half-price" &&
        (!form.price.trim() ||
          isNaN(Number(form.price)) ||
          Number(form.price) <= 0)
      )
        return "Price is required and must be greater than 0.";
      if (!form.images.length) return "At least one image is required.";
    }
    if (step === 2) {
      if (!form.address.trim()) return "Pickup address is required.";
      if (!form.city.trim()) return "City is required.";
      if (!form.district.trim()) return "District is required.";
      if (!form.expiryDate.trim()) return "Expiry date is required.";
      if (!form.expiryTime.trim()) return "Expiry time is required.";
    }
    if (step === 3) {
      const checklist = form.safetyChecklist;
      if (
        !checklist.freshness ||
        !checklist.properStorage ||
        !checklist.hygieneStandards ||
        !checklist.labelingComplete
      ) {
        return "All safety checklist items must be checked.";
      }
    }
    return null;
  }

  const nextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitSuccess(null);
    setSubmitError(null);
    setLoading(true);

    for (let s = 1; s <= 3; ++s) {
      const error = validateStep(s);
      if (error) {
        setValidationError(error);
        setLoading(false);
        setCurrentStep(s);
        return;
      }
    }

    try {
      let imageUrls: string[] = [];
      for (let img of form.images) {
        const imgRef = ref(storage, `foodImages/${Date.now()}_${img.name}`);
        await uploadBytes(imgRef, img);
        const url = await getDownloadURL(imgRef);
        imageUrls.push(url);
      }

      let expiry = null;
      if (form.expiryDate && form.expiryTime) {
        expiry = new Date(`${form.expiryDate}T${form.expiryTime}:00`);
      }

      const categoryObj = foodCategories.find((c) => c.id === form.category);

      let donorInfo = undefined;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const udata = userDoc.data();
            donorInfo = {
              id: user.uid,
              email: user.email,
              name: udata.name || user.displayName || user.email || "Anonymous",
              stats: udata.stats || { donationsGiven: 0 },
            };
          } else {
            donorInfo = {
              id: user.uid,
              email: user.email,
              name: user.displayName || user.email || "Anonymous",
              stats: { donationsGiven: 0 },
            };
          }
        } catch {
          donorInfo = {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email || "Anonymous",
            stats: { donationsGiven: 0 },
          };
        }
      } else {
        donorInfo = {
          id: null,
          email: null,
          name: "Anonymous",
          stats: { donationsGiven: 0 },
        };
      }

      const foodDoc = {
        title: form.title,
        description: form.description,
        category: categoryObj || form.category,
        quantity: form.quantity,
        expiryDate: expiry ? Timestamp.fromDate(expiry) : null,
        pickupLocation: {
          address: form.address,
          city: form.city,
          district: form.district,
        },
        images: imageUrls,
        type: form.type,
        price: form.type === "half-price" ? parseFloat(form.price) : 0,
        status: "available",
        createdAt: Timestamp.now(),
        deliveryRequested: form.deliveryAvailable,
        safetyChecklist: form.safetyChecklist,
        allergenInfo: form.allergenInfo,
        donor: donorInfo,
      };

      await addDoc(collection(db, "foodListings"), foodDoc);

      setSubmitSuccess("Your food listing has been submitted!");
      setCurrentStep(1);
      setForm({
        title: "",
        description: "",
        category: "",
        quantity: "",
        expiryDate: "",
        expiryTime: "",
        type: "free",
        price: "",
        address: "",
        city: "",
        district: "",
        deliveryAvailable: false,
        images: [],
        safetyChecklist: {
          freshness: false,
          properStorage: false,
          hygieneStandards: false,
          labelingComplete: false,
        },
        allergenInfo: [],
      });
    } catch (err: any) {
      setSubmitError(
        "There was an error submitting your donation. " + err?.message
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Donate Surplus Food
            </h1>
            <p className="text-lg text-gray-600">
              Share your surplus food with those who need it most
            </p>
          </div>
          {/* Progress Steps */}
          <div className="flex justify-center">
            <nav className="flex space-x-4" aria-label="Progress">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                        currentStep >= step.id
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      )}
                    >
                      {step.id}
                    </div>
                    <div className="hidden sm:block">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          currentStep >= step.id
                            ? "text-primary-600"
                            : "text-gray-500"
                        )}
                      >
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "ml-4 h-0.5 w-12 sm:w-16",
                        currentStep > step.id ? "bg-primary-600" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="p-8 bg-white rounded-lg shadow-sm">
          {submitSuccess && (
            <div className="px-4 py-2 mb-4 text-green-700 border border-green-200 rounded bg-green-50">
              {submitSuccess}
            </div>
          )}
          {submitError && (
            <div className="px-4 py-2 mb-4 text-red-700 bg-red-100 border border-red-200 rounded">
              {submitError}
            </div>
          )}
          {validationError && (
            <div className="px-4 py-2 mb-6 text-red-700 bg-red-100 border border-red-200 rounded">
              {validationError}
            </div>
          )}

          {/* Step 1: Food Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Food Details
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Food Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Fresh Vegetable Bundle"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="input-field"
                    required
                  >
                    <option value="">Select a category</option>
                    {foodCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the food items, their condition, and any special notes..."
                  rows={4}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Quantity/Servings *
                  </label>
                  <input
                    type="text"
                    value={form.quantity}
                    onChange={(e) =>
                      handleInputChange("quantity", e.target.value)
                    }
                    placeholder="e.g., 5-6 servings, 2kg, 10 items"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Donation Type *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="free"
                        checked={form.type === "free"}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Free Donation</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="half-price"
                        checked={form.type === "half-price"}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Half Price</span>
                    </label>
                  </div>
                </div>
              </div>

              {form.type === "half-price" && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Price (LKR) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="Enter price in LKR"
                    className="input-field"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Upload Photos *
                </label>
                <div className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400">
                  <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-primary-600 hover:text-primary-500"
                    >
                      Click to upload photos
                    </label>
                    <input
                      id="file-upload"
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
                {form.images.length > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    {form.images.length} image(s) selected
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location & Pickup */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Location & Pickup Details
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <MapPinIcon className="inline w-4 h-4 mr-1" />
                    Pickup Address *
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Street address"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  District *
                </label>
                <select
                  value={form.district}
                  onChange={(e) =>
                    handleInputChange("district", e.target.value)
                  }
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <ClockIcon className="inline w-4 h-4 mr-1" />
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) =>
                      handleInputChange("expiryDate", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Expiry Time *
                  </label>
                  <input
                    type="time"
                    value={form.expiryTime}
                    onChange={(e) =>
                      handleInputChange("expiryTime", e.target.value)
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.deliveryAvailable}
                    onChange={(e) =>
                      handleInputChange("deliveryAvailable", e.target.checked)
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    I can arrange delivery or would like volunteer delivery
                    assistance
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Safety & Quality */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                <ShieldCheckIcon className="inline w-6 h-6 mr-2" />
                Food Safety & Quality Assurance
              </h2>

              <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="mb-2 font-medium text-blue-900">
                  Food Safety Guidelines
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>
                    • Ensure food is fresh and within safe consumption time
                  </li>
                  <li>• Store food at appropriate temperatures</li>
                  <li>
                    • Maintain proper hygiene during preparation and storage
                  </li>
                  <li>
                    • Clearly label any allergens or special dietary information
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-medium text-gray-900">
                  Safety Checklist *
                </h3>
                <div className="space-y-3">
                  {Object.entries(form.safetyChecklist).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          handleSafetyChecklistChange(
                            key as keyof DonationForm["safetyChecklist"],
                            e.target.checked
                          )
                        }
                        className="mr-3"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        {key === "freshness" &&
                          "Food is fresh and safe for consumption"}
                        {key === "properStorage" &&
                          "Food has been stored at proper temperature"}
                        {key === "hygieneStandards" &&
                          "Hygiene standards have been maintained"}
                        {key === "labelingComplete" &&
                          "All necessary labeling is complete"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-medium text-gray-900">
                  Allergen Information
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                  Select any allergens present in the food:
                </p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {allergens.map((allergen) => (
                    <label key={allergen} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={form.allergenInfo.includes(allergen)}
                        onChange={() => handleAllergenToggle(allergen)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Review Your Donation
              </h2>

              <div className="p-6 space-y-4 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium text-gray-900">Food Details</h3>
                    <p className="text-sm text-gray-600">Title: {form.title}</p>
                    <p className="text-sm text-gray-600">
                      Category:{" "}
                      {foodCategories.find((c) => c.id === form.category)?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {form.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type:{" "}
                      {form.type === "free"
                        ? "Free Donation"
                        : `Half Price (LKR ${form.price})`}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Pickup Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      Location: {form.address}, {form.city}
                    </p>
                    <p className="text-sm text-gray-600">
                      District: {form.district}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires: {form.expiryDate} at {form.expiryTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      Delivery:{" "}
                      {form.deliveryAvailable ? "Available" : "Pickup only"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <p className="text-sm text-gray-600">{form.description}</p>
                </div>

                {form.allergenInfo.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900">Allergens</h3>
                    <p className="text-sm text-gray-600">
                      {form.allergenInfo.join(", ")}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h3 className="mb-2 font-medium text-green-900">
                  Ready to Share!
                </h3>
                <p className="text-sm text-green-800">
                  Your food donation will be visible to the community
                  immediately after submission. You'll receive notifications
                  when someone requests your donation.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-colors",
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button onClick={nextStep} className="px-6 py-2 btn-primary">
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Donation"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
