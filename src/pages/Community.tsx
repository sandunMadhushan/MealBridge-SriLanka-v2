import React, { useState } from 'react';
import { UserGroupIcon, TrophyIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import StoryCard from '../components/StoryCard';
import { communityStories, mockUsers } from '../data/mockData';
import { cn } from '../utils/cn';

export default function Community() {
  const [activeTab, setActiveTab] = useState('stories');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tabs = [
    { id: 'stories', name: 'Community Stories', icon: UserGroupIcon },
    { id: 'volunteers', name: 'Volunteers', icon: UserGroupIcon },
    { id: 'leaderboard', name: 'Leaderboard', icon: TrophyIcon },
    { id: 'events', name: 'Events', icon: CalendarIcon },
  ];

  const storyCategories = ['all', 'success', 'impact', 'community'];

  const filteredStories = selectedCategory === 'all' 
    ? communityStories 
    : communityStories.filter(story => story.category === selectedCategory);

  const volunteers = mockUsers.filter(user => user.role === 'volunteer');

  const leaderboard = mockUsers
    .sort((a, b) => b.stats.impactScore - a.stats.impactScore)
    .slice(0, 10);

  const upcomingEvents = [
    {
      id: '1',
      title: 'Community Food Drive',
      date: new Date('2024-02-15'),
      location: 'Colombo Central Park',
      description: 'Join us for a community food collection drive to help families in need.',
      attendees: 45,
      image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '2',
      title: 'Food Safety Workshop',
      date: new Date('2024-02-20'),
      location: 'Kandy Community Center',
      description: 'Learn best practices for food handling and safety in donations.',
      attendees: 28,
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: '3',
      title: 'Volunteer Appreciation Day',
      date: new Date('2024-02-25'),
      location: 'Galle Beach Resort',
      description: 'Celebrating our amazing volunteers with food, fun, and recognition.',
      attendees: 67,
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MealBridge Community</h1>
            <p className="text-lg text-gray-600">
              Connect with fellow food heroes and share your impact stories
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Community Stories</h2>
              <div className="flex space-x-2">
                {storyCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                      selectedCategory === category
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {category === 'all' ? 'All Stories' : category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onLike={(id) => console.log('Like story:', id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Volunteers Tab */}
        {activeTab === 'volunteers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Our Amazing Volunteers</h2>
              <button className="btn-primary">Become a Volunteer</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteers.map((volunteer) => (
                <div key={volunteer.id} className="card">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-xl">
                        {volunteer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{volunteer.name}</h3>
                      <p className="text-sm text-gray-600">{volunteer.location}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Joined {volunteer.joinedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Volunteer Hours:</span>
                      <span className="font-medium">{volunteer.stats.volunteersHours || 0}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Impact Score:</span>
                      <span className="font-medium">{volunteer.stats.impactScore}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {volunteer.stats.badges.map((badge) => (
                      <span
                        key={badge.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                        title={badge.description}
                      >
                        {badge.icon} {badge.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Community Leaderboard</h2>
              <select className="input-field w-auto">
                <option>This Month</option>
                <option>All Time</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Contributors</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {leaderboard.map((user, index) => (
                  <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm',
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-50 text-gray-600'
                      )}>
                        {index + 1}
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary-600">{user.stats.impactScore}</p>
                      <p className="text-xs text-gray-500">Impact Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              <button className="btn-primary">Create Event</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="card hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-lg px-2 py-1">
                      <p className="text-xs font-medium text-gray-900">
                        {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {event.date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        {event.attendees} attending
                      </div>
                    </div>

                    <button className="btn-primary w-full">Join Event</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}