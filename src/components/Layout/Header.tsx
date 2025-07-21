import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import NotificationCenter from "../NotificationCenter";
import { doc, getDoc } from "firebase/firestore";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Find Food", href: "/find-food" },
  { name: "Donate", href: "/donate" },
  { name: "Community", href: "/community" },
  { name: "Impact", href: "/impact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Optional: role cache for instant re-open menu
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;
    function onClick(e: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [profileMenuOpen]);

  // Retrieve user role from Firestore for Dashboard routing
  const fetchUserRole = async () => {
    if (!user) return null;
    // Only fetch if not already loaded
    if (userRole) return userRole;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        setUserRole(role);
        return role;
      }
    } catch (e) {
      // fail silently
    }
    return null;
  };

  // Handle "Go to Dashboard"
  const handleGoToDashboard = async () => {
    const role = await fetchUserRole();
    setProfileMenuOpen(false);
    if (role === "donor") navigate("/dashboard/donor");
    else if (role === "recipient") navigate("/dashboard/recipient");
    else if (role === "volunteer") navigate("/dashboard/volunteer");
    else navigate("/"); // fallback
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setProfileMenuOpen(false);
    setUserRole(null);
    navigate("/", { replace: true });
  };

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
            {!loading && user && <NotificationCenter />}

            {!loading && user ? (
              <div className="relative flex items-center space-x-2">
                <button
                  className="flex items-center space-x-1 focus:outline-none group"
                  onClick={async () => {
                    setProfileMenuOpen((v) => !v);
                    if (!userRole) await fetchUserRole();
                  }}
                  aria-haspopup="true"
                  aria-expanded={profileMenuOpen}
                  aria-label="Open user menu"
                >
                  <UserCircleIcon className="w-6 h-6 text-primary-600" />
                  <span className="font-medium text-gray-700">
                    {user.displayName || user.email || "User"}
                  </span>
                </button>
                {profileMenuOpen && (
                  <div
                    ref={profileMenuRef}
                    className="absolute right-0 z-40 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-44"
                  >
                    <button
                      className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-primary-50"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/profile");
                      }}
                    >
                      View Profile
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-primary-50"
                      onClick={handleGoToDashboard}
                    >
                      Go to Dashboard
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-100"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
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
                    <button
                      className="flex items-center justify-center space-x-2 font-medium text-gray-700 focus:outline-none"
                      onClick={() => {
                        setProfileMenuOpen((v) => !v);
                        setMobileMenuOpen(false);
                        if (!userRole) fetchUserRole();
                      }}
                    >
                      <UserCircleIcon className="inline w-5 h-5 text-primary-600" />
                      <span>{user.displayName || user.email || "User"}</span>
                    </button>
                    {/* Show menu like on desktop (optional on mobile) */}
                    {profileMenuOpen && (
                      <div
                        ref={profileMenuRef}
                        className="w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
                      >
                        <button
                          className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-primary-50"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate("/profile");
                          }}
                        >
                          View Profile
                        </button>
                        <button
                          className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-primary-50"
                          onClick={handleGoToDashboard}
                        >
                          Go to Dashboard
                        </button>
                        <button
                          className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-100"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
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
