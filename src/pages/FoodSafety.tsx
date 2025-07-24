import {
  ShieldCheckIcon,
  ClockIcon,
  Bars3BottomLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function FoodSafety() {
  const safetyGuidelines = [
    {
      title: "Food Freshness",
      icon: <CheckCircleIcon className="w-6 h-6" />,
      description: "Only donate food that is fresh and safe for consumption",
      details: [
        "Check expiry dates before donating",
        "Ensure food looks, smells, and tastes normal",
        "Don't donate food that's been left out for more than 2 hours",
        "Verify packaging is intact and undamaged",
      ],
    },
    {
      title: "Temperature Control",
      icon: <Bars3BottomLeftIcon className="w-6 h-6" />,
      description: "Maintain proper temperatures to prevent bacterial growth",
      details: [
        "Keep cold foods below 4°C (40°F)",
        "Keep hot foods above 60°C (140°F)",
        "Use insulated containers for transport",
        "Don't leave perishables in the temperature danger zone (4-60°C)",
      ],
    },
    {
      title: "Hygiene Standards",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      description:
        "Follow proper hygiene practices during preparation and handling",
      details: [
        "Wash hands thoroughly before handling food",
        "Use clean utensils and containers",
        "Sanitize preparation surfaces",
        "Wear clean clothing and hair coverings if applicable",
      ],
    },
    {
      title: "Proper Labeling",
      icon: <DocumentTextIcon className="w-6 h-6" />,
      description: "Provide clear information about the food being donated",
      details: [
        "Include preparation date and time",
        "List all ingredients clearly",
        "Mark any allergens prominently",
        "Provide reheating instructions if needed",
      ],
    },
  ];

  const allergens = [
    "Gluten (wheat, barley)",
    "Dairy products (milk, cheese, yogurt)",
    "Eggs and egg products",
    "Tree nuts (almonds, walnuts, cashews)",
    "Peanuts",
    "Fish and seafood",
    "Shellfish (shrimp, crab, lobster)",
    "Soy products",
    "Sesame seeds",
  ];

  const prohibitedItems = [
    "Homemade food from unlicensed kitchens",
    "Food past its expiry date",
    "Previously served or partially consumed food",
    "Food stored at unsafe temperatures",
    "Alcoholic beverages",
    "Food with unknown ingredients or preparation methods",
    "Damaged or opened packaging",
    "Food prepared in unsanitary conditions",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-primary-600" />
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Food Safety Guidelines
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Ensuring safe, nutritious food for everyone in our community
              through proper handling, storage, and distribution practices.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Safety Guidelines */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">
            Essential Safety Guidelines
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {safetyGuidelines.map((guideline, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                    {guideline.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {guideline.title}
                  </h3>
                </div>
                <p className="mb-4 text-gray-600">{guideline.description}</p>
                <ul className="space-y-2">
                  {guideline.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Allergen Information */}
        <section className="mb-16">
          <div className="card">
            <div className="flex items-center mb-6 space-x-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Common Allergens to Declare
              </h2>
            </div>
            <p className="mb-6 text-gray-600">
              Always clearly label any of these common allergens present in your
              food donations:
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {allergens.map((allergen, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 border border-orange-200 rounded-lg bg-orange-50"
                >
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-orange-500" />
                  <span className="text-sm font-medium text-orange-800">
                    {allergen}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prohibited Items */}
        <section className="mb-16">
          <div className="card">
            <div className="flex items-center mb-6 space-x-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Items We Cannot Accept
              </h2>
            </div>
            <p className="mb-6 text-gray-600">
              For the safety of our community, we cannot accept the following
              items:
            </p>
            <div className="space-y-3">
              {prohibitedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 border border-red-200 rounded-lg bg-red-50"
                >
                  <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 mr-3 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Temperature Guidelines */}
        <section className="mb-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="card">
              <div className="flex items-center mb-4 space-x-3">
                <Bars3BottomLeftIcon className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Cold Foods
                </h3>
              </div>
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <p className="mb-2 text-2xl font-bold text-blue-800">
                  Below 4°C (40°F)
                </p>
                <p className="text-sm text-blue-700">
                  Dairy products, fresh meat, seafood, prepared salads, and cut
                  fruits
                </p>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center mb-4 space-x-3">
                <Bars3BottomLeftIcon className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Hot Foods
                </h3>
              </div>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="mb-2 text-2xl font-bold text-red-800">
                  Above 60°C (140°F)
                </p>
                <p className="text-sm text-red-700">
                  Cooked meals, soups, stews, and other prepared hot dishes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Time Guidelines */}
        <section className="mb-16">
          <div className="card">
            <div className="flex items-center mb-6 space-x-3">
              <ClockIcon className="w-8 h-8 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Time Guidelines for Food Safety
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <h4 className="mb-2 font-semibold text-purple-800">
                  2 Hour Rule
                </h4>
                <p className="text-sm text-purple-700">
                  Don't leave perishable food at room temperature for more than
                  2 hours
                </p>
              </div>
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <h4 className="mb-2 font-semibold text-purple-800">
                  1 Hour Rule
                </h4>
                <p className="text-sm text-purple-700">
                  In hot weather (above 32°C), reduce this to 1 hour maximum
                </p>
              </div>
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <h4 className="mb-2 font-semibold text-purple-800">Same Day</h4>
                <p className="text-sm text-purple-700">
                  Prepared foods should ideally be consumed the same day
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section>
          <div className="p-8 text-center border border-red-200 rounded-lg bg-red-50">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              Report Food Safety Concerns
            </h3>
            <p className="mb-6 text-gray-700">
              If you receive food that appears unsafe or have concerns about
              food safety, please report it immediately.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="px-6 py-3 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                Report Safety Issue
              </button>
              <button className="px-6 py-3 font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50">
                Contact Support
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
