import { useState, useMemo } from "react";
import {
  UserGroupIcon,
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  PlusIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import StoryCard from "../components/StoryCard";
import CreateEventModal from "../components/CreateEventModal";
import CreateStoryModal from "../components/CreateStoryModal";
import { cn } from "../utils/cn";

// Firebase
import useCollection from "../hooks/useCollection";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, increment, addDoc, collection } from "firebase/firestore";

export default function Community() {
  const { user } = useAuth();
  // Hooks to fetch Firestore collections
  const { documents: communityStories = [], loading: storiesLoading } =
    useCollection("communityStories");
  const { documents: users = [], loading: usersLoading } =
    useCollection("users");
  const { documents: events = [], loading: eventsLoading } =
    useCollection("events");

  const [activeTab, setActiveTab] = useState("stories");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [createStoryModalOpen, setCreateStoryModalOpen] = useState(false);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);

  const tabs = [
    { id: "stories", name: "Community Stories", icon: UserGroupIcon },
    { id: "volunteers", name: "Volunteers", icon: UserGroupIcon },
    { id: "leaderboard", name: "Leaderboard", icon: TrophyIcon },
    { id: "events", name: "Events", icon: CalendarIcon },
  ];

  const storyCategories = ["all", "success", "impact", "community"];

  const filteredStories = useMemo(() => {
    if (selectedCategory === "all") return communityStories;
    return communityStories.filter(
      (story: any) => story.category === selectedCategory
    );
  }, [selectedCategory, communityStories]);

  // Volunteers: users with role 'volunteer'
  const volunteers = useMemo(
    () => users.filter((user: any) => user.role === "volunteer"),
    [users]
  );

  // Leaderboard: top 10 by impactScore
  const leaderboard = useMemo(() => {
    return [...users]
      .sort(
        (a: any, b: any) =>
          (b.stats?.impactScore || 0) - (a.stats?.impactScore || 0)
      )
      .slice(0, 10);
  }, [users]);

  // Filter upcoming events (future dates only)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event: any) => {
      const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
      return eventDate > now;
    }).sort((a: any, b: any) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [events]);

  // Utility to handle Firestore Timestamp toDate() or fallbacks
  function safeDate(val: any) {
    if (!val) return "";
    if (typeof val === "string") return new Date(val);
    if (val.toDate) return val.toDate();
    return new Date(val);
  }

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      alert("Please sign in to join events.");
      return;
    }

    setJoinLoading(eventId);
    try {
      const event = events.find((e: any) => e.id === eventId);
      const isAlreadyJoined = event?.attendees?.includes(user.uid);

      if (isAlreadyJoined) {
        // Leave event
        await updateDoc(doc(db, "events", eventId), {
          attendees: arrayRemove(user.uid),
          attendeeCount: increment(-1),
        });

        // Create notification for event creator
        if (event.createdBy?.id && event.createdBy.id !== user.uid) {
          await addDoc(collection(db, "notifications"), {
            userId: event.createdBy.id,
            type: "event_left",
            title: "Someone Left Your Event",
            message: `${user.displayName || user.email} left your event: ${event.title}`,
            read: false,
            createdAt: new Date(),
            relatedId: eventId,
          });
        }
      } else {
        // Join event
        await updateDoc(doc(db, "events", eventId), {
          attendees: arrayUnion(user.uid),
          attendeeCount: increment(1),
        });

        // Create notification for event creator
        if (event.createdBy?.id && event.createdBy.id !== user.uid) {
          await addDoc(collection(db, "notifications"), {
            userId: event.createdBy.id,
            type: "event_joined",
            title: "New Event Attendee!",
            message: `${user.displayName || user.email} joined your event: ${event.title}`,
            read: false,
            createdAt: new Date(),
            relatedId: eventId,
          });
        }

        // Create notification for the user who joined
        await addDoc(collection(db, "notifications"), {
          userId: user.uid,
          type: "event_joined_confirmation",
          title: "Event Joined Successfully!",
          message: `You have successfully joined: ${event.title}`,
          read: false,
          createdAt: new Date(),
          relatedId: eventId,
        });
      }
    } catch (error) {
      console.error("Error joining/leaving event:", error);
      alert("Failed to update event attendance. Please try again.");
    }
    setJoinLoading(null);
  };

  const refreshEvents = () => {
    // This will be called when a new event is created
    // The useCollection hook will automatically refresh
  };

  const refreshStories = () => {
    // This will be called when a new story is created
    // The useCollection hook will automatically refresh
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              MealBridge Community
            </h1>
            <p className="text-lg text-gray-600">
              Connect with fellow food heroes and share your impact stories
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
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

        {/* Stories Tab */}
        {activeTab === "stories" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Community Stories
              </h2>
              <div className="flex items-center space-x-4">
                {user && (
                  <button 
                    className="flex items-center space-x-2 btn-primary"
                    onClick={() => setCreateStoryModalOpen(true)}
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    <span>Share Your Story</span>
                  </button>
                )}
                <div className="flex space-x-2">
                {storyCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                      selectedCategory === category
                        ? "bg-primary-100 text-primary-800"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {category === "all" ? "All Stories" : category}
                  </button>
                ))}
              </div>
              </div>
            </div>

            {storiesLoading ? (
              <div>Loading stories...</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStories.map((story: any) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onLike={(id) => console.log("Like story:", id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Volunteers Tab */}
        {activeTab === "volunteers" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Our Amazing Volunteers
              </h2>
              <button className="btn-primary">Become a Volunteer</button>
            </div>

            {usersLoading ? (
              <div>Loading volunteers...</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {volunteers.map((volunteer: any) => (
                  <div key={volunteer.id} className="card">
                    <div className="flex items-center mb-4 space-x-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
                        <span className="text-xl font-bold text-primary-600">
                          {volunteer.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {volunteer.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {volunteer.location}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          Joined{" "}
                          {volunteer.joinedAt
                            ? safeDate(volunteer.joinedAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Volunteer Hours:</span>
                        <span className="font-medium">
                          {volunteer.stats?.volunteersHours || 0}h
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impact Score:</span>
                        <span className="font-medium">
                          {volunteer.stats?.impactScore || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(volunteer.stats?.badges || []).map((badge: any) => (
                        <span
                          key={badge.id}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full"
                          title={badge.description}
                        >
                          {badge.icon} {badge.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Community Leaderboard
              </h2>
              <select className="w-auto input-field">
                <option>This Month</option>
                <option>All Time</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="overflow-hidden bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Top Contributors
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {leaderboard.map((user: any, index: number) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                          index === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : index === 1
                            ? "bg-gray-100 text-gray-800"
                            : index === 2
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-50 text-gray-600"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
                        <span className="font-medium text-primary-600">
                          {user.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">
                        {user.stats?.impactScore || 0}
                      </p>
                      <p className="text-xs text-gray-500">Impact Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Events
              </h2>
              <button 
                className="flex items-center space-x-2 btn-primary"
                onClick={() => setCreateEventModalOpen(true)}
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Event</span>
              </button>
            </div>

            {eventsLoading ? (
              <div className="py-12 text-center text-gray-500">Loading events...</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event: any) => {
                  const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                  const isJoined = user && event.attendees?.includes(user.uid);
                  const isLoading = joinLoading === event.id;
                  
                  return (
                    <div
                      key={event.id}
                      className="transition-shadow card hover:shadow-lg"
                    >
                      <div className="relative mb-4 overflow-hidden rounded-lg">
                        <img
                          src={event.image || "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800"}
                          alt={event.title}
                          className="object-cover w-full h-48"
                        />
                        <div className="absolute px-2 py-1 bg-white rounded-lg top-2 right-2">
                          <p className="text-xs font-medium text-gray-900">
                            {eventDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600">{event.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {eventDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="w-4 h-4 mr-2" />
                            {event.location}, {event.city}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <UserGroupIcon className="w-4 h-4 mr-2" />
                            {event.attendeeCount || 0} attending
                            {event.maxAttendees && ` (max ${event.maxAttendees})`}
                          </div>
                        </div>

                        <button 
                          className={cn(
                            "w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200",
                            isJoined 
                              ? "bg-red-100 text-red-700 hover:bg-red-200" 
                              : "btn-primary"
                          )}
                          onClick={() => handleJoinEvent(event.id)}
                          disabled={isLoading}
                        >
                          {isLoading 
                            ? "Updating..." 
                            : isJoined 
                              ? "Leave Event" 
                              : "Join Event"
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
                {upcomingEvents.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No upcoming events</h3>
                    <p className="text-gray-600">Be the first to create an event for the community!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={createEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
        onEventCreated={refreshEvents}
      />

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={createStoryModalOpen}
        onClose={() => setCreateStoryModalOpen(false)}
        onStoryCreated={refreshStories}
      />
    </div>
  );
}
