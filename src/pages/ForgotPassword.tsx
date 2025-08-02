import React, { useState } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage("If an account exists, a password reset email has been sent.");
    } catch (err: any) {
      setError(
        "Something went wrong. Please try again."
      );
    }
    setLoading(false);
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
          Forgot Password
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Enter your email and we'll send you a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleReset}>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
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
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <Link to="/auth" className="text-primary-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
