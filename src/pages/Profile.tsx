import { useEffect, useState, ChangeEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { db, auth, storage } from "../firebase";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { cn } from "../utils/cn";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    role: "",
    photoURL: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null); // New photo file

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({
            name: data.name || "",
            email: data.email || user.email || "",
            location: data.location || "",
            phone: data.phone || "",
            role: data.role || "",
            photoURL: user.photoURL || "",
          });
        } else {
          setError("Profile not found.");
        }
      } catch (e: any) {
        setError("Failed to load profile.");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
  };

  // Handle file input change to update photo file state
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPhotoFile(e.target.files[0]);
      // Show preview instantly (optional)
      setProfile((p) => ({
        ...p,
        photoURL: URL.createObjectURL(e.target.files![0]),
      }));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaveLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let photoURLToSave = profile.photoURL;

      // If new photo selected, upload to Firebase Storage
      if (newPhotoFile) {
        const photoRef = ref(
          storage,
          `profilePhotos/${user.uid}_${Date.now()}`
        );
        await uploadBytes(photoRef, newPhotoFile);
        photoURLToSave = await getDownloadURL(photoRef);
      }

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        name: profile.name,
        location: profile.location,
        phone: profile.phone,
        photoURL: photoURLToSave,
      });

      // Update Firebase Auth displayName and photoURL
      await updateProfile(auth.currentUser!, {
        displayName: profile.name,
        photoURL: photoURLToSave,
      });

      setProfile((p) => ({ ...p, photoURL: photoURLToSave }));
      setNewPhotoFile(null);
      setSuccess("Profile updated!");
      setEditMode(false);
    } catch (e: any) {
      setError("Failed to update profile.");
    }
    setSaveLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-2xl p-8 mx-auto bg-white rounded-lg shadow">
        <div className="flex flex-col items-center mb-8">
          <label
            htmlFor="photo-upload"
            className="flex items-center justify-center w-24 h-24 mb-3 overflow-hidden rounded-full cursor-pointer bg-primary-100"
            title="Click to change profile picture"
          >
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="object-cover w-24 h-24 rounded-full"
              />
            ) : (
              <span className="text-3xl font-bold text-primary-600">
                {profile.name ? profile.name[0]?.toUpperCase() : "U"}
              </span>
            )}
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={!editMode}
              className="hidden"
            />
          </label>
          <div className="text-center">
            <h2 className="text-2xl font-bold leading-none text-gray-900">
              {profile.name}
            </h2>
            <p className="font-medium text-primary-600">
              {profile.role &&
                profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </p>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (editMode) handleSave();
          }}
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              className={cn("input-field w-full", !editMode && "bg-gray-100")}
              value={profile.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={!editMode}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              className="w-full bg-gray-100 input-field"
              value={profile.email}
              disabled
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              className={cn("input-field w-full", !editMode && "bg-gray-100")}
              value={profile.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              disabled={!editMode}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              className={cn("input-field w-full", !editMode && "bg-gray-100")}
              value={profile.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={!editMode}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Role
            </label>
            <input
              className="w-full bg-gray-100 input-field"
              value={profile.role}
              disabled
            />
          </div>
          {error && (
            <div className="text-sm text-center text-red-500">{error}</div>
          )}
          {success && (
            <div className="text-sm text-center text-green-600">{success}</div>
          )}

          <div className="flex justify-end space-x-3">
            {editMode ? (
              <>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setEditMode(false);
                    setError(null);
                    setSuccess(null);
                    if (newPhotoFile) URL.revokeObjectURL(profile.photoURL); // Clean up preview url
                    setNewPhotoFile(null);
                  }}
                  disabled={saveLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saveLoading}
                >
                  {saveLoading ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
