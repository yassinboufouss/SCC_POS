"use client";

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from './SessionContextProvider';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '@/hooks/use-user-role'; // Import useUserRole

const ProtectedRoute: React.FC = () => {
  const { session, profile, isLoading } = useSession();
  const { isMember, isOwner, isStaff } = useUserRole();
  const { t } = useTranslation();
  const location = useLocation();

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
  // If profile is null, or if the role is undefined/unrecognized, we block access to protected routes.
  if (!profile || (!isOwner && !isStaff && !isMember)) {
      // Logged in but lacks a valid profile/role.
      console.error("Access Denied: User is authenticated but lacks a valid profile/role.");
      
      // Instead of redirecting to '/', which causes a loop because the user is authenticated, 
      // we display an error message and suggest a refresh.
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
              <h1 className="text-2xl font-bold text-red-600">{t("access_denied")}</h1>
              <p className="mt-2 text-muted-foreground">
                  {t("error_fetching_dashboard_data")} {t("please_refresh_or_contact_support")}
              </p>
              <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
              >
                  {t("refresh")}
              </button>
          </div>
      );
  }
  
  // Check 3: Role-based routing
  
  // If the user is a member, they should only access /my-profile.
  if (isMember) {
      // If they try to access any staff/owner route, redirect them to their profile page.
      if (location.pathname !== '/my-profile') {
          return <Navigate to="/my-profile" replace />;
      }
      // If they are on /my-profile, allow access.
      return <Outlet />;
  }
  
  // If the user is staff or owner, they should not access /my-profile.
  if ((isStaff || isOwner) && location.pathname === '/my-profile') {
      // Redirect staff/owner trying to access member portal to dashboard
      return <Navigate to="/dashboard" replace />;
  }

  // Staff/Owner accessing protected routes (other than /my-profile)
  return <Outlet />;
};

export default ProtectedRoute;