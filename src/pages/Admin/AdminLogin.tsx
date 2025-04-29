import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin, clearError } from '../../redux/adminSlice';
import { AppDispatch } from '../../redux/store';
import './AdminLogin.scss';
import companyLogo from '../../assets/company logo.png';
import lockImage from '../../assets/lockimage.png';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

interface RootState {
  admin: {
    loading: boolean;
    error: string | null;
    isActive: boolean;
  };
}

const AdminLogin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isActive } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    if (isActive) {
      navigate('/admin/dashboard');
    }
  }, [isActive, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(loginAdmin(values)).unwrap();
      } catch (error) {
        console.error('Login failed:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="logo">
          <img src={companyLogo} alt="Curaconnect" />
        </div>

        <div className="lock-illustration">
          <img src={lockImage} alt="Security Lock" />
        </div>

        <h1>ADMIN LOGIN</h1>

        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.email && formik.errors.email ? 'error' : ''}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="error-message">{formik.errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.password && formik.errors.password ? 'error' : ''}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="error-message">{formik.errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={formik.isSubmitting || loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

