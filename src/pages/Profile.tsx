import { useEffect, useState, ChangeEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { cn } from "../utils/cn";
import { CameraIcon } from "@heroicons/react/24/outline";

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
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile({
            name: data.name || "",
            email: data.email || user.email || "",
            location:
              typeof data.address === "object" && data.address?.address
                ? data.address.address
                : data.address || "",
            phone: data.phone || "",
            role: data.role || "",
            photoURL:
              data.profile_image_url || user.user_metadata?.avatar_url || "",
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

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPhotoFile(e.target.files[0]);
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
      if (newPhotoFile) {
        const fileExt = newPhotoFile.name.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(fileName, newPhotoFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-images").getPublicUrl(fileName);

        photoURLToSave = publicUrl;
      }

      const { error } = await supabase
        .from("users")
        .update({
          name: profile.name,
          address: { address: profile.location },
          phone: profile.phone,
          profile_image_url: photoURLToSave,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          avatar_url: photoURLToSave,
        },
      });

      if (authError) throw authError;
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
            className={cn(
              "flex items-center justify-center w-24 h-24 mb-3 overflow-hidden rounded-full cursor-pointer bg-primary-100 group relative",
              editMode ? "hover:ring-2 hover:ring-primary-400" : ""
            )}
            title={editMode ? "Click to change profile picture" : ""}
            style={{ transition: "box-shadow 0.2s" }}
          >
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="object-cover w-24 h-24 rounded-full"
                draggable={false}
              />
            ) : (
              <span className="text-3xl font-bold select-none text-primary-600">
                {profile.name ? profile.name[0]?.toUpperCase() : "U"}
              </span>
            )}
            {editMode && (
              <span
                className={cn(
                  "pointer-events-none absolute inset-0 flex items-center justify-center transition",
                  profile.photoURL
                    ? "opacity-0 group-hover:opacity-90 bg-black/40"
                    : "opacity-30 group-hover:opacity-80 bg-black/20"
                )}
                style={{
                  color: "#fff",
                  fontSize: 26,
                }}
              >
                <CameraIcon className="w-10 h-10 text-white" />
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
                    if (newPhotoFile) URL.revokeObjectURL(profile.photoURL);
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
