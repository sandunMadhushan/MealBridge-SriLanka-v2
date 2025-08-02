import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export function AuthTokenRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkForAuthTokens = async () => {
      // Check both search params and hash fragment for auth tokens
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const accessToken =
        urlParams.get("access_token") || hashParams.get("access_token");
      const type = urlParams.get("type") || hashParams.get("type");

      console.log("Checking for auth tokens:", {
        accessToken,
        type,
        hash: window.location.hash,
        search: window.location.search,
      });

      // If we have recovery tokens, redirect to reset password page
      if (type === "recovery" && accessToken) {
        console.log("Found recovery tokens, redirecting to reset-password");
        // Preserve all the parameters when redirecting
        const allParams = window.location.hash || window.location.search;
        navigate(`/reset-password${allParams}`, { replace: true });
        return;
      }

      // Check if we have any auth tokens (could be from Google OAuth)
      if (accessToken) {
        console.log("Found auth tokens, checking user status");

        // Get the current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log("User session found:", session.user.id);

          // Check if user exists in our users table
          const { data: existingUser, error: userCheckError } = await supabase
            .from("users")
            .select("id, role")
            .eq("id", session.user.id)
            .single();

          console.log("User check from redirect:", {
            existingUser,
            userCheckError,
          });

          // If user doesn't exist, redirect to auth page for role selection
          if (!existingUser) {
            console.log(
              "User not in database, redirecting to auth for signup completion"
            );
            navigate("/auth", { replace: true });
          } else {
            // User exists, redirect to appropriate dashboard
            console.log("User exists, redirecting to dashboard");
            const userType = existingUser.role;
            if (userType === "donor")
              navigate("/dashboard/donor", { replace: true });
            else if (userType === "recipient")
              navigate("/dashboard/recipient", { replace: true });
            else if (userType === "volunteer")
              navigate("/dashboard/volunteer", { replace: true });
          }
        }
      }
    };

    checkForAuthTokens();
  }, [navigate]);

  return null; // This component doesn't render anything
}
