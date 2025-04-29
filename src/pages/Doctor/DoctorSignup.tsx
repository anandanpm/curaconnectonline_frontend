import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupDoctor, clearError, googleAuthDoctor } from '../../redux/doctorSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { Snackbar, Alert } from '@mui/material';
import './DoctorSignup.scss';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const validationSchema = Yup.object({
  username: Yup.string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      'Password must contain at least one letter and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

export default function DoctorSignupForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.doctor);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage(error);
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    dispatch(clearError());
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(signupDoctor({
          username: values.username,
          email: values.email,
          password: values.password,
        })).unwrap();

        setSnackbarSeverity('success');
        setSnackbarMessage('Signup successful! OTP has been sent to your email.');
        setSnackbarOpen(true);
        navigate('/Docotp');
      } catch (error: any) {
        console.error('Doctor signup error:', error);
        setSnackbarSeverity('error');
        setSnackbarMessage(error || 'An error occurred during signup');
        setSnackbarOpen(true);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleGoogleSignIn = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      console.log(decoded);
      await dispatch(googleAuthDoctor(credentialResponse.credential)).unwrap();
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

  return (
    <div className="doctor-signup-container">
      <div className="form-header">
        <h1>Doctor Registration</h1>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="username">Full Name</label>
          <input
            type="text"
            id="username"
            name="username"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
            className={formik.touched.username && formik.errors.username ? 'error' : ''}
          />
          {formik.touched.username && formik.errors.username && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {formik.errors.username}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={formik.touched.email && formik.errors.email ? 'error' : ''}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {formik.errors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className={formik.touched.password && formik.errors.password ? 'error' : ''}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {formik.errors.password}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {formik.errors.confirmPassword}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="signup-button"
          disabled={formik.isSubmitting || !formik.isValid || loading}
        >
          {loading ? 'Signing up...' : 'Register as Doctor'}
        </button>

        <div className="divider">Or</div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSignIn}
            onError={() => {
              console.log('Login Failed');
              setSnackbarSeverity('error');
              setSnackbarMessage('Google sign-in failed. Please try again.');
              setSnackbarOpen(true);
            }}
            useOneTap
          />
        </div>

        <div className="login-link">
          Already have an account? <Link to="/doctor-login">Login</Link>
        </div>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

