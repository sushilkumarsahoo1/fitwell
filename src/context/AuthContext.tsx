import { supabase } from "@services/supabase";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthState, User, UserProfile } from "../types";

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

    // Listen to auth state changes from Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
          setProfileFetched(false);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setIsAuthenticated(true);
            setProfileFetched(false);
            await fetchProfile(session.user.id);
          }
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
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
        const { data: authUser, error: userError } =
          await supabase.auth.getUser();

        if (userError || !authUser?.user) {
          // User deleted or session invalid - sign out
          await supabase.auth.signOut();
          setUser(null);
          setIsAuthenticated(false);
          setProfile(null);
          setProfileFetched(true);
          return;
        }

        // User exists and is verified - set state and fetch profile
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
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
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
        setProfileFetched(false);
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
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
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
        setProfileFetched(false);
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
      // Clear state immediately before calling Supabase signOut
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      setProfileFetched(false);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
      const { data: authUserData, error: authUserError } =
        await supabase.auth.getUser();

      if (authUserError || !authUserData?.user) {
        throw new Error("No authenticated user - cannot create profile");
      }

      const currentUserId = authUserData.user.id;

      if (!user || user.id !== currentUserId) {
        setUser({
          id: currentUserId,
          email: authUserData.user.email || "",
          created_at: authUserData.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsAuthenticated(true);
      }

      console.log("Creating/updating profile for user:", currentUserId);

      let existingProfile: UserProfile | null = null;
      const { data: existingData, error: existingError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", currentUserId)
        .single();

      if (existingError && existingError.code !== "PGRST116") {
        throw existingError;
      }

      if (existingData) {
        existingProfile = existingData as UserProfile;
      }

      const mergedProfile = {
        ...(existingProfile || profile || {}),
        ...profileData,
      };

      // UPSERT: Insert if not exists, update if exists
      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          [
            {
              user_id: currentUserId,
              ...mergedProfile,
              fitness_goal: mergedProfile.fitness_goal || "maintain",
              activity_level: mergedProfile.activity_level || "moderate",
              daily_calorie_target: mergedProfile.daily_calorie_target || 2000,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "user_id" },
        )
        .select();

      if (error) {
        console.error("Profile update error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          user_id: currentUserId,
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
