
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginDoctor, clearError, googleAuthDoctor } from '../../redux/doctorSlice';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Snackbar, Alert } from '@mui/material';
import ForgotDocPasswordModal from '../../components/Doctor/DocforgottenPassword';
import './DoctorLogin.scss';

// Define the login schema
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
});

// Define types
interface LoginFormData {
  email: string;
  password: string;
}

interface RootState {
  doctor: {
    loading: boolean;
    error: string | null;
    isActive: boolean;
  };
}

interface DecodedGoogleCredential {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const DoctorLoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isActive } = useSelector((state: RootState) => state.doctor);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (isActive) {
      navigate('/doctor');
    }
  }, [isActive, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formik = useFormik<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(loginDoctor(values) as any);
        setSnackbarSeverity('success');
        setSnackbarMessage('Login successful!');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Login failed:', error);
        setSnackbarSeverity('error');
        setSnackbarMessage('Login failed. Please try again.');
        setSnackbarOpen(true);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleGoogleSignIn = async (credentialResponse: any) => {
    try {
      const decoded: DecodedGoogleCredential = jwtDecode(credentialResponse.credential);
      console.log('Decoded Google credential:', decoded);

      await dispatch(googleAuthDoctor(credentialResponse.credential) as any);
      setSnackbarSeverity('success');
      setSnackbarMessage('Google sign-in successful!');
      setSnackbarOpen(true);
      navigate('/doctor');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Google sign-in failed. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    errors,
    touched,
    isSubmitting,
  } = formik;

  return (
    <div className="doctor-login-container">
      <div className="login-card">
        <div className="header">
          <h1>WELCOME BACK, DOCTOR</h1>
          <p>Welcome back! Please enter your details to access your account</p>
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
              className={touched.email && errors.email ? 'error' : ''}
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
              className={touched.password && errors.password ? 'error' : ''}
              placeholder="••••••••"
            />
            {touched.password && errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="remember-forgot">
            <div className="remember">
            </div>
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
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          {error && <div className="error-message">{error}</div>}

          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleSignIn}
              onError={() => {
                setSnackbarSeverity('error');
                setSnackbarMessage('Google sign-in failed. Please try again.');
                setSnackbarOpen(true);
              }}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              shape="rectangular"
            />
          </div>

          <div className="signup-link">
            Don't have an account? <Link to="/doctor/signup">Sign up</Link>
          </div>
        </form>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <ForgotDocPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default DoctorLoginPage;
