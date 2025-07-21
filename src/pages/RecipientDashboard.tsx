import { useState, useEffect } from "react";
import {
  ShoppingBagIcon,
  // ClockIcon,
  // CheckCircleIcon,
  HeartIcon,
  // MapPinIcon,
  CurrencyDollarIcon,
  TruckIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";

interface RecipientStats {
  totalClaims: number;
  totalRequests: number;
  completedOrders: number;
  totalMealsReceived: number;
  moneySaved: number;
  favoriteCategories: string[];
}

export default function RecipientDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [claims, setClaims] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [stats, setStats] = useState<RecipientStats>({
    totalClaims: 0,
    totalRequests: 0,
    completedOrders: 0,
    totalMealsReceived: 0,
    moneySaved: 0,
    favoriteCategories: [],
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchRecipientData();
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notificationsData = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  const fetchRecipientData = async () => {
    if (!user) return;

    try {
      // Fetch claims
      const claimsQuery = query(
        collection(db, "foodClaims"),
        where("claimantId", "==", user.uid)
      );
      const claimsSnapshot = await getDocs(claimsQuery);
      const claimsData = claimsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          status: data.status || "",
          createdAt: data.createdAt || null,
          pickupDateTime: data.pickupDateTime || null,
          contactMethod: data.contactMethod || "",
          notes: data.notes || "",
          ...data,
        };
      });

      // Fetch requests
      const requestsQuery = query(
        collection(db, "foodRequests"),
        where("requesterId", "==", user.uid)
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsData = requestsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          status: data.status || "",
          createdAt: data.createdAt || null,
          quantity: data.quantity || 1,
          totalPrice: data.totalPrice || 0,
          paymentMethod: data.paymentMethod || "",
          ...data,
        };
      });

      // Fetch deliveries
      const deliveriesQuery = query(
        collection(db, "deliveryRequests"),
        where("requesterId", "==", user.uid)
      );
      const deliveriesSnapshot = await getDocs(deliveriesQuery);
      const deliveriesData = deliveriesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          status: data.status || "",
          createdAt: data.createdAt || null,
          deliveryAddress: data.deliveryAddress || {},
          deliveryDateTime: data.deliveryDateTime || null,
          deliveryFee: data.deliveryFee || 0,
          ...data,
        };
      });

      setClaims(claimsData);
      setRequests(requestsData);
      setDeliveries(deliveriesData);

      // Calculate stats
      const totalClaims = claimsData.length;
      const totalRequests = requestsData.length;
      const completedOrders = [...claimsData, ...requestsData].filter(
        (item) => item.status === "completed"
      ).length;

      const totalMealsReceived =
        requestsData.reduce((sum, req) => sum + (req.quantity || 1), 0) +
        claimsData.length;
      const moneySaved = requestsData.reduce(
        (sum, req) => sum + (req.totalPrice || 0),
        0
      );

      setStats({
        totalClaims,
        totalRequests,
        completedOrders,
        totalMealsReceived,
        moneySaved,
        favoriteCategories: [
          "Fruits & Vegetables",
          "Bakery Items",
          "Prepared Meals",
        ],
      });
    } catch (error) {
      console.error("Error fetching recipient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
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

  const tabs = [
    { id: "overview", name: "Overview", icon: HeartIcon },
    { id: "claims", name: "My Claims", icon: ShoppingBagIcon },
    { id: "requests", name: "My Requests", icon: CurrencyDollarIcon },
    { id: "deliveries", name: "Deliveries", icon: TruckIcon },
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
                Recipient Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.displayName || user?.email}
              </p>
            </div>
            <Link
              to="/find-food"
              className="flex items-center space-x-2 btn-primary"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>Find Food</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingBagIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Claims
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalClaims}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRequests}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <HeartIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Meals Received
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalMealsReceived}
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
                <p className="text-sm font-medium text-gray-600">Money Saved</p>
                <p className="text-2xl font-bold text-gray-900">
                  LKR {stats.moneySaved.toLocaleString()}
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
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Your Impact
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Food Waste Prevented:</span>
                    <span className="font-medium">
                      {(stats.totalMealsReceived * 0.3).toFixed(1)} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CO₂ Saved:</span>
                    <span className="font-medium">
                      {(stats.totalMealsReceived * 0.5).toFixed(1)} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Community Rank:</span>
                    <span className="font-medium">Active Member</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Favorite Categories
                </h3>
                <div className="space-y-3">
                  {stats.favoriteCategories.map((category, index) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700">{category}</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < 5 - index
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[...claims, ...requests].slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100">
                        {item.quantity ? (
                          <CurrencyDollarIcon className="w-5 h-5 text-primary-600" />
                        ) : (
                          <ShoppingBagIcon className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.quantity
                            ? `Requested ${item.quantity} servings`
                            : "Claimed free food"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(item.status)
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "claims" && (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Claim Details
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Pickup Date
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Contact Method
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Date Claimed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claims.map((claim) => (
                    <tr key={claim.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Food Claim
                        </div>
                        <div className="text-sm text-gray-500">
                          {claim.notes || "No notes"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(claim.pickupDateTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {claim.contactMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(claim.status)
                          )}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(claim.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Request Details
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Total Price
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Food Request
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {request.quantity} servings
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        LKR {request.totalPrice?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {request.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(request.status)
                          )}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "deliveries" && (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Delivery Address
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Delivery Date
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Delivery Fee
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Requested Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.deliveryAddress?.address}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.deliveryAddress?.city},{" "}
                          {delivery.deliveryAddress?.district}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(delivery.deliveryDateTime)}
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
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(delivery.createdAt)}
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
