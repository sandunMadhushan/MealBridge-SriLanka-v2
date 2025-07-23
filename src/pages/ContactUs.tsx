import { useState } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    "General Inquiry",
    "Technical Support",
    "Food Safety Concern",
    "Account Issues",
    "Partnership Opportunities",
    "Media Inquiries",
    "Feedback & Suggestions",
    "Report a Problem",
  ];

  const contactMethods = [
    {
      icon: <EnvelopeIcon className="w-6 h-6" />,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@mealbridge.lk",
      availability: "24/7 - Response within 24 hours",
    },
    {
      icon: <PhoneIcon className="w-6 h-6" />,
      title: "Phone Support",
      description: "Speak with our team",
      contact: "+94 11 234 5678",
      availability: "Mon-Fri, 9:00 AM - 6:00 PM",
    },
    {
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      title: "Live Chat",
      description: "Instant messaging support",
      contact: "Available on website",
      availability: "Mon-Fri, 9:00 AM - 6:00 PM",
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <EnvelopeIcon className="w-16 h-16 mx-auto mb-4 text-primary-600" />
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Contact Us
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              We're here to help! Reach out to us with any questions, concerns, or feedback.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Contact Methods */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-center text-gray-900">
            Get in Touch
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {contactMethods.map((method, index) => (
              <div key={index} className="text-center card">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-primary-100 text-primary-600">
                  {method.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {method.title}
                </h3>
                <p className="mb-3 text-gray-600">{method.description}</p>
                <p className="mb-2 font-medium text-primary-600">{method.contact}</p>
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>{method.availability}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="card">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Send us a Message
            </h2>
            
            {success && (
              <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
                <p className="text-green-800">
                  Thank you for your message! We'll get back to you within 24 hours.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="input-field"
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  rows={6}
                  className="input-field"
                  placeholder="Please provide details about your inquiry..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Additional Information */}
          <div className="space-y-8">
            {/* Office Information */}
            <div className="card">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Our Office
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 mt-1 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">
                      123 Galle Road<br />
                      Colombo 03, Sri Lanka<br />
                      00300
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ClockIcon className="w-5 h-5 mt-1 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Office Hours</p>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="card">
              <div className="flex items-center mb-4 space-x-3">
                <QuestionMarkCircleIcon className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Frequently Asked Questions
                </h3>
              </div>
              <p className="mb-4 text-gray-600">
                Before contacting us, you might find your answer in our comprehensive FAQ section.
              </p>
              <button className="btn-outline">
                View FAQ
              </button>
            </div>

            {/* Emergency Contact */}
            <div className="p-6 border border-red-200 rounded-lg bg-red-50">
              <h3 className="mb-3 text-lg font-semibold text-red-800">
                Emergency Food Safety Issues
              </h3>
              <p className="mb-4 text-sm text-red-700">
                If you have an urgent food safety concern that poses immediate health risks, 
                please contact us immediately:
              </p>
              <div className="space-y-2">
                <p className="font-medium text-red-800">
                  Emergency Hotline: +94 11 234 5679
                </p>
                <p className="font-medium text-red-800">
                  Email: emergency@mealbridge.lk
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}