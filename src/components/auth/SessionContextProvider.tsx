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

  const getProfile = async (currentUser: User) => {
      const minimalProfile: Profile = {
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
      };

      try {
          const userProfile = await fetchUserProfile(currentUser.id);
          
          // Merge email from the User object into the profile object
          if (userProfile) {
              const completeProfile = { ...userProfile, email: currentUser.email || null };
              setProfile(completeProfile);
          } else {
              // If profile doesn't exist yet (PGRST116), use the minimal profile
              setProfile(minimalProfile);
          }
      } catch (e) {
          console.error("Failed to fetch profile after sign in:", e);
          // If fetching fails due to an unexpected error (e.g., RLS denial, network), 
          // we still set a minimal profile to prevent the ProtectedRoute from blocking access entirely.
          setProfile(minimalProfile);
      }
  };

  const handleSession = async (currentSession: Session | null) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
          await getProfile(currentUser);
      } else {
          setProfile(null);
      }
      setIsLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_IN') {
        handleSession(currentSession);
        showSuccess(t('login_successful'));
      } else if (event === 'SIGNED_OUT') {
        handleSession(null);
        showSuccess(t('logout_successful'));
      } else if (event === 'INITIAL_SESSION') {
        handleSession(currentSession);
      } else {
        setIsLoading(false);
      }
    });

    // Fetch initial session manually in case onAuthStateChange misses it on first load
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