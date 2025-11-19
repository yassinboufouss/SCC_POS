"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { Profile } from '@/types/supabase';
import { fetchUserProfile } from '@/utils/member-utils';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null; // Added profile
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};

interface SessionContextProviderProps {
  children: React.ReactNode;
}

export const SessionContextProvider: React.FC<SessionContextProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // State for profile
  const [isLoading, setIsLoading] = useState(true);

  const getMinimalProfile = (currentUser: User): Profile => ({
      id: currentUser.id,
      email: currentUser.email || null,
      role: 'member', // Default role
      first_name: null,
      last_name: null,
      avatar_url: null,
      updated_at: null,
      member_code: null,
      phone: null,
      dob: null,
      plan_name: null,
      status: 'Pending',
      start_date: null,
      expiration_date: null,
      last_check_in: null,
      total_check_ins: 0,
  });

  // Helper function to fetch and process profile data
  const fetchAndProcessProfile = async (currentUser: User): Promise<Profile> => {
      const minimalProfile = getMinimalProfile(currentUser);
      
      try {
          const userProfile = await fetchUserProfile(currentUser.id);
          
          if (userProfile) {
              // Merge email from the User object into the profile object
              return { ...userProfile, email: currentUser.email || null };
          } else {
              // If profile doesn't exist yet or fetch failed, use the minimal profile
              return minimalProfile;
          }
      } catch (e) {
          console.error("Error fetching user profile, falling back to minimal profile:", e);
          return minimalProfile;
      }
  };

  // Refactored: Sets all states together after profile fetch completes
  const handleSession = async (currentSession: Session | null) => {
      const currentUser = currentSession?.user ?? null;
      let userProfile: Profile | null = null;
      
      if (currentUser) {
          userProfile = await fetchAndProcessProfile(currentUser);
      }
      
      // Set all states in one go (or close to it)
      setSession(currentSession);
      setUser(currentUser);
      setProfile(userProfile);
      setIsLoading(false);
  };

  useEffect(() => {
    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_IN') {
        // Await the async operation to ensure profile is set before ProtectedRoute sees isLoading=false
        handleSession(currentSession).then(() => {
            showSuccess(t('login_successful'));
        });
      } else if (event === 'SIGNED_OUT') {
        handleSession(null).then(() => {
            showSuccess(t('logout_successful'));
        });
      } else if (event === 'INITIAL_SESSION') {
        // Handled below
      } else {
        setIsLoading(false);
      }
    });

    // Fetch initial session manually and ensure we wait for profile fetch before setting isLoading=false
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        handleSession(initialSession);
    });

    return () => subscription.unsubscribe();
  }, [t]);

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};