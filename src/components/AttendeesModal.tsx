import { useState, useEffect } from "react";
import { XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import { supabase, TABLES } from "../supabase";

interface AttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

export default function AttendeesModal({
  isOpen,
  onClose,
  event,
}: AttendeesModalProps) {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      fetchAttendees();
    }
  }, [isOpen, event]);

  const fetchAttendees = async () => {
    if (!event || !event.attendee_ids || event.attendee_ids.length === 0) {
      setAttendees([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select("id, name, email, profile_image_url, role")
        .in("id", event.attendee_ids);

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      setAttendees([]);
    }
    setLoading(false);
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Event Attendees (
            {event.current_attendees || event.attendee_count || 0})
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {event.title}
            </h4>
            <p className="text-sm text-gray-600">
              {new Date(event.event_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500">
              Loading attendees...
            </div>
          ) : attendees.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No attendees yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 overflow-hidden">
                    {attendee.profile_image_url ? (
                      <img
                        src={attendee.profile_image_url}
                        alt={attendee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-primary-600">
                        {(attendee.name || attendee.email || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attendee.name || attendee.email}
                    </p>
                    {attendee.name && attendee.email && (
                      <p className="text-xs text-gray-500 truncate">
                        {attendee.email}
                      </p>
                    )}
                    {attendee.role && (
                      <span className="inline-block px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full mt-1">
                        {attendee.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
