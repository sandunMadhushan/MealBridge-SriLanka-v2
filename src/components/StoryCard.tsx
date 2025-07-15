import { Story } from "../types";
import { HeartIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { cn } from "../utils/cn";

interface StoryCardProps {
  story: Story;
  onLike?: (id: string) => void;
  liked?: boolean;
}

export default function StoryCard({
  story,
  onLike,
  liked = false,
}: StoryCardProps) {
  const categoryColors = {
    success: "bg-green-100 text-green-800",
    impact: "bg-blue-100 text-blue-800",
    community: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="card hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={story.images[0]}
          alt={story.title}
          className="w-full h-48 object-cover"
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
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
          {story.title}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-3">{story.content}</p>

        {/* Author & Date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {story.author.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {story.author.name}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {story.createdAt.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Like Button */}
          <button
            onClick={() => onLike?.(story.id)}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            {liked ? (
              <HeartSolidIcon className="h-4 w-4 text-red-500" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
            <span>{story.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
