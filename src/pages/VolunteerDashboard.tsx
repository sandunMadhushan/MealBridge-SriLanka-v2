import { useState, useEffect } from "react";
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  UserGroupIcon,
  HeartIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

interface VolunteerStats {
  totalDeliveries: number;
  completedDeliveries: number;
  activeDeliveries: number;
  totalHours: number;
  rating: number;
  badges: any[];
}

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);
  const [stats, setStats] = useState<VolunteerStats>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    activeDeliveries: 0,
    totalHours: 0,
    rating: 4.8,
    badges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVolunteerData();
    }
  }, [user]);

  const fetchVolunteerData = async () => {
    if (!user) return;
    
    try {
      // Fetch assigned deliveries
      const deliveriesQuery = query(
        collection(db, "deliveryRequests"),
        where("volunteerId", "==", user.uid)
      );
      const deliveriesSnapshot = await getDocs(deliveriesQuery);
      const deliveriesData = deliveriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch available deliveries (not assigned)
      const availableQuery = query(
        collection(db, "deliveryRequests"),
        where("status", "==", "pending")
      );
      const availableSnapshot = await getDocs(availableQuery);
      const availableData = availableSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDeliveries(deliveriesData);
      setAvailableDeliveries(availableData.filter(d => !d.volunteerId));
      
      // Calculate stats
      const totalDeliveries = deliveriesData.length;
      const completedDeliveries = deliveriesData.filter(d => d.status === "completed").length;
      const activeDeliveries = deliveriesData.filter(d => d.status === "in-progress").length;
      const totalHours = completedDeliveries * 1.5; // Estimate 1.5 hours per delivery
      
      setStats({
        totalDeliveries,
        completedDeliveries,
        activeDeliveries,
        totalHours,
        rating: 4.8,
        badges: generateBadges(totalDeliveries, completedDeliveries),
      });
    } catch (error) {
      console.error("Error fetching volunteer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateBadges = (total: number, completed: number) => {
    const badges = [];
    if (total >= 1) badges.push({ name: "First Delivery", icon: "🚚", color: "bg-green-100 text-green-800" });
    if (total >= 5) badges.push({ name: "Reliable Helper", icon: "⭐", color: "bg-blue-100 text-blue-800" });
    if (total >= 10) badges.push({ name: "Delivery Hero", icon: "🦸", color: "bg-purple-100 text-purple-800" });
    if (completed >= 20) badges.push({ name: "Community Champion", icon: "🏆", color: "bg-yellow-100 text-yellow-800" });
    return badges;
  };

  const acceptDelivery = async (deliveryId: string) => {
    try {
      await updateDoc(doc(db, "deliveryRequests", deliveryId), {
        volunteerId: user?.uid,
        volunteerName: user?.displayName || user?.email,
        status: "assigned",
        assignedAt: new Date(),
      });
      
      // Refresh data
      fetchVolunteerData();
    } catch (error) {
      console.error("Error accepting delivery:", error);
    }
  };

  const completeDelivery = async (deliveryId: string) => {
    try {
      await updateDoc(doc(db, "deliveryRequests", deliveryId), {
        status: "completed",
        completedAt: new Date(),
      });
      
      // Refresh data
      fetchVolunteerData();
    } catch (error) {
      console.error("Error completing delivery:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date: any) => {
    if (!date) return "N/A";
    if (date.toDate) return date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: HeartIcon },
    { id: "available", name: "Available Deliveries", icon: TruckIcon },
    { id: "my-deliveries", name: "My Deliveries", icon: ClockIcon },
    { id: "history", name: "Delivery History", icon: CheckCircleIcon },
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
              <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.displayName || user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-900">{stats.rating}</span>
                <span className="text-gray-500">rating</span>
              </div>
              <Link to="/volunteer/schedule" className="btn-primary flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>My Schedule</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <TruckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Volunteer Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <StarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rating}/5.0</p>
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
                  <p className="text-gray-500">Complete deliveries to earn badges!</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deliveries Completed:</span>
                    <span className="font-medium">{Math.floor(stats.completedDeliveries / 3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hours Volunteered:</span>
                    <span className="font-medium">{Math.floor(stats.totalHours / 3)} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">People Helped:</span>
                    <span className="font-medium">{Math.floor(stats.completedDeliveries / 2)}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meals Delivered:</span>
                    <span className="font-medium">{stats.completedDeliveries * 2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CO₂ Saved:</span>
                    <span className="font-medium">{(stats.completedDeliveries * 1.2).toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance Covered:</span>
                    <span className="font-medium">{stats.completedDeliveries * 8} km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {deliveries.slice(0, 5).map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <TruckIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Delivery to {delivery.deliveryAddress?.city}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(delivery.deliveryDateTime)}</p>
                      </div>
                    </div>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(delivery.status))}>
                      {delivery.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "available" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Available Deliveries</h3>
              <span className="text-sm text-gray-500">{availableDeliveries.length} deliveries available</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDeliveries.map((delivery) => (
                <div key={delivery.id} className="card hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Food Delivery</h4>
                        <p className="text-sm text-gray-600">Fee: LKR {delivery.deliveryFee}</p>
                      </div>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(delivery.status))}>
                        {delivery.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {delivery.deliveryAddress?.city}, {delivery.deliveryAddress?.district}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {formatDate(delivery.deliveryDateTime)} at {formatTime(delivery.deliveryDateTime)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {delivery.phone}
                      </div>
                    </div>

                    {delivery.specialInstructions && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Instructions:</strong> {delivery.specialInstructions}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => acceptDelivery(delivery.id)}
                      className="w-full btn-primary"
                    >
                      Accept Delivery
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "my-deliveries" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">My Active Deliveries</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveries.filter(d => d.status !== "completed").map((delivery) => (
                <div key={delivery.id} className="card">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Delivery Assignment</h4>
                        <p className="text-sm text-gray-600">Fee: LKR {delivery.deliveryFee}</p>
                      </div>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(delivery.status))}>
                        {delivery.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {delivery.deliveryAddress?.address}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {formatDate(delivery.deliveryDateTime)} at {formatTime(delivery.deliveryDateTime)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {delivery.phone}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => completeDelivery(delivery.id)}
                        className="flex-1 btn-primary text-sm"
                        disabled={delivery.status === "completed"}
                      >
                        Mark Complete
                      </button>
                      <button className="flex-1 btn-outline text-sm">
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Earned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Food Delivery</div>
                        <div className="text-sm text-gray-500">ID: {delivery.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{delivery.deliveryAddress?.city}</div>
                        <div className="text-sm text-gray-500">{delivery.deliveryAddress?.district}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(delivery.deliveryDateTime)}
                        <br />
                        {formatTime(delivery.deliveryDateTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        LKR {delivery.deliveryFee?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(delivery.status))}>
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}