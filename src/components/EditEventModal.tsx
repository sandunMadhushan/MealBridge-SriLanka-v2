import { useState, useEffect } from "react";
import { XMarkIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { supabase, TABLES } from "../supabase";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: () => void;
  event: any;
}

export default function EditEventModal({
  isOpen,
  onClose,
  onEventUpdated,
  event,
}: EditEventModalProps) {
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

  // Update form data when event prop changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.event_date
          ? new Date(event.event_date).toISOString().split("T")[0]
          : "",
        time: event.event_date
          ? new Date(event.event_date).toTimeString().substring(0, 5)
          : "",
        location: event.location?.address || event.location || "",
        city: event.location?.city || event.city || "",
        district: event.location?.district || event.district || "",
        maxAttendees: event.max_attendees?.toString() || "",
        category: event.category || "community",
        image: null,
      });
    }
  }, [event]);

  const districts = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Monaragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
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

    if (!user || !event) {
      setError("Please sign in to edit events.");
      setLoading(false);
      return;
    }

    // Check if user is the event organizer
    if (event.organizer_id !== user.id && event.created_by_id !== user.id) {
      setError("You can only edit events you created.");
      setLoading(false);
      return;
    }

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.time
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = event.image_url || event.image || "";

      // Upload new image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `eventImages/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(filePath, formData.image);

        if (uploadError) {
          console.error("Event upload error:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-images").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      // Update event document
      const { error: eventError } = await supabase
        .from(TABLES.EVENTS)
        .update({
          title: formData.title,
          description: formData.description,
          event_date: eventDateTime.toISOString(),
          location: {
            address: formData.location,
            city: formData.city,
            district: formData.district,
          },
          max_attendees: parseInt(formData.maxAttendees) || 100,
          category: formData.category,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id);

      if (eventError) {
        console.error("Event update error:", eventError);
        throw eventError;
      }

      setSuccess("Event updated successfully!");

      // Create notification for attendees about the update
      if (event.attendee_ids && event.attendee_ids.length > 0) {
        const notifications = event.attendee_ids.map((attendeeId: string) => ({
          user_id: attendeeId,
          type: "event_updated",
          title: "Event Updated",
          message: `The event "${formData.title}" you're attending has been updated.`,
          is_read: false,
          created_at: new Date().toISOString(),
          related_id: event.id,
        }));

        const { error: notificationError } = await supabase
          .from(TABLES.NOTIFICATIONS)
          .insert(notifications);

        if (notificationError) {
          console.error("Failed to create notifications:", notificationError);
        }
      }

      onEventUpdated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError("Failed to update event. Please try again.");
    }
    setLoading(false);
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Event</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Close edit event modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 text-red-700 bg-red-100 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 text-green-700 bg-green-100 border border-green-200 rounded-lg">
              {success}
            </div>
          )}

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
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
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
                title="Select event date"
                required
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
                Venue/Address *
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
                placeholder="e.g., Colombo"
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
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Max Attendees
              </label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) =>
                  handleInputChange("maxAttendees", e.target.value)
                }
                placeholder="e.g., 50"
                min="1"
                className="input-field"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Event Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="input-field"
            />
            <p className="mt-1 text-xs text-gray-500">
              Upload a new image to replace the current one (optional)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
