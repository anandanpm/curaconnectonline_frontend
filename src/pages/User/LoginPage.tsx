
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError, googleAuth } from "../../redux/userSlice";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./LoginPage.scss";
import ForgotPasswordModal from "../../components/ForgottenPassword/forgottenPassword";

// Define the login schema
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
});

// Define types
interface LoginFormData {
  email: string;
  password: string;
}

interface RootState {
  user: {
    loading: boolean;
    error: string | null;
    isActive: boolean;
  };
}

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isActive } = useSelector(
    (state: RootState) => state.user
  );
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  useEffect(() => {
    if (isActive) {
      navigate("/");
    }
  }, [isActive, navigate]);

  useEffect(() => {
    // Clear any existing errors when the component mounts
    dispatch(clearError());
  }, [dispatch]);

  const formik = useFormik<LoginFormData>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(loginUser(values) as any);
        // Navigation is handled by the useEffect hook watching isAuthenticated
      } catch (error) {
        console.error("Login failed:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    errors,
    touched,
    isSubmitting,
  } = formik;

  const handleGoogleSignIn = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      console.log(decoded); // Log the decoded token to see its contents
      await dispatch(googleAuth(credentialResponse.credential) as any);
      // Navigation is handled by the useEffect hook watching isActive
    } catch (error: any) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="header">
          <h1>WELCOME BACK</h1>
          <p>Welcome back! Please enter your details</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? "error" : ""}
              placeholder="Enter your email"
            />
            {touched.email && errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.password && errors.password ? "error" : ""}
              placeholder="••••••••"
            />
            {touched.password && errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="remember-forgot">
            <div className="remember"></div>

            <a
              className="forgot"
              onClick={(e) => {
                e.preventDefault();
                setIsForgotPasswordOpen(true);
              }}
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting || loading || Object.keys(errors).length > 0}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {error && <div className="error-message">{error}</div>}

          <GoogleLogin
            onSuccess={handleGoogleSignIn}
            onError={() => {
              console.log("Login Failed");
            }}
            useOneTap
          />

          <div className="signup-link">
            Don't have an account? <Link to={"/signup"}>signup</Link>
          </div>
        </form>
      </div>
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
