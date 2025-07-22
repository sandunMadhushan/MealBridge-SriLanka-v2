import { useState, useEffect } from "react";
import {
  BellIcon,
  XMarkIcon,
  // CheckIcon,
  // ClockIcon,
  TruckIcon,
  GiftIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { cn } from "../utils/cn";

interface Notification {
  id: string;
  userId: string;
  type:
    | "food_request"
    | "food_claim"
    | "delivery_request"
    | "request_accepted"
    | "request_declined"
    | "delivery_assigned"
    | "delivery_completed"
    | "event_created"
    | "event_joined"
    | "event_left"
    | "event_joined_confirmation";
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  relatedId?: string;
  actionData?: any;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestDetails, setRequestDetails] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationData = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Notification)
      );
      setNotifications(notificationData);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setLoading(true);

    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Load related details based on notification type
    if (notification.relatedId) {
      try {
        let details = null;
        if (notification.type === "food_request") {
          const requestDoc = await getDoc(
            doc(db, "foodRequests", notification.relatedId)
          );
          if (requestDoc.exists()) {
            details = { id: requestDoc.id, ...requestDoc.data() };
          }
        } else if (notification.type === "food_claim") {
          const claimDoc = await getDoc(
            doc(db, "foodClaims", notification.relatedId)
          );
          if (claimDoc.exists()) {
            details = { id: claimDoc.id, ...claimDoc.data() };
          }
        } else if (notification.type === "delivery_request") {
          const deliveryDoc = await getDoc(
            doc(db, "deliveryRequests", notification.relatedId)
          );
          if (deliveryDoc.exists()) {
            details = { id: deliveryDoc.id, ...deliveryDoc.data() };
          }
        }
        setRequestDetails(details);
      } catch (error) {
        console.error("Error loading request details:", error);
      }
    }
    setLoading(false);
  };

  const handleAcceptRequest = async () => {
    if (!selectedNotification || !requestDetails) return;

    setLoading(true);
    try {
      let collectionName = "";
      if (selectedNotification.type === "food_request") {
        collectionName = "foodRequests";
      } else if (selectedNotification.type === "food_claim") {
        collectionName = "foodClaims";
      } else if (selectedNotification.type === "delivery_request") {
        collectionName = "deliveryRequests";
      }

      // Update request status
      await updateDoc(doc(db, collectionName, requestDetails.id), {
        status: "accepted",
      });

      // Create notification for requester
      await createNotification(
        requestDetails.requesterId || requestDetails.claimantId,
        "request_accepted",
        "Request Accepted!",
        `Your ${selectedNotification.type.replace(
          "_",
          " "
        )} has been accepted.`,
        requestDetails.id
      );

      setSelectedNotification(null);
      setRequestDetails(null);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
    setLoading(false);
  };

  const handleDeclineRequest = async () => {
    if (!selectedNotification || !requestDetails) return;

    setLoading(true);
    try {
      let collectionName = "";
      if (selectedNotification.type === "food_request") {
        collectionName = "foodRequests";
      } else if (selectedNotification.type === "food_claim") {
        collectionName = "foodClaims";
      } else if (selectedNotification.type === "delivery_request") {
        collectionName = "deliveryRequests";
      }

      // Update request status
      await updateDoc(doc(db, collectionName, requestDetails.id), {
        status: "declined",
      });

      // Create notification for requester
      await createNotification(
        requestDetails.requesterId || requestDetails.claimantId,
        "request_declined",
        "Request Declined",
        `Your ${selectedNotification.type.replace(
          "_",
          " "
        )} has been declined.`,
        requestDetails.id
      );

      setSelectedNotification(null);
      setRequestDetails(null);
    } catch (error) {
      console.error("Error declining request:", error);
    }
    setLoading(false);
  };

  const createNotification = async (
    userId: string,
    type: string,
    title: string,
    message: string,
    relatedId?: string
  ) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date(),
        relatedId,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "food_request":
      case "food_claim":
        return <GiftIcon className="w-5 h-5" />;
      case "delivery_request":
      case "delivery_assigned":
      case "delivery_completed":
        return <TruckIcon className="w-5 h-5" />;
      case "event_created":
      case "event_joined":
      case "event_left":
      case "event_joined_confirmation":
        return <CalendarIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    if (date.toDate) return date.toDate().toLocaleString();
    return new Date(date).toLocaleString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 transition-colors hover:text-gray-500"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-80 top-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                    !notification.read && "bg-blue-50"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        notification.read
                          ? "bg-gray-100 text-gray-600"
                          : "bg-primary-100 text-primary-600"
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          notification.read
                            ? "text-gray-900"
                            : "text-gray-900 font-semibold"
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedNotification.title}
              </h3>
              <button
                onClick={() => {
                  setSelectedNotification(null);
                  setRequestDetails(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
                  <p className="text-gray-600">Loading details...</p>
                </div>
              ) : requestDetails ? (
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="mb-2 font-medium text-gray-900">
                      Request Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Requester:</span>
                        <span className="font-medium">
                          {requestDetails.requesterName ||
                            requestDetails.claimantName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>
                          {requestDetails.requesterEmail ||
                            requestDetails.claimantEmail}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>{requestDetails.phone}</span>
                      </div>
                      {requestDetails.quantity && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span>{requestDetails.quantity} servings</span>
                        </div>
                      )}
                      {requestDetails.totalPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Price:</span>
                          <span className="font-medium">
                            LKR {requestDetails.totalPrice}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            requestDetails.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : requestDetails.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {requestDetails.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {requestDetails.notes && (
                    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <h5 className="mb-1 font-medium text-gray-900">Notes:</h5>
                      <p className="text-sm text-gray-700">
                        {requestDetails.notes}
                      </p>
                    </div>
                  )}

                  {requestDetails.status === "pending" && (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDeclineRequest}
                        className="flex-1 btn-outline"
                        disabled={loading}
                      >
                        Decline
                      </button>
                      <button
                        onClick={handleAcceptRequest}
                        className="flex-1 btn-primary"
                        disabled={loading}
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>{selectedNotification.message}</p>
                  <p className="mt-2 text-sm">
                    {formatDate(selectedNotification.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
