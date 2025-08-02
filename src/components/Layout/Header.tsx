import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase";
import NotificationCenter from "../NotificationCenter";

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
  // Ref on the button (not the menu itself) for fine placement
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    // Close menu on outside click
    if (!profileMenuOpen) return;
    function onClick(e: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [profileMenuOpen]);

  // Calculate dropdown menu position under the profile button for perfect alignment
  useEffect(() => {
    if (profileMenuOpen && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 6, // 6px margin below button
        left: rect.left + window.scrollX,
      });
    }
  }, [profileMenuOpen]);

  const fetchUserRole = async () => {
    if (!user) return null;
    if (userRole) return userRole;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("role, profile_image_url")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        const role = data.role;
        const profileImage = data.profile_image_url;
        setUserRole(role);
        setUserProfileImage(profileImage);
        return role;
      }
    } catch (e) {}
    return null;
  };

  const handleGoToDashboard = async () => {
    const role = await fetchUserRole();
    setProfileMenuOpen(false);
    if (role === "donor") navigate("/dashboard/donor");
    else if (role === "recipient") navigate("/dashboard/recipient");
    else if (role === "volunteer") navigate("/dashboard/volunteer");
    else navigate("/");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfileMenuOpen(false);
    setUserRole(null);
    setUserProfileImage(null);
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
                MealBridge <sup className="text-[14px]">LK</sup>
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
                  ref={profileButtonRef}
                  className="flex items-center space-x-1 focus:outline-none group"
                  onClick={async () => {
                    setProfileMenuOpen((v) => !v);
                    if (!userRole) await fetchUserRole();
                  }}
                  aria-haspopup="true"
                  aria-expanded={profileMenuOpen ? "true" : "false"}
                  aria-label="Open user menu"
                  type="button"
                >
                  {userProfileImage || user.user_metadata?.avatar_url ? (
                    <img
                      src={userProfileImage || user.user_metadata.avatar_url}
                      alt={user.user_metadata?.full_name || "User"}
                      className="object-cover w-6 h-6 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="w-6 h-6 text-primary-600" />
                  )}
                  <span className="font-medium text-gray-700">
                    {user.user_metadata?.full_name || user.email || "User"}
                  </span>
                </button>
                {profileMenuOpen && (
                  <div
                    ref={profileMenuRef}
                    className="z-40 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-44"
                    style={{
                      position: "absolute",
                      top:
                        dropdownPosition && dropdownPosition.top
                          ? dropdownPosition.top -
                            profileButtonRef.current!.offsetParent!.getBoundingClientRect()
                              .top
                          : "100%",
                      left:
                        dropdownPosition && dropdownPosition.left
                          ? dropdownPosition.left -
                            profileButtonRef.current!.offsetParent!.getBoundingClientRect()
                              .left
                          : undefined,
                    }}
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
                      {userProfileImage || user.user_metadata?.avatar_url ? (
                        <img
                          src={
                            userProfileImage || user.user_metadata.avatar_url
                          }
                          alt={user.user_metadata?.full_name || "User"}
                          className="inline-block object-cover w-5 h-5 rounded-full"
                        />
                      ) : (
                        <UserCircleIcon className="inline w-5 h-5 text-primary-600" />
                      )}
                      <span>
                        {user.user_metadata?.full_name || user.email || "User"}
                      </span>
                    </button>
                    {profileMenuOpen && (
                      <div
                        ref={profileMenuRef}
                        className="w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
                        style={{
                          position: "absolute",
                          left: 0,
                        }}
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
