import React from 'react';
import { 
  HeartIcon, 
  UsersIcon, 
  GlobeAltIcon, 
  BuildingStorefrontIcon,
  TruckIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import ImpactCard from '../components/ImpactCard';
import { impactStats } from '../data/mockData';

export default function Impact() {
  const environmentalImpact = [
    { label: 'CO₂ Emissions Reduced', value: '4,521 kg', description: 'Equivalent to planting 205 trees' },
    { label: 'Water Saved', value: '12,847 L', description: 'Through reduced food production needs' },
    { label: 'Landfill Waste Prevented', value: '8,934 kg', description: 'Food diverted from waste streams' },
  ];

  const socialImpact = [
    { label: 'Families Supported', value: '2,341', description: 'Regular access to nutritious meals' },
    { label: 'Children Fed', value: '5,678', description: 'Young lives positively impacted' },
    { label: 'Elderly Assisted', value: '1,234', description: 'Senior citizens supported' },
  ];

  const monthlyData = [
    { month: 'Jan', meals: 980, waste: 650 },
    { month: 'Feb', meals: 1240, waste: 820 },
    { month: 'Mar', meals: 1560, waste: 1030 },
    { month: 'Apr', meals: 1890, waste: 1250 },
    { month: 'May', meals: 2100, waste: 1390 },
    { month: 'Jun', meals: 2340, waste: 1550 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="impact-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Collective Impact</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Together, we're transforming surplus food into hope, reducing waste, and building stronger communities across Sri Lanka.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ImpactCard
            title="Total Meals Shared"
            value={impactStats.totalMealsShared}
            subtitle="Nutritious meals distributed"
            icon={<HeartIcon className="h-6 w-6" />}
            color="primary"
            trend={{ value: 23, label: 'vs last month' }}
          />
          <ImpactCard
            title="Active Community Members"
            value={impactStats.totalUsersActive}
            subtitle="Donors, recipients & volunteers"
            icon={<UsersIcon className="h-6 w-6" />}
            color="accent"
            trend={{ value: 15, label: 'vs last month' }}
          />
          <ImpactCard
            title="Food Waste Prevented"
            value={`${impactStats.totalFoodWasteSaved}kg`}
            subtitle="Diverted from landfills"
            icon={<GlobeAltIcon className="h-6 w-6" />}
            color="secondary"
            trend={{ value: 31, label: 'vs last month' }}
          />
          <ImpactCard
            title="Partner Businesses"
            value={impactStats.totalBusinessesJoined}
            subtitle="Restaurants, bakeries & hotels"
            icon={<BuildingStorefrontIcon className="h-6 w-6" />}
            color="primary"
            trend={{ value: 8, label: 'vs last month' }}
          />
        </div>

        {/* Environmental Impact */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Environmental Impact</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every meal shared contributes to a more sustainable future for Sri Lanka
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {environmentalImpact.map((item, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GlobeAltIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.value}</h3>
                <p className="font-medium text-gray-900 mb-1">{item.label}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <GlobeAltIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-900">Carbon Footprint Reduction</h3>
            </div>
            <p className="text-green-800 mb-4">
              By redistributing surplus food instead of letting it go to waste, MealBridge has prevented the equivalent of 
              <span className="font-bold"> 4,521 kg of CO₂</span> from entering the atmosphere. This is equivalent to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-700">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                205 trees planted and grown for 10 years
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                19,800 km driven by an average car
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                2.1 tons of waste recycled instead of landfilled
              </div>
            </div>
          </div>
        </section>

        {/* Social Impact */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Social Impact</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Building stronger, more connected communities through food sharing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialImpact.map((item, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.value}</h3>
                <p className="font-medium text-gray-900 mb-1">{item.label}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Growth Chart */}
        <section className="mb-12">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Growth Over Time</h2>
                <p className="text-gray-600">Monthly meals shared and waste prevented</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
            </div>

            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(data.meals / 2500) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-16">{data.meals} meals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-secondary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(data.waste / 1600) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-16">{data.waste}kg saved</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Meals Shared</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Waste Prevented (kg)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Volunteer Impact */}
        <section className="mb-12">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8">
            <div className="text-center">
              <TruckIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Volunteer Network Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-3xl font-bold text-orange-600">1,247</p>
                  <p className="text-gray-700">Deliveries Completed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-600">3,456</p>
                  <p className="text-gray-700">Volunteer Hours</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-600">89%</p>
                  <p className="text-gray-700">On-Time Delivery Rate</p>
                </div>
              </div>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Our dedicated volunteer network has made it possible to reach communities across all 25 districts of Sri Lanka, 
                ensuring that surplus food reaches those who need it most, when they need it.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Be Part of the Solution</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Every donation, every claim, and every volunteer hour contributes to these incredible numbers. 
              Join us in creating an even bigger impact for Sri Lanka's communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">Start Donating</button>
              <button className="btn-secondary">Become a Volunteer</button>
              <button className="btn-outline">Share Our Impact</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}