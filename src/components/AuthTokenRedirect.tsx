import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function AuthTokenRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkForAuthTokens = () => {
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
      }
    };

    checkForAuthTokens();
  }, [navigate]);

  return null; // This component doesn't render anything
}
