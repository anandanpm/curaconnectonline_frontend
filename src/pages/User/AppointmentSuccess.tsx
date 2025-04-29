import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { Button, Typography, Box, Container, Paper } from '@mui/material';
import './AppointmentSuccess.scss';

const AppointmentSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToAppointments = () => {
    navigate('/appointment');
  };

  return (
    <Container maxWidth="sm" className="appointment-success-page">
      <Paper elevation={3} className="success-card">
        <Box display="flex" flexDirection="column" alignItems="center" className="success-content">
          <div className="success-icon-wrapper">
            <CheckCircleIcon className="success-icon" />
          </div>
          <Typography variant="h4" component="h1" className="success-title" gutterBottom>
            Appointment Booked Successfully!
          </Typography>
          <Typography variant="body1" className="success-message" gutterBottom>
            Your appointment has been scheduled.
          </Typography>
          <div className="info-box">
            <Typography variant="body2">
              A confirmation email has been sent to your inbox with all the details.
            </Typography>
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoToAppointments}
            className="action-button"
          >
            Go to Appointments
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AppointmentSuccessPage;