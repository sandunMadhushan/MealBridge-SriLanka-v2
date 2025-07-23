import {
  DocumentTextIcon,
  UserGroupIcon,
  HeartIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  HandRaisedIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export default function Guidelines() {
  const donorGuidelines = [
    "Only donate food that is fresh, safe, and within expiry dates",
    "Complete the food safety checklist for every donation",
    "Provide accurate descriptions and clear photos of food items",
    "Respond promptly to requests and claims from recipients",
    "Be respectful and professional in all communications",
    "Follow proper food handling and storage practices",
    "Clearly label any allergens or special dietary information",
  ];

  const recipientGuidelines = [
    "Only request food that you genuinely need",
    "Be punctual for pickup times and communicate any delays",
    "Inspect food quality upon pickup and report any concerns",
    "Be respectful to donors and volunteers",
    "Follow proper food storage and consumption practices",
    "Provide feedback to help improve the community experience",
    "Don't waste claimed or requested food",
  ];

  const volunteerGuidelines = [
    "Maintain professionalism during all deliveries",
    "Handle food with care and follow safety protocols",
    "Communicate clearly with both donors and recipients",
    "Be punctual and reliable for delivery commitments",
    "Respect privacy and confidentiality of all parties",
    "Report any issues or concerns immediately",
    "Maintain your vehicle and delivery equipment properly",
  ];

  const communityStandards = [
    {
      title: "Respect and Kindness",
      icon: <HeartIcon className="w-6 h-6" />,
      description: "Treat all community members with respect, kindness, and dignity regardless of their circumstances.",
    },
    {
      title: "Honesty and Transparency",
      icon: <CheckCircleIcon className="w-6 h-6" />,
      description: "Be honest about food quality, quantities, and your needs. Transparency builds trust in our community.",
    },
    {
      title: "Safety First",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      description: "Prioritize food safety and follow all guidelines to protect the health of community members.",
    },
    {
      title: "No Discrimination",
      icon: <UserGroupIcon className="w-6 h-6" />,
      description: "MealBridge is inclusive. Discrimination based on race, religion, gender, or background is not tolerated.",
    },
    {
      title: "Responsible Communication",
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      description: "Communicate respectfully and professionally. Harassment, abuse, or inappropriate behavior is prohibited.",
    },
    {
      title: "Environmental Responsibility",
      icon: <HandRaisedIcon className="w-6 h-6" />,
      description: "Help reduce food waste and environmental impact through responsible sharing and consumption.",
    },
  ];

  const prohibitedActivities = [
    "Selling food that should be donated for free",
    "Misrepresenting food quality or safety information",
    "Discriminating against recipients based on personal characteristics",
    "Using the platform for commercial advertising unrelated to food sharing",
    "Sharing personal contact information publicly (use platform messaging)",
    "Claiming food with no intention of consuming it",
    "Creating fake accounts or impersonating others",
    "Harassing or threatening other community members",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-primary-600" />
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Community Guidelines
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Our guidelines help create a safe, respectful, and effective community 
              for sharing food and reducing waste across Sri Lanka.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Community Standards */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">
            Community Standards
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {communityStandards.map((standard, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                    {standard.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {standard.title}
                  </h3>
                </div>
                <p className="text-gray-600">{standard.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Role-Specific Guidelines */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">
            Role-Specific Guidelines
          </h2>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Donor Guidelines */}
            <div className="card">
              <div className="flex items-center mb-6 space-x-3">
                <div className="p-3 rounded-lg bg-green-100">
                  <HeartIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  For Food Donors
                </h3>
              </div>
              <ul className="space-y-3">
                {donorGuidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recipient Guidelines */}
            <div className="card">
              <div className="flex items-center mb-6 space-x-3">
                <div className="p-3 rounded-lg bg-blue-100">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  For Recipients
                </h3>
              </div>
              <ul className="space-y-3">
                {recipientGuidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Volunteer Guidelines */}
            <div className="card">
              <div className="flex items-center mb-6 space-x-3">
                <div className="p-3 rounded-lg bg-purple-100">
                  <HandRaisedIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  For Volunteers
                </h3>
              </div>
              <ul className="space-y-3">
                {volunteerGuidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Prohibited Activities */}
        <section className="mb-16">
          <div className="card">
            <div className="flex items-center mb-6 space-x-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Prohibited Activities
              </h2>
            </div>
            <p className="mb-6 text-gray-600">
              The following activities are not allowed on MealBridge and may result in account suspension:
            </p>
            <div className="space-y-3">
              {prohibitedActivities.map((activity, index) => (
                <div key={index} className="flex items-start p-3 border border-red-200 rounded-lg bg-red-50">
                  <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 mr-3 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-800">{activity}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reporting and Enforcement */}
        <section className="mb-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="card">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Reporting Violations
              </h3>
              <p className="mb-4 text-gray-600">
                If you encounter behavior that violates our guidelines, please report it immediately:
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Use the report button on listings or profiles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Contact our support team directly</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Provide detailed information about the incident</span>
                </li>
              </ul>
              <button className="btn-primary">Report an Issue</button>
            </div>

            <div className="card">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Enforcement Actions
              </h3>
              <p className="mb-4 text-gray-600">
                Violations may result in the following actions:
              </p>
              <div className="space-y-3">
                <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <h4 className="font-medium text-yellow-800">Warning</h4>
                  <p className="text-sm text-yellow-700">First-time minor violations</p>
                </div>
                <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="font-medium text-orange-800">Temporary Suspension</h4>
                  <p className="text-sm text-orange-700">Repeated or moderate violations</p>
                </div>
                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-800">Permanent Ban</h4>
                  <p className="text-sm text-red-700">Serious or repeated violations</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <div className="p-8 text-center border border-primary-200 rounded-lg bg-primary-50">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              Questions About Guidelines?
            </h3>
            <p className="mb-6 text-gray-700">
              If you have questions about our community guidelines or need clarification 
              on any policies, we're here to help.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="btn-primary">
                Contact Support
              </button>
              <button className="btn-outline">
                View Help Center
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}