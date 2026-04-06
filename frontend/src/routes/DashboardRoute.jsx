import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/RoleProtectedRoute";
import Profile from "../pages/user/Profile";
import Settings from "../pages/user/Settings";

/**
 * DashboardRoute component: Defines shared routes accessible across different dashboard roles.
 */
const DashboardRoute = () => {
  return (
    <>
      <Route
        path="profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default DashboardRoute;
