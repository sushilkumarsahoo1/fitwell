import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@services/supabase";
import type { AuthState, User, UserProfile } from "@types/index";

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  profileFetched: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Get the session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        // Verify the user still exists in auth
        const { data: authUser, error: userError } = await supabase.auth.getUser();
        
        if (userError || !authUser?.user) {
          // User deleted or session invalid - sign out
          await supabase.auth.signOut();
          setUser(null);
          setIsAuthenticated(false);
          setProfile(null);
          setProfileFetched(true);
          return;
        }

        // User exists - set state and fetch profile
        setUser({
          id: authUser.user.id,
          email: authUser.user.email || "",
          created_at: authUser.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsAuthenticated(true);
        await fetchProfile();
      } else {
        // No session
        setUser(null);
        setIsAuthenticated(false);
        setProfile(null);
        setProfileFetched(true);
      }
    } catch (error) {
      console.error("Bootstrap error:", error);
      setUser(null);
      setIsAuthenticated(false);
      setProfile(null);
      setProfileFetched(true);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          created_at: data.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsAuthenticated(true);
        // Pass user ID directly to avoid race condition
        await fetchProfile(data.user.id);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          created_at: data.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsAuthenticated(true);
        // Pass user ID directly to avoid race condition
        await fetchProfile(data.user.id);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      setProfileFetched(false);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId?: string) => {
    try {
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        // No user ID available: mark as fetched to prevent infinite loading
        setProfileFetched(true);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile(data);
      }
      // Mark that we've attempted to fetch, regardless of result
      setProfileFetched(true);
    } catch (error) {
      console.error("Fetch profile error:", error);
      setProfileFetched(true);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("No user logged in");
      if (!user.id) throw new Error("User ID not set - cannot create profile");

      console.log("Creating/updating profile for user:", user.id);

      // UPSERT: Insert if not exists, update if exists
      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          [
            {
              user_id: user.id,
              fitness_goal: profileData.fitness_goal || "maintain",
              activity_level: profileData.activity_level || "moderate",
              daily_calorie_target: profileData.daily_calorie_target || 2000,
              ...profileData,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "user_id" }
        )
        .select();

      if (error) {
        console.error("Profile update error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          user_id: user.id,
        });
        throw error;
      }

      if (data && data[0]) {
        setProfile(data[0]);
      }
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated,
        signUp,
        signIn,
        signOut,
        updateProfile,
        fetchProfile,
        profileFetched,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
