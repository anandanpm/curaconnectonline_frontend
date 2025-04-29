import { RouteObject } from "react-router-dom";
import UserLayout from "../layout/Userlayout";
import DoctorLayout from "../layout/Doctorlayout";
import AdminLayout from "../layout/Adminlayout";
import Mainpage from "../pages/User/Mainpage";
import SignupPage from "../pages/User/SignupPage";
import Otppage from "../pages/User/Otppage";
import LoginPage from "../pages/User/LoginPage";
import About from "../pages/User/About";
import Contact from '../pages/User/Contact';
import DocMainpage from "../pages/Doctor/DoctorMainpage";
import Docsignup from "../pages/Doctor/DoctorSignup";
import DocOtp from "../pages/Doctor/DoctorOtp";
import Doclogin from "../pages/Doctor/DoctorLogin";
import AdminLogin from "../pages/Admin/AdminLogin";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import Profile from "../pages/User/Profile";
import Docprofile from "../pages/Doctor/DoctorProfile";
import ProtectedRoute from "./Protectedroute";
import AdminPatient from '../pages/Admin/AdminPatient';
import AdminDoctor from '../pages/Admin/AdminDoctor'
import DoctorPage from "../pages/User/DoctorPage";
import DoctorSlot from "../pages/Doctor/DoctorSlot";
import AdminVerifyDoctor from '../pages/Admin/AdminVerifyDoctor';
import AppointmentPage from '../pages/User/AppointmentPage';
import AppointmentDetail from '../pages/User/BookAppointment';
import Chathistory from '../pages/User/Chathistory';
import DoctorAppointment from '../pages/Doctor/DoctorPatient';
import AppointmentSuccess from '../pages/User/AppointmentSuccess';
import BookingHistory from '../pages/User/PreviousAppointment'
import Chat from '../components/Chat/Chat ';
import DocChat from "../pages/Doctor/DocChat";
import Prescription from '../pages/Doctor/DocPrescription'
import Vediocall from "../components/Video/Vediocall";
import PrescriptionDetails from "../pages/User/Prescription";
import Review from "../pages/User/Review"
import AdminReview from '../pages/Admin/AdminReview'
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";

export const routes: RouteObject[] = [
  // Standalone OTP routes (no layout)
  { path: "/otp", element: <Otppage /> },
  { path: "/Docotp", element: <DocOtp /> },

  // Admin Routes
  { path: "/admin", element: <AdminLogin /> },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
    ],
  },
  {
    path: "/admin/patients",
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminPatient /> }
    ]
  },
  {
    path: "/admin/doctors",
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDoctor /> }
    ]
  },
  {
    path: "/admin/review",
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminReview /> }
    ]
  },
  {
    path: "/admin/verify-doctor",
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminVerifyDoctor /> }
    ]
  },

  // User Routes with layout
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <Mainpage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "about", element: <About /> },
      {path:'contact', element: <Contact />},
      { path: 'doctordetails', element: <DoctorPage /> },
      { path: "/chat/:appointmentId", element: <Chat /> },
      {path:'chathistory/:appointmentId', element: <Chathistory />},
      { path: "/video-call/:appointmentId/:roomId", element: <Vediocall /> },

      {
        path: "profile",
        element: (
          <ProtectedRoute userOnly>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "appointment/:id",
        element: (
          <ProtectedRoute userOnly>
            <AppointmentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "appointment",
        element: (
          <ProtectedRoute userOnly>
            <AppointmentDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "appointment-success",
        element: (
          <ProtectedRoute userOnly>
            <AppointmentSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: "historyappointment",
        element: (
          <ProtectedRoute userOnly>
            <BookingHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "prescriptions/:appointmentid",
        element: (
          <ProtectedRoute userOnly>
            <PrescriptionDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "review/:appointmentid",
        element: (
          <ProtectedRoute userOnly>
            <Review />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Doctor Routes with layout
  {
    path: "/doctor",
    element: <DoctorLayout />,
    children: [
      { index: true, element: <DocMainpage /> },
      { path: "signup", element: <Docsignup /> },
      { path: "login", element: <Doclogin /> },
      { path: 'chat/:appointmentId', element: <DocChat /> },
      { path: 'video-call/:appointmentId/:roomId', element: <Vediocall /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute doctorOnly>
            <Docprofile />
          </ProtectedRoute>
        ),
      },
      {
        path: "appointment",
        element: (
          <ProtectedRoute doctorOnly>
            <DoctorSlot />
          </ProtectedRoute>
        ),
      },
      {
        path: "patient",
        element: (
          <ProtectedRoute doctorOnly>
            <DoctorAppointment />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute doctorOnly>
            <DoctorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "prescription/:appointmentId",
        element: (
          <ProtectedRoute doctorOnly>
            <Prescription />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

