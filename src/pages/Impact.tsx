import {
  HeartIcon,
  UsersIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import ImpactCard from "../components/ImpactCard";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
// NEW: Import from Recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";

export default function Impact() {
  const [impactStats, setImpactStats] = useState({
    co2Saved: 0,
    peopleReached: 0,
    totalBusinessesJoined: 0,
    totalFoodWasteSaved: 0,
    totalMealsShared: 0,
    totalUsersActive: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('stats')
          .select('*')
          .eq('type', 'impact')
          .single();
        
        if (error) throw error;
        if (data) {
          setImpactStats((prev) => ({
            ...prev,
            co2Saved: data.co2_saved || 0,
            peopleReached: data.people_reached || 0,
            totalBusinessesJoined: data.total_businesses_joined || 0,
            totalFoodWasteSaved: data.total_food_waste_saved || 0,
            totalMealsShared: data.total_meals_shared || 0,
            totalUsersActive: data.total_users_active || 0,
          }));
        }
      } catch (e) {
        // fallback: keep zeroes
      }
    }
    fetchStats();
  }, []);

  const environmentalImpact = [
    {
      label: "CO₂ Emissions Reduced",
      value: `${impactStats.co2Saved.toLocaleString()} kg`,
      description: "Equivalent to planting 205 trees",
    },
    {
      label: "Water Saved",
      value: "12,847 L",
      description: "Through reduced food production needs",
    },
    {
      label: "Landfill Waste Prevented",
      value: `${impactStats.totalFoodWasteSaved.toLocaleString()} kg`,
      description: "Food diverted from waste streams",
    },
  ];

  const socialImpact = [
    {
      label: "People Reached",
      value: impactStats.peopleReached.toLocaleString(),
      description: "Regular access to nutritious meals",
    },
    {
      label: "Children Fed",
      value: "5,678",
      description: "Young lives positively impacted",
    },
    {
      label: "Elderly Assisted",
      value: "1,234",
      description: "Senior citizens supported",
    },
  ];

  // Chart data
  const monthlyData = [
    { month: "Jan", meals: 980, waste: 650 },
    { month: "Feb", meals: 1240, waste: 820 },
    { month: "Mar", meals: 1560, waste: 1030 },
    { month: "Apr", meals: 1890, waste: 1250 },
    { month: "May", meals: 2100, waste: 1390 },
    { month: "Jun", meals: 2340, waste: 1550 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-16 text-white impact-gradient">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Our Collective Impact
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-blue-100">
            Together, we're transforming surplus food into hope, reducing waste,
            and building stronger communities across Sri Lanka.
          </p>
        </div>
      </div>

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Main Impact Stats */}
        <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-2 lg:grid-cols-4">
          <ImpactCard
            title="Total Meals Shared"
            value={impactStats.totalMealsShared.toLocaleString()}
            subtitle="Nutritious meals distributed"
            icon={<HeartIcon className="w-6 h-6" />}
            color="primary"
            trend={{ value: 23, label: "vs last month" }}
          />
          <ImpactCard
            title="Active Community Members"
            value={impactStats.totalUsersActive.toLocaleString()}
            subtitle="Donors, recipients & volunteers"
            icon={<UsersIcon className="w-6 h-6" />}
            color="accent"
            trend={{ value: 15, label: "vs last month" }}
          />
          <ImpactCard
            title="Food Waste Prevented"
            value={`${impactStats.totalFoodWasteSaved.toLocaleString()} kg`}
            subtitle="Diverted from landfills"
            icon={<GlobeAltIcon className="w-6 h-6" />}
            color="secondary"
            trend={{ value: 31, label: "vs last month" }}
          />
          <ImpactCard
            title="Partner Businesses"
            value={impactStats.totalBusinessesJoined.toLocaleString()}
            subtitle="Restaurants, bakeries & hotels"
            icon={<BuildingStorefrontIcon className="w-6 h-6" />}
            color="primary"
            trend={{ value: 8, label: "vs last month" }}
          />
        </div>

        {/* Environmental Impact */}
        <section className="mb-12">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Environmental Impact
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Every meal shared contributes to a more sustainable future for Sri
              Lanka
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            {environmentalImpact.map((item, index) => (
              <div key={index} className="text-center card">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                  <GlobeAltIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  {item.value}
                </h3>
                <p className="mb-1 font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="p-6 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center mb-4">
              <GlobeAltIcon className="w-6 h-6 mr-2 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                Carbon Footprint Reduction
              </h3>
            </div>
            <p className="mb-4 text-green-800">
              By redistributing surplus food instead of letting it go to waste,
              MealBridge has prevented the equivalent of
              <span className="font-bold">
                {" "}
                {impactStats.co2Saved
                  ? impactStats.co2Saved.toLocaleString()
                  : "0"}{" "}
                kg of CO₂
              </span>{" "}
              from entering the atmosphere. This is equivalent to:
            </p>
            <div className="grid grid-cols-1 gap-4 text-sm text-green-700 md:grid-cols-3">
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                205 trees planted and grown for 10 years
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                19,800 km driven by an average car
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                2.1 tons of waste recycled instead of landfilled
              </div>
            </div>
          </div>
        </section>

        {/* Social Impact */}
        <section className="mb-12">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Social Impact
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Building stronger, more connected communities through food sharing
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {socialImpact.map((item, index) => (
              <div key={index} className="text-center card">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                  <UsersIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  {item.value}
                </h3>
                <p className="mb-1 font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Growth Chart (now a line chart) */}
        <section className="mb-12">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  Growth Over Time
                </h2>
                <p className="text-gray-600">
                  Monthly meals shared and waste prevented
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-primary-600" />
            </div>
            {/* --- Begin Line Chart --- */}
            <div style={{ height: 300, width: "100%" }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={monthlyData}
                  margin={{ top: 8, right: 24, left: 12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="meals"
                    name="Meals Shared"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="waste"
                    name="Waste Prevented (kg)"
                    stroke="#f59e42"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* --- End Line Chart --- */}
          </div>
        </section>

        {/* Volunteer Impact */}
        <section className="mb-12">
          <div className="p-8 border border-orange-200 rounded-lg bg-orange-50">
            <div className="text-center">
              <TruckIcon className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Volunteer Network Impact
              </h2>
              <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
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
              <p className="max-w-2xl mx-auto text-gray-700">
                Our dedicated volunteer network has made it possible to reach
                communities across all 25 districts of Sri Lanka, ensuring that
                surplus food reaches those who need it most, when they need it.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Be Part of the Solution
            </h2>
            <p className="max-w-2xl mx-auto mb-6 text-gray-700">
              Every donation, every claim, and every volunteer hour contributes
              to these incredible numbers. Join us in creating an even bigger
              impact for Sri Lanka's communities.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/auth" className="btn-primary">
                Start Donating
              </Link>
              <Link to="/auth" className="btn-secondary">
                Become a Volunteer
              </Link>
              <button className="btn-outline">Share Our Impact</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
