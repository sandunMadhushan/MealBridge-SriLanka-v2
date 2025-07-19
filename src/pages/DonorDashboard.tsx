import { useState, useEffect } from "react";
import {
  PlusIcon,
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon,
  HeartIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
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
  const [donations, setDonations] = useState<any[]>([]);
  const [stats, setStats] = useState<DonorStats>({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalMealsShared: 0,
    impactScore: 0,
    badges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDonorData();
    }
  }, [user]);

  const fetchDonorData = async () => {
    if (!user) return;
    
    try {
      // Fetch donations
      const donationsQuery = query(
        collection(db, "foodListings"),
        where("donor.id", "==", user.uid)
      );
      const donationsSnapshot = await getDocs(donationsQuery);
      const donationsData = donationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDonations(donationsData);
      
      // Calculate stats
      const totalDonations = donationsData.length;
      const activeDonations = donationsData.filter(d => d.status === "available").length;
      const completedDonations = donationsData.filter(d => d.status === "completed").length;
      const totalMealsShared = donationsData.reduce((sum, d) => {
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
    if (total >= 1) badges.push({ name: "First Donation", icon: "🎉", color: "bg-green-100 text-green-800" });
    if (total >= 5) badges.push({ name: "Generous Giver", icon: "💝", color: "bg-blue-100 text-blue-800" });
    if (total >= 10) badges.push({ name: "Food Hero", icon: "🦸", color: "bg-purple-100 text-purple-800" });
    if (completed >= 5) badges.push({ name: "Reliable Donor", icon: "⭐", color: "bg-yellow-100 text-yellow-800" });
    return badges;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "claimed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
    { id: "history", name: "Donation History", icon: GiftIcon },
    { id: "impact", name: "My Impact", icon: HeartIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.displayName || user?.email}</p>
            </div>
            <Link to="/donate" className="btn-primary flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>New Donation</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100">
                <GiftIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDonations}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meals Shared</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMealsShared}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <TrophyIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impact Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.impactScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8 -mb-px">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Badges</h3>
              <div className="flex flex-wrap gap-3">
                {stats.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", badge.color)}
                  >
                    <span className="mr-2">{badge.icon}</span>
                    {badge.name}
                  </span>
                ))}
                {stats.badges.length === 0 && (
                  <p className="text-gray-500">Start donating to earn badges!</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {donations.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <img
                        src={donation.images?.[0] || "https://via.placeholder.com/40x40"}
                        alt={donation.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{donation.title}</p>
                        <p className="text-sm text-gray-500">{formatDate(donation.createdAt)}</p>
                      </div>
                    </div>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(donation.status))}>
                      {donation.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "active" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.filter(d => d.status === "available").map((donation) => (
              <div key={donation.id} className="card">
                <img
                  src={donation.images?.[0] || "https://via.placeholder.com/300x200"}
                  alt={donation.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h4 className="font-semibold text-gray-900 mb-2">{donation.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{donation.quantity}</p>
                <div className="flex items-center justify-between">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(donation.status))}>
                    {donation.status}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Food Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            src={donation.images?.[0] || "https://via.placeholder.com/40x40"}
                            alt={donation.title}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{donation.title}</div>
                            <div className="text-sm text-gray-500">{donation.pickupLocation?.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(donation.status))}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CO₂ Saved:</span>
                    <span className="font-medium">{(stats.totalMealsShared * 0.5).toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water Saved:</span>
                    <span className="font-medium">{(stats.totalMealsShared * 2.1).toFixed(1)} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Waste Prevented:</span>
                    <span className="font-medium">{(stats.totalMealsShared * 0.3).toFixed(1)} kg</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Impact</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">People Helped:</span>
                    <span className="font-medium">{Math.ceil(stats.totalMealsShared / 2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Families Reached:</span>
                    <span className="font-medium">{Math.ceil(stats.totalMealsShared / 4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Community Rank:</span>
                    <span className="font-medium">Top 10%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
              <div className="space-y-4">
                {[
                  { month: "January", donations: 3, meals: 12 },
                  { month: "February", donations: 5, meals: 18 },
                  { month: "March", donations: 4, meals: 15 },
                ].map((month) => (
                  <div key={month.month} className="flex items-center space-x-4">
                    <div className="w-20 text-sm text-gray-600">{month.month}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(month.donations / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">{month.donations} donations</div>
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