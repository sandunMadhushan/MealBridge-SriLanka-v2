import { useState } from "react";
import {
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  PhotoIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onEventCreated,
}: CreateEventModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    city: "",
    district: "",
    maxAttendees: "",
    category: "community",
    image: null as File | null,
  });

  const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
    "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
    "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
    "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
    "Trincomalee", "Vavuniya",
  ];

  const categories = [
    { id: "community", name: "Community Drive", icon: "🤝" },
    { id: "workshop", name: "Workshop/Training", icon: "📚" },
    { id: "appreciation", name: "Appreciation Event", icon: "🎉" },
    { id: "fundraising", name: "Fundraising", icon: "💰" },
    { id: "awareness", name: "Awareness Campaign", icon: "📢" },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user) {
      setError("Please sign in to create events.");
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.date || !formData.time) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = "";
      
      // Upload image if provided
      if (formData.image) {
        const imageRef = ref(storage, `eventImages/${Date.now()}_${formData.image.name}`);
        await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      // Create event document
      await addDoc(collection(db, "events"), {
        title: formData.title,
        description: formData.description,
        date: Timestamp.fromDate(eventDateTime),
        location: formData.location,
        city: formData.city,
        district: formData.district,
        maxAttendees: parseInt(formData.maxAttendees) || 100,
        category: formData.category,
        image: imageUrl,
        createdBy: {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
        },
        attendees: [],
        attendeeCount: 0,
        status: "upcoming",
        createdAt: Timestamp.now(),
      });

      setSuccess("Event created successfully!");

      // Create notification for the event creator
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        type: "event_created",
        title: "Event Created Successfully!",
        message: `Your event "${formData.title}" has been created and is now visible to the community.`,
        read: false,
        createdAt: Timestamp.now(),
      });

      onEventCreated();
      setTimeout(() => {
        onClose();
        // Reset form
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          city: "",
          district: "",
          maxAttendees: "",
          category: "community",
          image: null,
        });
      }, 1500);
    } catch (err: any) {
      setError("Failed to create event. Please try again.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Event</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Title */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Community Food Drive"
              className="input-field"
              required
            />
          </div>

          {/* Event Description */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your event, its purpose, and what attendees can expect..."
              rows={4}
              className="input-field"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Event Category *
            </label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    value={category.id}
                    checked={formData.category === category.id}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="mr-3"
                  />
                  <span className="mr-2">{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <CalendarIcon className="inline w-4 h-4 mr-1" />
                Event Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Event Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <MapPinIcon className="inline w-4 h-4 mr-1" />
                Venue/Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Community Center, Park"
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
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
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
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <UsersIcon className="inline w-4 h-4 mr-1" />
                Max Attendees
              </label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
                placeholder="100"
                min="1"
                className="input-field"
              />
            </div>
          </div>

          {/* Event Image */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Event Image
            </label>
            <div className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400">
              <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-primary-600 hover:text-primary-500"
                >
                  Click to upload event image
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
            {formData.image && (
              <p className="mt-2 text-sm text-green-600">
                Image selected: {formData.image.name}
              </p>
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
              {loading ? "Creating Event..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}