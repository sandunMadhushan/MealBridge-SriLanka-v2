import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Find Food", href: "/find-food" },
  { name: "Donate", href: "/donate" },
  { name: "Community", href: "/community" },
  { name: "Impact", href: "/impact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                MealBridge
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  location.pathname === item.href
                    ? "text-primary-600 border-b-2 border-primary-600 pb-1"
                    : "text-gray-700 hover:text-primary-600"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <button
              className="p-2 text-gray-400 transition-colors hover:text-gray-500"
              aria-label="Notifications"
              title="Notifications"
            >
              <BellIcon className="w-6 h-6" />
            </button>

            {!loading && user ? (
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="w-6 h-6 text-primary-600" />
                <span className="font-medium text-gray-700">
                  {/* Safe access below */}
                  {user.displayName || user.email || "User"}
                </span>
                <button
                  className="ml-2 btn-secondary"
                  onClick={() => signOut(auth)}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              // Only show sign in when not loading
              !loading && (
                <Link to="/auth" className="btn-primary">
                  Sign In
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "block px-3 py-2 text-base font-medium transition-colors duration-200",
                    location.pathname === item.href
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                {/* Auth actions for mobile */}
                {!loading && user ? (
                  <div className="flex flex-col space-y-1">
                    <span className="flex items-center justify-center space-x-2 font-medium text-gray-700">
                      <UserCircleIcon className="inline w-5 h-5 text-primary-600" />
                      <span>{user.displayName || user.email || "User"}</span>
                    </span>
                    <button
                      className="w-full mt-1 btn-secondary"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut(auth);
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  !loading && (
                    <Link
                      to="/auth"
                      className="block w-full text-center btn-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
