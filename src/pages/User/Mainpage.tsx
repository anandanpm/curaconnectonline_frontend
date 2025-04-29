import React from 'react';
import './Mainpage.scss';
import { useNavigate } from 'react-router-dom'
import doctorImage from '../../assets/image 17.png';

const Mainpage: React.FC = () => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate('/doctordetails');
  };
  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__title">
            Providing Quality <span className="highlight">Healthcare</span> For A
            <br />
            <span className="highlight-secondary">Brighter</span> And <span className="highlight">Healthy</span> Future
          </h1>
          <p className="hero__description">
            At Our Online Platform, We Are Revolutionizing Healthcare With A
            Focus On Accessibility, Convenience, And Trust. From
            Scheduling Appointments To Providing Virtual Consultations,
            We Connect Patients With Experienced Doctors In Just A
            Few Clicks. Backed By Innovative Technology And A
            Commitment To Personalized Care, We Aim To Make Quality
            Healthcare Services Available Anytime, Anywhere. Join Us In
            Embracing A Healthier, Smarter Way To Care For Yourself And
            Your Loved Ones.
          </p>
          <button className="hero__cta" onClick={handleBookAppointment}>Book Appointments</button>
        </div>
        <div className="hero__image-wrapper">
          <img src={doctorImage} alt="Professional doctor with stethoscope" className="hero__image" />
        </div>
      </div>
    </section>
  );
}

export default Mainpage