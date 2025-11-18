"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

interface SessionContextType {
  session: Session | null;
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setSession(session);
        setUser(session?.user ?? null);
        showSuccess(t('login_successful'));
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        showSuccess(t('logout_successful'));
      } else if (event === 'INITIAL_SESSION') {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setIsLoading(false);
    });

    // Fetch initial session manually in case onAuthStateChange misses it on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [t]);

  return (
    <SessionContext.Provider value={{ session, user, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};