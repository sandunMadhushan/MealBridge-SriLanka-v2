import React from 'react';
import { FoodListing } from '../types';
import { MapPinIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

interface FoodCardProps {
  listing: FoodListing;
  onClaim?: (id: string) => void;
  onRequest?: (id: string) => void;
}

export default function FoodCard({ listing, onClaim, onRequest }: FoodCardProps) {
  const timeUntilExpiry = Math.ceil((listing.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60));
  const isUrgent = timeUntilExpiry <= 6;

  return (
    <div className="card hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            listing.type === 'free' 
              ? 'bg-primary-100 text-primary-800' 
              : 'bg-secondary-100 text-secondary-800'
          )}>
            {listing.type === 'free' ? 'Free' : 'Half Price'}
          </span>
        </div>
        {isUrgent && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
              Urgent
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{listing.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{listing.description}</p>
        </div>

        {/* Category */}
        <div className="flex items-center space-x-2">
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', listing.category.color)}>
            {listing.category.icon} {listing.category.name}
          </span>
          <span className="text-sm text-gray-500">• {listing.quantity}</span>
        </div>

        {/* Location & Time */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {listing.pickupLocation.city}, {listing.pickupLocation.district}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span className={cn(isUrgent && 'text-red-600 font-medium')}>
              {timeUntilExpiry > 0 ? `${timeUntilExpiry}h remaining` : 'Expired'}
            </span>
          </div>
        </div>

        {/* Price */}
        {listing.type === 'half-price' && listing.price && (
          <div className="flex items-center text-sm">
            <CurrencyDollarIcon className="h-4 w-4 mr-1 text-secondary-600" />
            <span className="font-medium text-secondary-600">LKR {listing.price}</span>
          </div>
        )}

        {/* Donor Info */}
        <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {listing.donor.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{listing.donor.name}</p>
            <p className="text-xs text-gray-500">
              {listing.donor.stats.donationsGiven} donations
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          {listing.type === 'free' ? (
            <button
              onClick={() => onClaim?.(listing.id)}
              className="btn-primary flex-1 text-sm"
              disabled={listing.status !== 'available'}
            >
              {listing.status === 'available' ? 'Claim Food' : 'Not Available'}
            </button>
          ) : (
            <button
              onClick={() => onRequest?.(listing.id)}
              className="btn-secondary flex-1 text-sm"
              disabled={listing.status !== 'available'}
            >
              {listing.status === 'available' ? 'Request Food' : 'Not Available'}
            </button>
          )}
          {listing.deliveryRequested && (
            <button className="btn-outline text-sm px-3">
              🚚 Delivery
            </button>
          )}
        </div>
      </div>
    </div>
  );
}