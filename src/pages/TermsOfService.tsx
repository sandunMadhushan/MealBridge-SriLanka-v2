import {
  DocumentTextIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

export default function TermsOfService() {
  const userObligations = [
    "Provide accurate and truthful information",
    "Use the platform only for legitimate food sharing purposes",
    "Respect other users and maintain professional communication",
    "Follow all food safety guidelines and local regulations",
    "Not engage in fraudulent or harmful activities",
    "Protect your account credentials and notify us of unauthorized access",
    "Comply with all applicable laws and regulations",
  ];

  const prohibitedUses = [
    "Commercial resale of donated food items",
    "Misrepresenting food quality, safety, or expiration dates",
    "Harassment, discrimination, or abusive behavior toward other users",
    "Creating fake accounts or impersonating others",
    "Posting false, misleading, or inappropriate content",
    "Attempting to circumvent platform security measures",
    "Using the platform for illegal activities",
    "Spamming or sending unsolicited communications",
  ];

  const liabilityLimitations = [
    {
      title: "Food Safety",
      description: "Users are responsible for ensuring food safety. MealBridge provides guidelines but cannot guarantee the safety of all food items.",
    },
    {
      title: "User Interactions",
      description: "MealBridge facilitates connections but is not responsible for disputes, damages, or issues arising from user interactions.",
    },
    {
      title: "Platform Availability",
      description: "We strive for continuous service but cannot guarantee uninterrupted access or functionality.",
    },
    {
      title: "Third-Party Services",
      description: "We are not responsible for the actions or policies of third-party services integrated with our platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-primary-600" />
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Terms of Service
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              These terms govern your use of MealBridge and outline the rights and 
              responsibilities of all users in our food sharing community.
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
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Agreement to Terms</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Welcome to MealBridge! These Terms of Service ("Terms") constitute a legally binding 
              agreement between you and MealBridge regarding your use of our food sharing platform 
              and related services.
            </p>
            <p className="mb-4 text-gray-700 leading-relaxed">
              By accessing or using MealBridge, you agree to be bound by these Terms and our Privacy Policy. 
              If you do not agree to these Terms, please do not use our services.
            </p>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> These Terms may be updated from time to time. 
                Continued use of the platform after changes constitutes acceptance of the new Terms.
              </p>
            </div>
          </div>
        </section>

        {/* Platform Description */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">About MealBridge</h2>
            <p className="mb-4 text-gray-700">
              MealBridge is a digital platform that connects food donors (individuals, restaurants, 
              and businesses) with recipients (individuals, families, and organizations) to reduce 
              food waste and address food insecurity in Sri Lanka.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-900">For Donors</h4>
                <p className="text-sm text-green-800">
                  Share surplus food with those in need while reducing waste
                </p>
              </div>
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-900">For Recipients</h4>
                <p className="text-sm text-blue-800">
                  Access fresh, nutritious food from your local community
                </p>
              </div>
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <h4 className="font-semibold text-purple-900">For Volunteers</h4>
                <p className="text-sm text-purple-800">
                  Help deliver food and support community connections
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User Accounts */}
        <section className="mb-12">
          <div className="card">
            <div className="flex items-center mb-4 space-x-3">
              <UserGroupIcon className="w-8 h-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">User Accounts</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Account Creation</h3>
                <p className="text-gray-700">
                  To use MealBridge, you must create an account and provide accurate, complete information. 
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Eligibility</h3>
                <p className="text-gray-700">
                  You must be at least 18 years old to use MealBridge. By creating an account, 
                  you represent that you meet this age requirement and have the legal capacity 
                  to enter into these Terms.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Account Security</h3>
                <p className="text-gray-700">
                  You are responsible for all activities that occur under your account. 
                  Notify us immediately of any unauthorized use or security breaches.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User Obligations */}
        <section className="mb-12">
          <div className="card">
            <div className="flex items-center mb-4 space-x-3">
              <HandRaisedIcon className="w-8 h-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">User Obligations</h2>
            </div>
            <p className="mb-4 text-gray-700">
              As a MealBridge user, you agree to:
            </p>
            <ul className="space-y-2">
              {userObligations.map((obligation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{obligation}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Prohibited Uses */}
        <section className="mb-12">
          <div className="card">
            <div className="flex items-center mb-4 space-x-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">Prohibited Uses</h2>
            </div>
            <p className="mb-4 text-gray-700">
              The following activities are strictly prohibited on MealBridge:
            </p>
            <div className="space-y-3">
              {prohibitedUses.map((use, index) => (
                <div key={index} className="flex items-start p-3 border border-red-200 rounded-lg bg-red-50">
                  <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 mr-3 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-800">{use}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Food Safety */}
        <section className="mb-12">
          <div className="card">
            <div className="flex items-center mb-4 space-x-3">
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Food Safety Responsibilities</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-900">For Donors</h4>
                <p className="text-sm text-green-800">
                  Ensure all donated food is safe, fresh, properly stored, and accurately described. 
                  Complete safety checklists and provide allergen information.
                </p>
              </div>
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-900">For Recipients</h4>
                <p className="text-sm text-blue-800">
                  Inspect food upon receipt, follow storage instructions, and report any safety concerns. 
                  Consume food before expiration dates.
                </p>
              </div>
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <h4 className="font-semibold text-purple-900">For Volunteers</h4>
                <p className="text-sm text-purple-800">
                  Handle food with care, maintain proper temperatures during transport, 
                  and follow all safety protocols.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Platform Content</h3>
                <p className="text-gray-700">
                  MealBridge and its content, features, and functionality are owned by us and 
                  protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">User Content</h3>
                <p className="text-gray-700">
                  You retain ownership of content you post but grant us a license to use, 
                  display, and distribute it on the platform. You are responsible for ensuring 
                  you have rights to any content you share.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <div className="card">
            <div className="flex items-center mb-4 space-x-3">
              <ScaleIcon className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
            </div>
            <p className="mb-6 text-gray-700">
              MealBridge provides a platform for food sharing but cannot guarantee outcomes. 
              Our liability is limited as follows:
            </p>
            <div className="space-y-4">
              {liabilityLimitations.map((limitation, index) => (
                <div key={index} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="font-semibold text-orange-900">{limitation.title}</h4>
                  <p className="text-sm text-orange-800">{limitation.description}</p>
                </div>
              ))}
            </div>
            <div className="p-4 mt-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-700">
                <strong>Maximum Liability:</strong> In no event shall MealBridge's total liability 
                exceed the amount paid by you (if any) for using our services in the 12 months 
                preceding the claim.
              </p>
            </div>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Termination</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">By You</h3>
                <p className="text-gray-700">
                  You may terminate your account at any time by contacting us or using 
                  account deletion features in your profile settings.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">By Us</h3>
                <p className="text-gray-700">
                  We may suspend or terminate your account for violations of these Terms, 
                  illegal activities, or other reasons that may harm our community or platform.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Effect of Termination</h3>
                <p className="text-gray-700">
                  Upon termination, your access to the platform will cease, but certain 
                  provisions of these Terms will survive, including liability limitations 
                  and dispute resolution clauses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Governing Law and Disputes</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                These Terms are governed by the laws of Sri Lanka. Any disputes arising from 
                these Terms or your use of MealBridge will be resolved through the courts of Sri Lanka.
              </p>
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-900">Dispute Resolution</h4>
                <p className="text-sm text-blue-800">
                  We encourage users to contact us first to resolve any issues. Many disputes 
                  can be resolved through direct communication and mediation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <div className="card">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Changes to Terms</h2>
            <p className="mb-4 text-gray-700">
              We may modify these Terms at any time. When we make changes, we will:
            </p>
            <ul className="mb-4 space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Post the updated Terms on our platform</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Update the "Last updated" date</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">Notify users of significant changes via email or platform notifications</span>
              </li>
            </ul>
            <p className="text-gray-700">
              Continued use of MealBridge after changes constitutes acceptance of the new Terms.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <div className="p-8 text-center border border-primary-200 rounded-lg bg-primary-50">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              Questions About These Terms?
            </h3>
            <p className="mb-6 text-gray-700">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Email:</strong> legal@mealbridge.lk</p>
              <p><strong>Address:</strong> 123 Galle Road, Colombo 03, Sri Lanka</p>
              <p><strong>Phone:</strong> +94 11 234 5678</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}