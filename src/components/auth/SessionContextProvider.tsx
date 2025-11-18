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

  const getProfile = async (userId: string) => {
      try {
          const userProfile = await fetchUserProfile(userId);
          setProfile(userProfile);
      } catch (e) {
          console.error("Failed to fetch profile after sign in:", e);
          setProfile(null);
      }
  };

  const handleSession = async (currentSession: Session | null) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
          await getProfile(currentUser.id);
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