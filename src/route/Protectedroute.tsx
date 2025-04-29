import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

interface ProtectedRouteProps {
  adminOnly?: boolean;
  userOnly?: boolean;
  doctorOnly?: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  adminOnly,
  userOnly,
  doctorOnly,
  children,
}) => {

  const admin = useSelector((state: any) => state.admin);
  const user = useSelector((state: any) => state.user);
  const doctor = useSelector((state: any) => state.doctor);

  if (!admin && !user && !doctor) {

    return <Navigate to="/" replace />;
  }

  if (adminOnly && admin.role !== "admin") {

    return <Navigate to="/admin" replace />;
  }

  if (userOnly && user.role !== "patient") {
    // Redirect to an error page or unauthorized page if the user is not a user
    return <Navigate to="/login" replace />;
  }

  if (doctorOnly && doctor.role !== "doctor") {
    return <Navigate to="/doctor/login" replace />;
  }



  // Render the protected component if all conditions are satisfied
  return <>{children}</>;
};

export default ProtectedRoute;
