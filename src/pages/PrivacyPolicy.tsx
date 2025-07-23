import {
  ShieldCheckIcon,
  EyeIcon,
  LockClosedIcon,
  UserIcon,
  DocumentTextIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export default function PrivacyPolicy() {
  const dataTypes = [
    {
      category: "Personal Information",
      items: [
        "Name and contact information (email, phone number)",
        "Location data (city, district for food matching)",
        "Profile photos and user-generated content",
        "Account credentials and authentication data",
      ],
    },
    {
      category: "Usage Information",
      items: [
        "Food listings created, claimed, or requested",
        "Communication between users through our platform",
        "App usage patterns and feature interactions",
        "Device information and IP addresses",
      ],
    },
    {
      category: "Transaction Data",
      items: [
        "Food donation and receipt history",
        "Volunteer delivery records",
        "Payment information for half-price items",
        "Ratings and reviews provided",
      ],
    },
  ];

  const dataUses = [
    {
      title: "Platform Functionality",
      description: "To provide core MealBridge services including food matching, user communication, and account management.",
      icon: <GlobeAltIcon className="w-6 h-6" />,
    },
    {
      title: "Safety & Security",
      description: "To verify user identities, prevent fraud, ensure food safety, and maintain platform security.",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
    },
    {
      title: "Communication",
      description: "To send notifications about food requests, platform updates, and important safety information.",
      icon: <DocumentTextIcon className="w-6 h-6" />,
    },
    {
      title: "Improvement & Analytics",
      description: "To analyze usage patterns, improve our services, and develop new features for better user experience.",
      icon: <EyeIcon className="w-6 h-6" />,
    },
  ];

  const userRights = [
    "Access your personal data and download a copy",
    "Correct inaccurate or incomplete information",
    "Delete your account and associated data",
    "Restrict processing of your data in certain circumstances",
    "Object to processing based on legitimate interests",
    "Data portability to another service provider",
    "Withdraw consent for data processing",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-primary-600" />
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Privacy Policy
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Your privacy is important to us. This policy explains how we collect, 
              use, and protect your personal information on MealBridge.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Last updated: January 15, 2025
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-12 mx-auto max-w-4xl sm:px-6 lg:px-8">
        {/* Introduction */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Introduction</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              MealBridge ("we," "our," or "us") is committed to protecting your privacy and ensuring 
              the security of your personal information. This Privacy Policy describes how we collect, 
              use, disclose, and safeguard your information when you use our food sharing platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using MealBridge, you agree to the collection and use of information in accordance 
              with this policy. If you do not agree with our policies and practices, please do not 
              use our services.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Information We Collect</h2>
            <div className="space-y-6">
              {dataTypes.map((type, index) => (
                <div key={index}>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    {type.category}
                  </h3>
                  <ul className="space-y-2">
                    {type.items.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-12">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">How We Use Your Information</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {dataUses.map((use, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                    {use.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {use.title}
                  </h3>
                </div>
                <p className="text-gray-700">{use.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Information Sharing */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Information Sharing</h2>
            <p className="mb-4 text-gray-700">
              We do not sell, trade, or rent your personal information to third parties. 
              We may share your information only in the following circumstances:
            </p>
            <div className="space-y-4">
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-900">With Other Users</h4>
                <p className="text-sm text-blue-800">
                  Basic profile information (name, location) is shared with other users 
                  for food matching and communication purposes.
                </p>
              </div>
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-900">Service Providers</h4>
                <p className="text-sm text-green-800">
                  We may share data with trusted third-party services that help us 
                  operate our platform (hosting, analytics, payment processing).
                </p>
              </div>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h4 className="font-semibold text-red-900">Legal Requirements</h4>
                <p className="text-sm text-red-800">
                  We may disclose information when required by law or to protect 
                  the rights, property, or safety of our users and the public.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <div className="card">
            <div className="flex items-center mb-4 space-x-3">
              <LockClosedIcon className="w-8 h-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <p className="mb-4 text-gray-700">
              We implement appropriate technical and organizational security measures to protect 
              your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-900">Technical Measures</h4>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  <li>• SSL/TLS encryption for data transmission</li>
                  <li>• Secure database storage with encryption</li>
                  <li>• Regular security audits and updates</li>
                  <li>• Access controls and authentication</li>
                </ul>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-900">Organizational Measures</h4>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  <li>• Limited access to personal data</li>
                  <li>• Employee privacy training</li>
                  <li>• Data breach response procedures</li>
                  <li>• Regular privacy impact assessments</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <div className="card">
            <div className="flex items-center mb-4 space-x-3">
              <UserIcon className="w-8 h-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Your Privacy Rights</h2>
            </div>
            <p className="mb-4 text-gray-700">
              You have the following rights regarding your personal information:
            </p>
            <ul className="space-y-2">
              {userRights.map((right, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{right}</span>
                </li>
              ))}
            </ul>
            <div className="p-4 mt-6 border border-primary-200 rounded-lg bg-primary-50">
              <p className="text-sm text-primary-800">
                To exercise any of these rights, please contact us at privacy@mealbridge.lk 
                or through our contact form. We will respond to your request within 30 days.
              </p>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Data Retention</h2>
            <p className="mb-4 text-gray-700">
              We retain your personal information only for as long as necessary to provide 
              our services and fulfill the purposes outlined in this policy:
            </p>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-900">Active Accounts</h4>
                <p className="text-sm text-gray-700">
                  Data is retained while your account is active and for a reasonable period 
                  after account deletion to comply with legal obligations.
                </p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-900">Transaction Records</h4>
                <p className="text-sm text-gray-700">
                  Food donation and delivery records may be retained for up to 7 years 
                  for safety, legal, and tax purposes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cookies and Tracking */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Cookies and Tracking</h2>
            <p className="mb-4 text-gray-700">
              We use cookies and similar tracking technologies to enhance your experience 
              and analyze platform usage:
            </p>
            <div className="space-y-3">
              <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-900">Essential Cookies</h4>
                <p className="text-sm text-green-800">
                  Required for basic platform functionality, authentication, and security.
                </p>
              </div>
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-900">Analytics Cookies</h4>
                <p className="text-sm text-blue-800">
                  Help us understand how users interact with our platform to improve services.
                </p>
              </div>
              <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                <h4 className="font-semibold text-purple-900">Preference Cookies</h4>
                <p className="text-sm text-purple-800">
                  Remember your settings and preferences for a better user experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Children's Privacy</h2>
            <p className="text-gray-700">
              MealBridge is not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13. If you are 
              a parent or guardian and believe your child has provided us with personal 
              information, please contact us immediately.
            </p>
          </div>
        </section>

        {/* Changes to Policy */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Changes to This Policy</h2>
            <p className="mb-4 text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
            <p className="text-gray-700">
              We encourage you to review this Privacy Policy periodically for any changes. 
              Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <div className="p-8 text-center border border-primary-200 rounded-lg bg-primary-50">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              Questions About Privacy?
            </h3>
            <p className="mb-6 text-gray-700">
              If you have any questions about this Privacy Policy or our data practices, 
              please don't hesitate to contact us.
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Email:</strong> privacy@mealbridge.lk</p>
              <p><strong>Address:</strong> 123 Galle Road, Colombo 03, Sri Lanka</p>
              <p><strong>Phone:</strong> +94 11 234 5678</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}