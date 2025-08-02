import React, { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { cn } from "../utils/cn";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "donor" | "recipient" | "volunteer"
  >("donor");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    phone: "",
    agreeToTerms: false,
  });

  // State for pending Google user data
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{
    uid: string;
    name: string;
    email: string;
  } | null>(null);

  const navigate = useNavigate();

  const roles = [
    {
      id: "donor" as const,
      title: "Food Donor",
      description: "Share surplus food from your home, restaurant, or business",
      icon: "🍽️",
      benefits: [
        "List surplus food easily",
        "Track your impact",
        "Connect with community",
      ],
    },
    {
      id: "recipient" as const,
      title: "Food Recipient",
      description: "Access fresh, nutritious food from your community",
      icon: "🤝",
      benefits: [
        "Find food near you",
        "Free & affordable options",
        "Safe, quality assured",
      ],
    },
    {
      id: "volunteer" as const,
      title: "Volunteer",
      description: "Help deliver food and support the community",
      icon: "🚚",
      benefits: [
        "Make a difference",
        "Earn recognition badges",
        "Build connections",
      ],
    },
  ];

  // Handle Google OAuth callback
  useEffect(() => {
    const handleAuthStateChange = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        console.log("Auth session detected:", {
          userId: session.user.id,
          email: session.user.email,
          provider: session.user.app_metadata?.provider,
          providers: session.user.app_metadata?.providers,
        });

        // Check if user exists in our users table
        const { data: existingUser, error: userCheckError } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", session.user.id)
          .single();

        console.log("User check result:", { existingUser, userCheckError });

        // If user doesn't exist in our users table, they need to complete signup
        if (!existingUser) {
          // Check if this is a Google sign-in (could be in providers array or provider field)
          const isGoogleUser =
            session.user.app_metadata?.provider === "google" ||
            (session.user.app_metadata?.providers &&
              session.user.app_metadata.providers.includes("google"));

          console.log("Is Google user:", isGoogleUser);

          if (isGoogleUser) {
            setPendingGoogleUser({
              uid: session.user.id,
              name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.user_metadata?.display_name ||
                "",
              email: session.user.email || "",
            });
            console.log("Set pending Google user");
          }
        } else if (existingUser) {
          // User exists, redirect to appropriate dashboard
          console.log("Existing user found, redirecting to dashboard");
          const userType = existingUser.role;
          if (userType === "donor") navigate("/dashboard/donor");
          else if (userType === "recipient") navigate("/dashboard/recipient");
          else if (userType === "volunteer") navigate("/dashboard/volunteer");
        }
      }
    };

    handleAuthStateChange();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      if (event === "SIGNED_IN" && session?.user) {
        handleAuthStateChange();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;

      // After redirect, the user will be signed in and you can handle the rest in a useEffect or a callback route.
      setLoading(false);
      setSuccess("Redirecting to Google sign-in...");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  // Handler to finish Google signup
  const completeGoogleSignup = async () => {
    if (!pendingGoogleUser) return;
    if (!selectedRole || !formData.location) {
      setError("Please select a role and provide your location.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Get current user data which includes Google profile image
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("users").insert({
        id: pendingGoogleUser.uid,
        email: pendingGoogleUser.email,
        name: pendingGoogleUser.name,
        phone: formData.phone || null,
        address: formData.location ? { address: formData.location } : null,
        role: selectedRole,
        profile_image_url: currentUser?.user_metadata?.avatar_url || null,
        bio: null,
        is_verified: true,
        verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        joined_at: new Date().toISOString(),
      });

      if (error) throw error;
      setPendingGoogleUser(null);
      setLoading(false);
      if (selectedRole === "donor") navigate("/dashboard/donor");
      else if (selectedRole === "recipient") navigate("/dashboard/recipient");
      else if (selectedRole === "volunteer") navigate("/dashboard/volunteer");
    } catch (err: any) {
      setError(
        "Failed to complete sign up: " + (err.message ?? "Unknown error")
      );
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Supabase Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        // Fetch the user profile to get the exact role
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) throw profileError;

        if (userProfile) {
          const userType = userProfile.role;
          setLoading(false);
          if (userType === "donor") {
            navigate("/dashboard/donor");
          } else if (userType === "recipient") {
            navigate("/dashboard/recipient");
          } else if (userType === "volunteer") {
            navigate("/dashboard/volunteer");
          } else {
            setError("Invalid user type. Please contact support.");
          }
        } else {
          setLoading(false);
          setError("User profile not found. Please contact support.");
        }
      } else {
        // Registration
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });

        if (error) throw error;

        // Wait a moment for auth to fully process
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Store complete user info in users table
        if (data.user) {
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: formData.email,
            name: formData.name,
            phone: formData.phone || null,
            address: formData.location ? { address: formData.location } : null,
            role: selectedRole,
            profile_image_url: null,
            bio: null,
            is_verified: false,
            verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            joined_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Insert error:", insertError);
            throw insertError;
          }
        }
        setSuccess("Registration successful! You can now sign in.");
        setLoading(false);
        setIsLogin(true);
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          location: "",
          phone: "",
          agreeToTerms: false,
        });
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      {/* Pending Google Signup Modal */}
      {pendingGoogleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-center text-gray-900">
              Complete Sign Up
            </h2>
            <p className="mb-4 text-center text-gray-700">
              Welcome,{" "}
              <span className="font-semibold">
                {pendingGoogleUser.name || pendingGoogleUser.email}
              </span>
              !<br />
              Please choose your role and fill in your info to finish creating
              your MealBridge account.
            </p>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Choose your role
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={cn(
                      "relative rounded-lg border p-3 cursor-pointer transition-all",
                      selectedRole === role.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="google_role"
                        value={role.id}
                        checked={selectedRole === role.id}
                        onChange={() => setSelectedRole(role.id)}
                        className="w-4 h-4 border-gray-300 text-primary-600"
                      />
                      <span className="text-lg">{role.icon}</span>
                      <span className="font-medium text-gray-900">
                        {role.title}
                      </span>
                    </label>
                    <p className="ml-6 text-xs text-gray-500">
                      {role.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="input-field"
                placeholder="City, District"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="input-field"
                placeholder="+94 XX XXX XXXX"
              />
            </div>
            {error && (
              <div className="mb-4 text-sm text-center text-red-500">
                {error}
              </div>
            )}
            <button
              type="button"
              className="w-full btn-primary"
              onClick={completeGoogleSignup}
              disabled={loading}
            >
              {loading ? "Completing Signup..." : "Complete Sign Up"}
            </button>
          </div>
        </div>
      )}

      {/* All original auth UI below (UNCHANGED) */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-600">
            <span className="text-xl font-bold text-white">M</span>
          </div>
        </div>
        <h2 className="mt-6 text-3xl font-bold text-center text-gray-900">
          {isLogin
            ? "Welcome back to MealBridge"
            : "Join the MealBridge Community"}
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          {isLogin
            ? "Sign in to continue making an impact"
            : "Start your journey towards reducing food waste"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          {/* Toggle Login/Register */}
          <div className="flex p-1 mb-6 bg-gray-100 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
                isLogin
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
              disabled={loading}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
                !isLogin
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>

          {/* Role Selection (only for registration) */}
          {!isLogin && (
            <div className="mb-6">
              <label className="block mb-3 text-sm font-medium text-gray-700">
                Choose your role
              </label>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={cn(
                      "relative rounded-lg border p-4 cursor-pointer transition-all",
                      selectedRole === role.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="role"
                          value={role.id}
                          checked={selectedRole === role.id}
                          onChange={() => setSelectedRole(role.id)}
                          className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex-1 ml-3">
                        <div className="flex items-center mb-1 space-x-2">
                          <span className="text-lg">{role.icon}</span>
                          <label className="font-medium text-gray-900 cursor-pointer">
                            {role.title}
                          </label>
                        </div>
                        <p className="mb-2 text-sm text-gray-600">
                          {role.description}
                        </p>
                        <ul className="space-y-1 text-xs text-gray-500">
                          {role.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 mr-2 rounded-full bg-primary-400"></span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name (only for registration) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pr-10 input-field"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (only for registration) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="input-field"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {/* Location & Phone (only for registration) */}
            {!isLogin && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Location
                  </label>
                  <div className="mt-1">
                    <input
                      id="location"
                      name="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="input-field"
                      placeholder="City, District"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="input-field"
                      placeholder="+94 XX XXX XXXX"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms Agreement (only for registration) */}
            {!isLogin && (
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    handleInputChange("agreeToTerms", e.target.checked)
                  }
                  className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="block ml-2 text-sm text-gray-900"
                >
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            {/* Error & Success */}
            {error && (
              <div className="text-sm text-center text-red-500">{error}</div>
            )}
            {success && (
              <div className="text-sm text-center text-green-600">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading
                  ? isLogin
                    ? "Signing In..."
                    : "Creating Account..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </button>
            </div>

            {/* Forgot Password (only for login) */}
            {isLogin && (
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-500 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                onClick={handleGoogleSignIn}
                disabled={loading}
                aria-label="Continue with Google"
              >
                {/* Google SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>
              <button
                type="button"
                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-500 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                disabled={loading}
                aria-label="Continue with Facebook"
                // onClick={handleFacebookSignIn} // implement similar if needed
              >
                {/* Facebook SVG */}
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
