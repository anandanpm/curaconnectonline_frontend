
import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  Star,
  DollarSign
} from 'lucide-react';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { getDoctorDashboard } from '../../api/doctorApi';
import { format } from 'date-fns';
import './DoctorDashboard.scss';

interface DoctorData {
  stats: {
    totalAppointments: number;
    totalPatients: number;
    averageRating: number;
    totalRevenue: number;
  };
  reviews: {
    reviewId: string;
    rating: number;
    reviewText: string;
    patientName: string;
    createdAt: string;
  }[];
}

// Default data with zeros for when there's no data
const defaultData: DoctorData = {
  stats: {
    totalAppointments: 0,
    totalPatients: 0,
    averageRating: 0,
    totalRevenue: 0
  },
  reviews: []
};

const DoctorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DoctorData>(defaultData);
  const [error, setError] = useState<string | null>(null);
  const doctorId = useSelector((state: RootState) => state.doctor._id);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const response = await getDoctorDashboard(doctorId);

        // Ensure we have valid data structure with defaults for missing properties
        const validatedData: DoctorData = {
          stats: {
            totalAppointments: response?.stats?.totalAppointments || 0,
            totalPatients: response?.stats?.totalPatients || 0,
            averageRating: response?.stats?.averageRating || 0,
            totalRevenue: response?.stats?.totalRevenue || 0
          },
          reviews: response?.reviews || []
        };

        setData(validatedData);
        setLoading(false);
      } catch (err) {
        setError("Error fetching doctor data. Please try again later.");
        setLoading(false);
        console.error("Error fetching doctor data:", err);
        // Set default data with zeros in case of error
        setData(defaultData);
      }
    };

    if (doctorId) {
      fetchDoctorData();
    } else {
      setLoading(false);
      setData(defaultData);
    }
  }, [doctorId]);

  if (loading) {
    return <div className="doctor-dashboard">Loading...</div>;
  }

  if (error && !data) {
    return <div className="doctor-dashboard">{error}</div>;
  }

  const { stats, reviews } = data;

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        size={16}
        fill={index < rating ? "currentColor" : "none"}
        color={index < rating ? "currentColor" : "#d1d5db"}
      />
    ));
  };

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="doctor-dashboard">
      <h2>Dashboard Overview</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>Appointments</h3>
            <p className="stat-value">{stats.totalAppointments}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <User size={24} />
          </div>
          <div className="stat-content">
            <h3>Patients</h3>
            <p className="stat-value">{stats.totalPatients}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <h3>Rating</h3>
            <p className="stat-value">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}</p>
            <p className="stat-detail">{reviews.length} reviews</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h3>Recent Patient Reviews</h3>

        {reviews && reviews.length > 0 ? (
          <div className="review-list">
            {reviews.map((review) => (
              <div key={review.reviewId} className="review-item">
                <div className="review-header">
                  <span className="patient-name">{review.patientName}</span>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                <p className="review-text">{review.reviewText}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reviews">
            <p>No reviews yet</p>
            <p className="no-reviews-subtext">Your patient reviews will appear here once they submit feedback.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;