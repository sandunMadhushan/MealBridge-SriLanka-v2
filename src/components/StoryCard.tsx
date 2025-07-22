import { Story } from "../types";
import { HeartIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { PencilIcon } from "@heroicons/react/24/outline";
import { cn } from "../utils/cn";

interface StoryCardProps {
  story: Story;
  onLike?: (id: string) => void;
  liked?: boolean;
  onEdit?: (story: Story) => void;
  currentUserId?: string;
}

// Helper for robust date formatting (Firestore Timestamp, string, Date)
function formatDate(val: any): string {
  if (!val) return "";
  if (typeof val === "string" || typeof val === "number") {
    // string (possibly ISO) or timestamp as ms
    const d = new Date(val);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  }
  if (val.toDate && typeof val.toDate === "function") {
    // Firestore Timestamp
    const d = val.toDate();
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  }
  if (val instanceof Date) {
    return val.toLocaleDateString();
  }
  return "";
}

export default function StoryCard({
  story,
  onLike,
  liked = false,
  onEdit,
  currentUserId,
}: StoryCardProps) {
  const categoryColors = {
    success: "bg-green-100 text-green-800",
    impact: "bg-blue-100 text-blue-800",
    community: "bg-purple-100 text-purple-800",
  };

  const isAuthor = currentUserId && story.author?.id === currentUserId;
  return (
    <div className="transition-all duration-300 card hover:shadow-lg">
      {/* Image */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img
          src={story.images?.[0] || "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"}
          alt={story.title}
          className="object-cover w-full h-48"
        />
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium capitalize",
              categoryColors[story.category]
            )}
          >
            {story.category}
          </span>
        </div>
        {isAuthor && onEdit && (
          <button
            onClick={() => onEdit(story)}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
            title="Edit Story"
          >
            <PencilIcon className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold leading-tight text-gray-900">
          {story.title}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-3">{story.content}</p>

        {/* Author & Date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {story.author?.photoURL ? (
              <img
                src={story.author.photoURL}
                alt={story.author.name}
                className="object-cover w-8 h-8 rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100">
                <span className="text-sm font-medium text-primary-600">
                  {story.author?.name?.charAt(0) || "U"}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {story.author?.name || "Anonymous"}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {formatDate(story.createdAt)}
              </div>
            </div>
          </div>

          {/* Like Button */}
          <button
            onClick={() => onLike?.(story.id)}
            className="flex items-center space-x-1 text-sm text-gray-500 transition-colors hover:text-red-500"
          >
            {liked ? (
              <HeartSolidIcon className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
            <span>{story.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
