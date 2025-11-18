"use client";

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from './SessionContextProvider';
import { useTranslation } from 'react-i18next';

const ProtectedRoute: React.FC = () => {
  const { session, isLoading } = useSession();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t("loading")}...</p>
      </div>
    );
  }

  if (!session) {
    // User is not authenticated, redirect them to the login page
    return <Navigate to="/" replace />;
  }

  // User is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;