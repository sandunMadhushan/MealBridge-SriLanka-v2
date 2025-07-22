import { useState } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  HeartIcon,
  TrophyIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export default function CreateStoryModal({
  isOpen,
  onClose,
  onStoryCreated,
}: CreateStoryModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "success",
    images: [] as File[],
  });

  const categories = [
    { id: "success", name: "Success Story", icon: <HeartIcon className="w-5 h-5" />, color: "bg-green-100 text-green-800" },
    { id: "impact", name: "Impact Story", icon: <TrophyIcon className="w-5 h-5" />, color: "bg-blue-100 text-blue-800" },
    { id: "community", name: "Community Story", icon: <UsersIcon className="w-5 h-5" />, color: "bg-purple-100 text-purple-800" },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3); // Max 3 images
      setFormData((prev) => ({ ...prev, images: files }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user) {
      setError("Please sign in to share your story.");
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please fill in both title and content.");
      setLoading(false);
      return;
    }

    if (formData.content.length < 50) {
      setError("Story content should be at least 50 characters long.");
      setLoading(false);
      return;
    }

    try {
      let imageUrls: string[] = [];
      
      // Upload images if provided
      if (formData.images.length > 0) {
        for (const image of formData.images) {
          const imageRef = ref(storage, `storyImages/${Date.now()}_${image.name}`);
          await uploadBytes(imageRef, image);
          const url = await getDownloadURL(imageRef);
          imageUrls.push(url);
        }
      }

      // Create story document
      await addDoc(collection(db, "communityStories"), {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        images: imageUrls,
        author: {
          id: user.uid,
          name: user.displayName || user.email || "Anonymous",
          email: user.email,
        },
        likes: 0,
        likedBy: [],
        createdAt: Timestamp.now(),
      });

      setSuccess("Your story has been shared with the community!");
      onStoryCreated();
      
      setTimeout(() => {
        onClose();
        // Reset form
        setFormData({
          title: "",
          content: "",
          category: "success",
          images: [],
        });
      }, 1500);
    } catch (err: any) {
      setError("Failed to share your story. Please try again.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Share Your Story</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Story Title */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Story Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., How MealBridge Changed My Life"
              className="input-field"
              required
            />
          </div>

          {/* Story Category */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Story Category *
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.category === category.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={category.id}
                    checked={formData.category === category.id}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      {category.icon}
                    </div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Story Content */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Your Story *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Share your experience with MealBridge. How has it impacted your life or community? What challenges did you overcome? What positive changes have you seen?"
              rows={8}
              className="input-field"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Minimum 50 characters ({formData.content.length}/50)
            </p>
          </div>

          {/* Story Images */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Add Photos (Optional)
            </label>
            <div className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400">
              <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <div className="text-sm text-gray-600">
                <label
                  htmlFor="story-images"
                  className="cursor-pointer text-primary-600 hover:text-primary-500"
                >
                  Click to upload photos
                </label>
                <input
                  id="story-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each (max 3 photos)</p>
            </div>
            {formData.images.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-green-600">
                  {formData.images.length} photo(s) selected:
                </p>
                <ul className="mt-1 text-sm text-gray-600">
                  {formData.images.map((file, index) => (
                    <li key={index} className="truncate">• {file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h4 className="mb-2 font-medium text-blue-900">Story Guidelines</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Share authentic experiences and genuine impact</li>
              <li>• Be respectful and considerate of others</li>
              <li>• Focus on positive outcomes and community building</li>
              <li>• Include specific details that others can relate to</li>
            </ul>
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
              {loading ? "Sharing Story..." : "Share Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}