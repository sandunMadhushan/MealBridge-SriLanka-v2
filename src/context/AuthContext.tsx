import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to sync Google profile image to users table
  const syncGoogleProfileImage = async (user: User) => {
    if (!user.user_metadata?.avatar_url) return;

    try {
      // Check if user exists in users table and if profile_image_url is missing
      const { data: existingUser } = await supabase
        .from("users")
        .select("profile_image_url")
        .eq("id", user.id)
        .single();

      if (existingUser && !existingUser.profile_image_url) {
        // Update users table with Google profile image
        await supabase
          .from("users")
          .update({
            profile_image_url: user.user_metadata.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
    } catch (error) {
      console.error("Error syncing Google profile image:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Sync Google profile image if user exists
      if (currentUser) {
        syncGoogleProfileImage(currentUser);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Sync Google profile image on sign in
      if (event === "SIGNED_IN" && currentUser) {
        syncGoogleProfileImage(currentUser);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
