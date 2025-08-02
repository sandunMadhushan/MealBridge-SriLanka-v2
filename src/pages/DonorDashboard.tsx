import { useState, useEffect } from "react";
import {
  PlusIcon,
  GiftIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrophyIcon,
  HeartIcon,
  UsersIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { supabase, TABLES } from "../supabase";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

interface DonorStats {
  totalDonations: number;
  activeDonations: number;
  completedDonations: number;
  totalMealsShared: number;
  impactScore: number;
  badges: any[];
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  interface Donation {
    id: string;
    status: string;
    title?: string;
    quantity?: string;
    images?: string[];
    createdAt?: any;
    pickupLocation?: { city?: string };
    type?: string;
  }

  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [stats, setStats] = useState<DonorStats>({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalMealsShared: 0,
    impactScore: 0,
    badges: [],
  });
  const [loading, setLoading] = useState(true);
  const [_notifications, setNotifications] = useState<any[]>([]);
  // New: view/edit modal state
  const [viewDonation, setViewDonation] = useState<Donation | null>(null);
  const [editDonation, setEditDonation] = useState<Donation | null>(null);
  const [editForm, setEditForm] = useState<{
    title?: string;
    quantity?: string;
    status?: string;
  }>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDonorData();
      fetchNotifications();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data: notificationsData, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(notificationsData || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  const fetchDonorData = async () => {
    if (!user) return;

    try {
      // Fetch donations
      const { data: donationsData, error } = await supabase
        .from(TABLES.FOOD_LISTINGS)
        .select("*")
        .eq("donor_id", user.id);

      if (error) throw error;

      const processedDonations = (donationsData || []).map((data) => ({
        id: data.id,
        status: data.status || "available",
        title: data.title,
        quantity: data.quantity,
        images: data.image_urls || [], // Fix: Map image_urls to images
        createdAt: data.created_at,
        pickupLocation: data.pickup_location,
        type: data.type,
      }));

      setDonations(processedDonations);

      // Fetch claims on donor's listings
      const { data: claimsData, error: claimsError } = await supabase
        .from(TABLES.FOOD_CLAIMS)
        .select(
          `
          *,
          food_listings!inner(
            id,
            title,
            donor_id
          )
        `
        )
        .eq("food_listings.donor_id", user.id)
        .order("created_at", { ascending: false });

      if (claimsError) throw claimsError;

      const processedClaims = (claimsData || []).map((claim) => ({
        id: claim.id,
        listingTitle: claim.food_listings?.title || "Unknown Food",
        claimantName: claim.claimant_name || "Unknown User",
        claimantEmail: claim.claimant_email || "",
        quantityRequested: claim.quantity_requested || 1,
        status: claim.status || "pending",
        pickupDateTime: claim.pickup_date_time,
        contactMethod: claim.contact_method || "email",
        phone: claim.phone || "",
        email: claim.email || "",
        notes: claim.notes || "",
        createdAt: claim.created_at,
      }));

      setClaims(processedClaims);

      // Calculate stats
      const totalDonations = processedDonations.length;
      const activeDonations = processedDonations.filter(
        (d) => d.status === "available"
      ).length;
      const completedDonations = processedDonations.filter(
        (d) => d.status === "completed"
      ).length;
      const totalMealsShared = processedDonations.reduce((sum, d) => {
        const servings = parseInt(d.quantity?.match(/\d+/)?.[0] || "1");
        return sum + servings;
      }, 0);

      setStats({
        totalDonations,
        activeDonations,
        completedDonations,
        totalMealsShared,
        impactScore: totalMealsShared * 10 + completedDonations * 5,
        badges: generateBadges(totalDonations, completedDonations),
      });
    } catch (error) {
      console.error("Error fetching donor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateBadges = (total: number, completed: number) => {
    const badges = [];
    if (total >= 1)
      badges.push({
        name: "First Donation",
        icon: "🎉",
        color: "bg-green-100 text-green-800",
      });
    if (total >= 5)
      badges.push({
        name: "Generous Giver",
        icon: "💝",
        color: "bg-blue-100 text-blue-800",
      });
    if (total >= 10)
      badges.push({
        name: "Food Hero",
        icon: "🦸",
        color: "bg-purple-100 text-purple-800",
      });
    if (completed >= 5)
      badges.push({
        name: "Reliable Donor",
        icon: "⭐",
        color: "bg-yellow-100 text-yellow-800",
      });
    return badges;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "claimed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: TrophyIcon },
    { id: "active", name: "Active Donations", icon: ClockIcon },
    { id: "claims", name: "Food Claims", icon: UsersIcon },
    { id: "history", name: "Donation History", icon: GiftIcon },
    { id: "impact", name: "My Impact", icon: HeartIcon },
  ];

  // Edit modal open
  const openEditModal = (donation: Donation) => {
    setEditDonation(donation);
    setEditForm({
      title: donation.title,
      quantity: donation.quantity,
      status: donation.status,
    });
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editDonation) return;
    setEditError(null);
    setEditSuccess(null);
    setEditLoading(true);
    try {
      const { error } = await supabase
        .from(TABLES.FOOD_LISTINGS)
        .update(editForm)
        .eq("id", editDonation.id);

      if (error) throw error;

      setEditSuccess("Donation updated successfully");
      await fetchDonorData();
      setTimeout(() => {
        setEditDonation(null);
      }, 1200);
    } catch (e: any) {
      setEditError("Update failed. " + (e.message ?? ""));
    }
    setEditLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* View Donation Modal */}
      {viewDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
            <button
              onClick={() => setViewDonation(null)}
              className="absolute text-gray-400 top-3 right-3 hover:text-gray-600"
              title="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <img
              src={
                viewDonation.images?.[0] ||
                "https://via.placeholder.com/600x180"
              }
              alt={viewDonation.title}
              className="object-cover w-full mb-4 rounded-lg max-h-48"
            />
            <h2 className="mb-2 text-xl font-bold">{viewDonation.title}</h2>
            <div className="mb-1 text-gray-700">
              Quantity:{" "}
              <span className="font-medium">{viewDonation.quantity}</span>
            </div>
            <div className="mb-1 text-gray-700">
              Status:{" "}
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getStatusColor(viewDonation.status)
                )}
              >
                {viewDonation.status}
              </span>
            </div>
            <div className="mb-1 text-gray-700">
              Type:{" "}
              <span>
                {viewDonation.type === "free" ? "Free" : "Half Price"}
              </span>
            </div>
            <div className="mb-1 text-gray-700">
              Pickup City: <span>{viewDonation.pickupLocation?.city}</span>
            </div>
            <div className="mb-1 text-gray-700">
              Date: <span>{formatDate(viewDonation.createdAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Donation Modal */}
      {editDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
            <button
              onClick={() => setEditDonation(null)}
              className="absolute text-gray-400 top-3 right-3 hover:text-gray-600"
              title="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <h2 className="mb-2 text-xl font-bold">Edit Donation</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Title</label>
              <input
                className="w-full input-field"
                type="text"
                value={editForm.title ?? ""}
                onChange={(e) => handleEditInputChange("title", e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                className="w-full input-field"
                type="text"
                value={editForm.quantity ?? ""}
                onChange={(e) =>
                  handleEditInputChange("quantity", e.target.value)
                }
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Status</label>
              <select
                className="w-full input-field"
                value={editForm.status ?? "available"}
                onChange={(e) =>
                  handleEditInputChange("status", e.target.value)
                }
              >
                <option value="available">Available</option>
                <option value="claimed">Claimed</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            {editError && (
              <div className="mb-2 text-sm text-red-500">{editError}</div>
            )}
            {editSuccess && (
              <div className="mb-2 text-sm text-green-600">{editSuccess}</div>
            )}
            <div className="flex space-x-3">
              <button
                className="flex-1 btn-outline"
                onClick={() => setEditDonation(null)}
                disabled={editLoading}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex-1 btn-primary"
                onClick={handleEditSave}
                disabled={editLoading}
                type="button"
              >
                {editLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Donor Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.user_metadata?.name || user?.email}
              </p>
            </div>
            <Link
              to="/donate"
              className="flex items-center space-x-2 btn-primary"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Donation</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {/* ... unchanged stats cards ... */}
          {/* (Your stats card code remains unchanged) */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100">
                <GiftIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Donations
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalDonations}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Listings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeDonations}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Meals Shared
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalMealsShared}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Impact Score
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.impactScore}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Badges */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Your Badges
              </h3>
              <div className="flex flex-wrap gap-3">
                {stats.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                      badge.color
                    )}
                  >
                    <span className="mr-2">{badge.icon}</span>
                    {badge.name}
                  </span>
                ))}
                {stats.badges.length === 0 && (
                  <p className="text-gray-500">
                    Start donating to earn badges!
                  </p>
                )}
              </div>
            </div>
            {/* Recent Activity */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {donations.slice(0, 5).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          donation.images?.[0] ||
                          "https://via.placeholder.com/40x40"
                        }
                        alt={donation.title}
                        className="object-cover w-10 h-10 rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {donation.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(donation.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(donation.status)
                      )}
                    >
                      {donation.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "active" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {donations
              .filter((d) => d.status === "available")
              .map((donation) => (
                <div key={donation.id} className="card">
                  <img
                    src={
                      donation.images?.[0] ||
                      "https://via.placeholder.com/300x200"
                    }
                    alt={donation.title}
                    className="object-cover w-full h-48 mb-4 rounded-lg"
                  />
                  <h4 className="mb-2 font-semibold text-gray-900">
                    {donation.title}
                  </h4>
                  <p className="mb-3 text-sm text-gray-600">
                    {donation.quantity}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(donation.status)
                      )}
                    >
                      {donation.status}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View"
                        onClick={() => setViewDonation(donation)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Edit"
                        onClick={() => openEditModal(donation)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* History/impact tabs remain unchanged */}
        {activeTab === "history" && (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Food Item
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={
                              donation.images?.[0] ||
                              "https://via.placeholder.com/40x40"
                            }
                            alt={donation.title}
                            className="object-cover w-10 h-10 mr-3 rounded-lg"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {donation.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {donation.pickupLocation?.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {donation.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(donation.status)
                          )}
                        >
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {donation.type === "free" ? "Free" : "Half Price"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "impact" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Environmental Impact
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CO₂ Saved:</span>
                    <span className="font-medium">
                      {(stats.totalMealsShared * 0.5).toFixed(1)} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water Saved:</span>
                    <span className="font-medium">
                      {(stats.totalMealsShared * 2.1).toFixed(1)} L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Waste Prevented:</span>
                    <span className="font-medium">
                      {(stats.totalMealsShared * 0.3).toFixed(1)} kg
                    </span>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Community Impact
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">People Helped:</span>
                    <span className="font-medium">
                      {Math.ceil(stats.totalMealsShared / 2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Families Reached:</span>
                    <span className="font-medium">
                      {Math.ceil(stats.totalMealsShared / 4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Community Rank:</span>
                    <span className="font-medium">Top 10%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Monthly Progress
              </h3>
              <div className="space-y-4">
                {[
                  { month: "January", donations: 3, meals: 12 },
                  { month: "February", donations: 5, meals: 18 },
                  { month: "March", donations: 4, meals: 15 },
                ].map((month) => (
                  <div
                    key={month.month}
                    className="flex items-center space-x-4"
                  >
                    <div className="w-20 text-sm text-gray-600">
                      {month.month}
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-primary-600"
                        style={{ width: `${(month.donations / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {month.donations} donations
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
