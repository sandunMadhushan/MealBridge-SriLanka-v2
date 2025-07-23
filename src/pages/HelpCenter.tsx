import { useState } from "react";
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../utils/cn";

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Topics", icon: DocumentTextIcon },
    { id: "getting-started", name: "Getting Started", icon: CheckCircleIcon },
    { id: "donations", name: "Food Donations", icon: UserGroupIcon },
    { id: "safety", name: "Food Safety", icon: ShieldCheckIcon },
    { id: "account", name: "Account & Profile", icon: QuestionMarkCircleIcon },
    { id: "troubleshooting", name: "Troubleshooting", icon: ExclamationTriangleIcon },
  ];

  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I get started with MealBridge?",
      answer: "Getting started is easy! Simply create an account by clicking 'Sign In' and choose your role - whether you're a food donor, recipient, or volunteer. Complete your profile with your location and contact information, and you're ready to start making an impact in your community.",
    },
    {
      id: 2,
      category: "donations",
      question: "What types of food can I donate?",
      answer: "You can donate fresh fruits and vegetables, prepared meals, bakery items, packaged foods, and beverages. All food must be safe for consumption, properly stored, and within expiry dates. We don't accept homemade items from unlicensed kitchens for safety reasons.",
    },
    {
      id: 3,
      category: "safety",
      question: "How does MealBridge ensure food safety?",
      answer: "Food safety is our top priority. All donors must complete a safety checklist confirming freshness, proper storage, hygiene standards, and complete labeling. We provide guidelines for safe food handling and require clear allergen information for all donations.",
    },
    {
      id: 4,
      category: "donations",
      question: "Can I schedule regular donations?",
      answer: "Yes! Many restaurants and businesses set up regular donation schedules. Contact our support team to arrange recurring donations and we'll help coordinate with local recipients and volunteers for consistent pickup and delivery.",
    },
    {
      id: 5,
      category: "account",
      question: "How do I change my role or location?",
      answer: "You can update your profile information including location in your account settings. However, changing your role (donor/recipient/volunteer) requires contacting our support team to ensure proper verification and setup.",
    },
    {
      id: 6,
      category: "troubleshooting",
      question: "I'm not receiving notifications. What should I do?",
      answer: "Check your notification settings in your profile and ensure your email address is verified. Also check your spam folder. If you're still not receiving notifications, try logging out and back in, or contact our support team.",
    },
    {
      id: 7,
      category: "getting-started",
      question: "How does the delivery system work?",
      answer: "Our volunteer network helps deliver food from donors to recipients. When you request delivery, volunteers in your area are notified. Delivery fees vary by distance and urgency. You can also arrange direct pickup with donors.",
    },
    {
      id: 8,
      category: "safety",
      question: "What should I do if I receive unsafe food?",
      answer: "If you receive food that appears unsafe, don't consume it. Report the issue immediately through our platform or contact support. We take food safety seriously and will investigate all reports to maintain community trust.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Help Center
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Find answers to common questions and get the help you need
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-10 pr-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
          <div className="text-center card">
            <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-primary-600" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Contact Support
            </h3>
            <p className="mb-4 text-gray-600">
              Get personalized help from our support team
            </p>
            <button className="btn-primary">Contact Us</button>
          </div>
          <div className="text-center card">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-secondary-600" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              User Guide
            </h3>
            <p className="mb-4 text-gray-600">
              Step-by-step guides for using MealBridge
            </p>
            <button className="btn-secondary">View Guides</button>
          </div>
          <div className="text-center card">
            <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-accent-600" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Community Forum
            </h3>
            <p className="mb-4 text-gray-600">
              Connect with other MealBridge users
            </p>
            <button className="btn-outline">Join Forum</button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors",
                  selectedCategory === category.id
                    ? "bg-primary-100 text-primary-800"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                )}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="card">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          {filteredFaqs.length === 0 && (
            <div className="py-12 text-center">
              <QuestionMarkCircleIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse different categories.
              </p>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-16 text-center">
          <div className="p-8 border border-primary-200 rounded-lg bg-primary-50">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              Still need help?
            </h3>
            <p className="mb-6 text-gray-600">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="btn-primary">
                Contact Support
              </button>
              <button className="btn-outline">
                Report an Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}