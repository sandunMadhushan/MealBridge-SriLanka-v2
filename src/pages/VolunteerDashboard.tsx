import { useState, useEffect } from "react";
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  HeartIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { supabase, TABLES } from "../supabase";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

interface Delivery {
  id: string;
  volunteerId?: string;
  status?: string; // <-- Made optional
  deliveryFee?: number;
  deliveryAddress?: {
    city?: string;
    district?: string;
    address?: string;
  };
  deliveryDateTime?: any;
  phone?: string;
  specialInstructions?: string;
  [key: string]: any;
}

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
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>(
    []
  );
  const [stats, setStats] = useState<VolunteerStats>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    activeDeliveries: 0,
    totalHours: 0,
    rating: 4.8,
    badges: [],
  });
  const [loading, setLoading] = useState(true);
  const [_notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchVolunteerData();
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

      const processedNotifications = (notificationsData || []).map((data) => ({
        id: data.id,
        userId: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: data.is_read,
        relatedId: data.related_id,
        createdAt: data.created_at,
        ...data,
      }));

      setNotifications(processedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  const fetchVolunteerData = async () => {
    if (!user) return;

    try {
      // Fetch assigned deliveries
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from(TABLES.DELIVERY_REQUESTS)
        .select("*")
        .eq("volunteer_id", user.id);

      if (deliveriesError) throw deliveriesError;

      const processedDeliveries: Delivery[] = (deliveriesData || []).map(
        (data) => ({
          id: data.id,
          volunteerId: data.volunteer_id,
          status: data.status || "pending",
          deliveryFee: data.delivery_fee,
          deliveryAddress: {
            address: data.delivery_address,
            city: data.city,
            district: data.district,
          },
          deliveryDateTime: data.delivery_date_time,
          phone: data.phone,
          specialInstructions: data.special_instructions,
          ...data,
        })
      );

      // Fetch available deliveries (not assigned)
      const { data: availableData, error: availableError } = await supabase
        .from(TABLES.DELIVERY_REQUESTS)
        .select("*")
        .eq("status", "pending")
        .is("volunteer_id", null);

      if (availableError) throw availableError;

      const processedAvailable: Delivery[] = (availableData || []).map(
        (data) => ({
          id: data.id,
          status: data.status || "pending",
          deliveryFee: data.delivery_fee,
          deliveryAddress: {
            address: data.delivery_address,
            city: data.city,
            district: data.district,
          },
          deliveryDateTime: data.delivery_date_time,
          phone: data.phone,
          specialInstructions: data.special_instructions,
          ...data,
        })
      );

      setDeliveries(processedDeliveries);
      setAvailableDeliveries(processedAvailable);

      // Calculate stats
      const totalDeliveries = processedDeliveries.length;
      const completedDeliveries = processedDeliveries.filter(
        (d) => (d.status ?? "pending") === "completed"
      ).length;
      const activeDeliveries = processedDeliveries.filter(
        (d) => (d.status ?? "pending") === "in-progress"
      ).length;
      const totalHours = completedDeliveries * 1.5;

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
    if (total >= 1)
      badges.push({
        name: "First Delivery",
        icon: "🚚",
        color: "bg-green-100 text-green-800",
      });
    if (total >= 5)
      badges.push({
        name: "Reliable Helper",
        icon: "⭐",
        color: "bg-blue-100 text-blue-800",
      });
    if (total >= 10)
      badges.push({
        name: "Delivery Hero",
        icon: "🦸",
        color: "bg-purple-100 text-purple-800",
      });
    if (completed >= 20)
      badges.push({
        name: "Community Champion",
        icon: "🏆",
        color: "bg-yellow-100 text-yellow-800",
      });
    return badges;
  };

  const acceptDelivery = async (deliveryId: string) => {
    try {
      const { error: updateError } = await supabase
        .from(TABLES.DELIVERY_REQUESTS)
        .update({
          volunteer_id: user?.id,
          volunteer_name: user?.user_metadata?.full_name || user?.email,
          status: "assigned",
          assigned_at: new Date().toISOString(),
        })
        .eq("id", deliveryId);

      if (updateError) throw updateError;

      // Get delivery request details to notify the requester
      const { data: deliveryData, error: fetchError } = await supabase
        .from(TABLES.DELIVERY_REQUESTS)
        .select("*")
        .eq("id", deliveryId)
        .single();

      if (fetchError) throw fetchError;

      if (deliveryData?.requester_id) {
        const { error: notificationError } = await supabase
          .from(TABLES.NOTIFICATIONS)
          .insert({
            user_id: deliveryData.requester_id,
            type: "delivery_assigned",
            title: "Volunteer Assigned",
            message: `${
              user?.user_metadata?.full_name || user?.email
            } will handle your delivery to ${deliveryData.city}`,
            is_read: false,
            created_at: new Date().toISOString(),
            related_id: deliveryId,
          });

        if (notificationError) throw notificationError;
      }
      fetchVolunteerData();
    } catch (error) {
      console.error("Error accepting delivery:", error);
    }
  };

  const completeDelivery = async (deliveryId: string) => {
    try {
      const { error: updateError } = await supabase
        .from(TABLES.DELIVERY_REQUESTS)
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", deliveryId);

      if (updateError) throw updateError;

      // Get delivery request details to notify the requester
      const { data: deliveryData, error: fetchError } = await supabase
        .from(TABLES.DELIVERY_REQUESTS)
        .select("*")
        .eq("id", deliveryId)
        .single();

      if (fetchError) throw fetchError;

      if (deliveryData?.requester_id) {
        const { error: notificationError } = await supabase
          .from(TABLES.NOTIFICATIONS)
          .insert({
            user_id: deliveryData.requester_id,
            type: "delivery_completed",
            title: "Delivery Completed",
            message: `Your food delivery to ${deliveryData.city} has been completed successfully!`,
            is_read: false,
            created_at: new Date().toISOString(),
            related_id: deliveryId,
          });

        if (notificationError) throw notificationError;
      }
      fetchVolunteerData();
    } catch (error) {
      console.error("Error completing delivery:", error);
    }
  };

  // Safe fallback to "pending" for missing statuses
  const getStatusColor = (status?: string) => {
    switch (status ?? "pending") {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
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

  const formatTime = (date: any) => {
    if (!date) return "N/A";
    if (date.toDate)
      return date
        .toDate()
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: HeartIcon },
    { id: "available", name: "Available Deliveries", icon: TruckIcon },
    { id: "my-deliveries", name: "My Deliveries", icon: ClockIcon },
    { id: "history", name: "Delivery History", icon: CheckCircleIcon },
  ];

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
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Volunteer Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-900">
                  {stats.rating}
                </span>
                <span className="text-gray-500">rating</span>
              </div>
              <Link
                to="/volunteer/schedule"
                className="flex items-center space-x-2 btn-primary"
              >
                <CalendarIcon className="w-5 h-5" />
                <span>My Schedule</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TruckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Deliveries
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalDeliveries}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedDeliveries}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Volunteer Hours
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalHours}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rating}/5.0
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
                    Complete deliveries to earn badges!
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  This Month
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deliveries Completed:</span>
                    <span className="font-medium">
                      {Math.floor(stats.completedDeliveries / 3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hours Volunteered:</span>
                    <span className="font-medium">
                      {Math.floor(stats.totalHours / 3)} hrs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">People Helped:</span>
                    <span className="font-medium">
                      {Math.floor(stats.completedDeliveries / 2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Impact Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meals Delivered:</span>
                    <span className="font-medium">
                      {stats.completedDeliveries * 2}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CO₂ Saved:</span>
                    <span className="font-medium">
                      {(stats.completedDeliveries * 1.2).toFixed(1)} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance Covered:</span>
                    <span className="font-medium">
                      {stats.completedDeliveries * 8} km
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {deliveries.slice(0, 5).map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <TruckIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Delivery to {delivery.deliveryAddress?.city}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(delivery.deliveryDateTime)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(delivery.status)
                      )}
                    >
                      {delivery.status ?? "pending"}
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
              <h3 className="text-lg font-semibold text-gray-900">
                Available Deliveries
              </h3>
              <span className="text-sm text-gray-500">
                {availableDeliveries.length} deliveries available
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="transition-shadow card hover:shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Food Delivery
                        </h4>
                        <p className="text-sm text-gray-600">
                          Fee: LKR {delivery.deliveryFee}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusColor(delivery.status)
                        )}
                      >
                        {delivery.status ?? "pending"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {delivery.deliveryAddress?.city},{" "}
                        {delivery.deliveryAddress?.district}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {formatDate(delivery.deliveryDateTime)} at{" "}
                        {formatTime(delivery.deliveryDateTime)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {delivery.phone}
                      </div>
                    </div>

                    {delivery.specialInstructions && (
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-700">
                          <strong>Instructions:</strong>{" "}
                          {delivery.specialInstructions}
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
            <h3 className="text-lg font-semibold text-gray-900">
              My Active Deliveries
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {deliveries
                .filter((d) => (d.status ?? "pending") !== "completed")
                .map((delivery) => (
                  <div key={delivery.id} className="card">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Delivery Assignment
                          </h4>
                          <p className="text-sm text-gray-600">
                            Fee: LKR {delivery.deliveryFee}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(delivery.status)
                          )}
                        >
                          {delivery.status ?? "pending"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4 mr-2" />
                          {delivery.deliveryAddress?.address}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          {formatDate(delivery.deliveryDateTime)} at{" "}
                          {formatTime(delivery.deliveryDateTime)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-2" />
                          {delivery.phone}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => completeDelivery(delivery.id)}
                          className="flex-1 text-sm btn-primary"
                          disabled={delivery.status === "completed"}
                        >
                          Mark Complete
                        </button>
                        <button className="flex-1 text-sm btn-outline">
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
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Delivery Details
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Address
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Fee Earned
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Food Delivery
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {delivery.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {delivery.deliveryAddress?.city}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.deliveryAddress?.district}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(delivery.deliveryDateTime)}
                        <br />
                        {formatTime(delivery.deliveryDateTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        LKR {delivery.deliveryFee?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(delivery.status)
                          )}
                        >
                          {delivery.status ?? "pending"}
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
