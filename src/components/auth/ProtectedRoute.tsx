"use client";

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from './SessionContextProvider';
import { useTranslation } from 'react-i18next';

const ProtectedRoute: React.FC = () => {
  const { session, profile, isLoading } = useSession();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t("loading")}...</p>
      </div>
    );
  }

  // Check 1: Is authenticated?
  if (!session) {
    // User is not authenticated, redirect them to the login page
    return <Navigate to="/" replace />;
  }
  
  // Check 2: Does the user have a profile and a defined role?
  // If a user logs in but has no profile (e.g., a test user created outside the flow), we deny access.
  if (!profile || (!profile.role)) {
      // Logged in but no valid admin profile/role found.
      console.error("Access Denied: User is authenticated but lacks a valid admin profile/role.");
      return <Navigate to="/" replace />;
  }

  // User is authenticated and has a profile/role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;