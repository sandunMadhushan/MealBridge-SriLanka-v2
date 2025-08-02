import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to extract tokens from URL
    const extractTokensFromUrl = () => {
      // First, try to get tokens from search params (query string)
      let accessToken = searchParams.get("access_token");
      let refreshToken = searchParams.get("refresh_token");
      let type = searchParams.get("type");
      let errorCode = searchParams.get("error_code");
      let errorDescription = searchParams.get("error_description");

      // If not found in search params, check the hash fragment
      if (!accessToken && window.location.hash) {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        accessToken = hashParams.get("access_token");
        refreshToken = hashParams.get("refresh_token");
        type = hashParams.get("type");
        errorCode = hashParams.get("error_code");
        errorDescription = hashParams.get("error_description");
      }

      return { accessToken, refreshToken, type, errorCode, errorDescription };
    };

    const { accessToken, refreshToken, type, errorCode, errorDescription } =
      extractTokensFromUrl();

    console.log("Extracted tokens:", {
      accessToken,
      refreshToken,
      type,
      errorCode,
      errorDescription,
    });

    if (type === "recovery" && accessToken && refreshToken) {
      // Set the session with the tokens from the URL
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(({ error }) => {
          if (error) {
            console.error("Error setting session:", error);
            setError(
              "Failed to authenticate. Please try requesting a new reset link."
            );
          } else {
            console.log("Session set successfully");
          }
        });
    } else if (errorCode === "otp_expired") {
      setError("Password reset link has expired. Please request a new one.");
    } else if (errorDescription) {
      setError(decodeURIComponent(errorDescription));
    } else if (!accessToken && !errorCode) {
      // No tokens found, might need to redirect from root
      setError("No reset tokens found. Please use the link from your email.");
    }
  }, [searchParams]);
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage("Password updated successfully! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-600">
            <span className="text-xl font-bold text-white">M</span>
          </div>
        </div>
        <h2 className="mt-6 text-3xl font-bold text-center text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handlePasswordReset}>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field pr-10"
                  required
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-field pr-10"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {message && (
              <div className="text-sm text-center text-green-600">
                {message}
              </div>
            )}

            {error && (
              <div className="text-sm text-center text-red-500">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>

            <div className="flex justify-between mt-2 text-sm">
              <Link to="/auth" className="text-primary-600 hover:underline">
                Back to Login
              </Link>
              <Link
                to="/forgot-password"
                className="text-primary-600 hover:underline"
              >
                Send New Reset Link
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
