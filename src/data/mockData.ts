import { FoodListing, User, FoodCategory, ImpactStats, Story, Badge } from '../types';

export const foodCategories: FoodCategory[] = [
  { id: '1', name: 'Fruits & Vegetables', icon: '🥕', color: 'bg-green-100 text-green-800' },
  { id: '2', name: 'Bakery Items', icon: '🍞', color: 'bg-yellow-100 text-yellow-800' },
  { id: '3', name: 'Dairy Products', icon: '🥛', color: 'bg-blue-100 text-blue-800' },
  { id: '4', name: 'Prepared Meals', icon: '🍽️', color: 'bg-purple-100 text-purple-800' },
  { id: '5', name: 'Beverages', icon: '🥤', color: 'bg-orange-100 text-orange-800' },
  { id: '6', name: 'Snacks', icon: '🍪', color: 'bg-pink-100 text-pink-800' },
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Silva',
    role: 'donor',
    location: 'Colombo',
    verified: true,
    joinedAt: new Date('2024-01-15'),
    stats: {
      donationsGiven: 25,
      impactScore: 850,
      badges: [
        { id: '1', name: 'Food Hero', description: 'Donated 20+ meals', icon: '🏆', earnedAt: new Date() },
        { id: '2', name: 'Community Champion', description: 'Active for 6 months', icon: '⭐', earnedAt: new Date() }
      ]
    }
  },
  {
    id: '2',
    email: 'priya@example.com',
    name: 'Priya Fernando',
    role: 'recipient',
    location: 'Kandy',
    verified: true,
    joinedAt: new Date('2024-02-10'),
    stats: {
      donationsReceived: 12,
      impactScore: 320,
      badges: [
        { id: '3', name: 'Grateful Heart', description: 'Received first donation', icon: '💚', earnedAt: new Date() }
      ]
    }
  },
  {
    id: '3',
    email: 'ravi@example.com',
    name: 'Ravi Perera',
    role: 'volunteer',
    location: 'Galle',
    verified: true,
    joinedAt: new Date('2024-01-20'),
    stats: {
      volunteersHours: 45,
      impactScore: 680,
      badges: [
        { id: '4', name: 'Delivery Master', description: 'Completed 30+ deliveries', icon: '🚚', earnedAt: new Date() }
      ]
    }
  }
];

export const mockFoodListings: FoodListing[] = [
  {
    id: '1',
    title: 'Fresh Vegetable Bundle',
    description: 'Mixed vegetables including carrots, beans, and leafy greens. Perfect for a family meal.',
    category: foodCategories[0],
    quantity: '2-3 servings',
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    pickupLocation: {
      address: '123 Galle Road',
      city: 'Colombo',
      district: 'Colombo'
    },
    images: ['https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800'],
    donorId: '1',
    donor: mockUsers[0],
    type: 'free',
    status: 'available',
    createdAt: new Date(),
    deliveryRequested: false,
    safetyChecklist: {
      freshness: true,
      properStorage: true,
      hygieneStandards: true,
      labelingComplete: true,
      allergenInfo: []
    }
  },
  {
    id: '2',
    title: 'Bakery Surplus - Bread & Pastries',
    description: 'Fresh bread and pastries from our bakery. Baked this morning, perfect for evening consumption.',
    category: foodCategories[1],
    quantity: '10-15 items',
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    pickupLocation: {
      address: '456 Kandy Road',
      city: 'Kandy',
      district: 'Kandy'
    },
    images: ['https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800'],
    donorId: '1',
    donor: mockUsers[0],
    type: 'half-price',
    price: 500,
    status: 'available',
    createdAt: new Date(),
    deliveryRequested: true,
    safetyChecklist: {
      freshness: true,
      properStorage: true,
      hygieneStandards: true,
      labelingComplete: true,
      allergenInfo: ['gluten', 'eggs']
    }
  },
  {
    id: '3',
    title: 'Restaurant Surplus Meals',
    description: 'Prepared rice and curry meals from our restaurant. Freshly cooked and properly stored.',
    category: foodCategories[3],
    quantity: '8 portions',
    expiryDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
    pickupLocation: {
      address: '789 Main Street',
      city: 'Galle',
      district: 'Galle'
    },
    images: ['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'],
    donorId: '1',
    donor: mockUsers[0],
    type: 'free',
    status: 'available',
    createdAt: new Date(),
    deliveryRequested: false,
    safetyChecklist: {
      freshness: true,
      properStorage: true,
      hygieneStandards: true,
      labelingComplete: true,
      allergenInfo: ['dairy', 'spices']
    }
  }
];

export const impactStats: ImpactStats = {
  totalMealsShared: 12847,
  totalUsersActive: 3421,
  totalFoodWasteSaved: 8934,
  totalBusinessesJoined: 156,
  co2Saved: 4521,
  peopleReached: 9876
};

export const communityStories: Story[] = [
  {
    id: '1',
    title: 'How MealBridge Helped My Family During Tough Times',
    content: 'When I lost my job during the pandemic, MealBridge became a lifeline for my family. The fresh vegetables and meals we received helped us get through the most difficult period...',
    author: mockUsers[1],
    images: ['https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'],
    category: 'success',
    createdAt: new Date('2024-01-10'),
    likes: 234
  },
  {
    id: '2',
    title: 'From Waste to Wonder: Our Restaurant\'s Journey',
    content: 'As a restaurant owner, I was troubled by the amount of food we had to throw away daily. MealBridge gave us a purpose and helped us contribute to our community...',
    author: mockUsers[0],
    images: ['https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800'],
    category: 'impact',
    createdAt: new Date('2024-01-05'),
    likes: 189
  },
  {
    id: '3',
    title: 'Volunteering: The Most Rewarding Experience',
    content: 'Being a delivery volunteer for MealBridge has been incredibly fulfilling. Every delivery is a chance to make someone\'s day better and reduce food waste...',
    author: mockUsers[2],
    images: ['https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800'],
    category: 'community',
    createdAt: new Date('2024-01-01'),
    likes: 156
  }
];