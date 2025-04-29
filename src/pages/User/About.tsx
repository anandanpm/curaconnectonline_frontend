// import React, { useEffect, useRef } from 'react';
// import { Calendar, Clock, Users, Shield, Video, CheckCircle, Heart, Star, Award } from 'lucide-react';
// import DoctorImage2 from '../../assets/about2.png';
// import './About.scss';

// const About: React.FC = () => {
//   const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             entry.target.classList.add('visible');
//           }
//         });
//       },
//       { threshold: 0.1 }
//     );

//     featureRefs.current.forEach((ref) => {
//       if (ref) observer.observe(ref);
//     });

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <div className="about">
//       <section className="hero">
//         <div className="hero-content">
//           <div className="hero-text">
//             <h1>
//               Revolutionizing
//               <br />
//               <span className="highlight">Patient Care</span>
//               <br />
//               with CuraConnect
//             </h1>
//             <p>
//               Empowering over 9 million patients to connect
//               and engage with healthcare practices worldwide.
//             </p>
//             <button className="started-button">Get Started</button>
//           </div>
//           <div className="hero-image">
//           </div>
//         </div>
//         <div className="features">
//           <div
//             ref={el => featureRefs.current[0] = el}
//             className="feature"
//           >
//             <div className="icon-wrapper">
//               <Users className="icon" />
//             </div>
//             <h3>Easy Onboarding</h3>
//             <p>Start your health journey with a simple sign-up process</p>
//           </div>
//           <div
//             ref={el => featureRefs.current[1] = el}
//             className="feature"
//           >
//             <div className="icon-wrapper">
//               <Shield className="icon" />
//             </div>
//             <h3>Full Control</h3>
//             <p>Customizable features to meet your unique healthcare needs</p>
//           </div>
//           <div
//             ref={el => featureRefs.current[2] = el}
//             className="feature"
//           >
//             <div className="icon-wrapper">
//               <Clock className="icon" />
//             </div>
//             <h3>24/7 Access</h3>
//             <p>Book appointments and access health information anytime</p>
//           </div>
//         </div>
//       </section>

//       <section className="mission">
//         <h2>Our Mission</h2>
//         <p>At CuraConnect, we're dedicated to bridging the gap between patients and healthcare providers, ensuring seamless communication and improved health outcomes for all.</p>
//         <div className="mission-values">
//           <div className="value">
//             <Heart className="value-icon" />
//             <h3>Patient-Centric Care</h3>
//             <p>Putting patients first in every aspect of our service</p>
//           </div>
//           <div className="value">
//             <Star className="value-icon" />
//             <h3>Innovation</h3>
//             <p>Continuously improving our platform with cutting-edge technology</p>
//           </div>
//           <div className="value">
//             <Award className="value-icon" />
//             <h3>Excellence</h3>
//             <p>Striving for the highest standards in healthcare communication</p>
//           </div>
//         </div>
//       </section>

//       <section className="booking">
//         <div className="booking-content">
//           <div className="booking-image">
//             <img
//               src={DoctorImage2}
//               alt="Doctor with patient"
//               className="doctor-image"
//             />
//           </div>
//           <div
//             ref={el => featureRefs.current[3] = el}
//             className="booking-text"
//           >
//             <h2>Seamless Booking Experience</h2>
//             <p>
//               Over 70% of patients prefer online specialist bookings.
//               CuraConnect delivers a 24/7 booking platform, providing
//               the freedom and modern experience patients expect.
//             </p>
//             <div className="booking-features">
//               <div className="booking-feature">
//                 <Video className="feature-icon" />
//                 <span>Video Consultations</span>
//               </div>
//               <div className="booking-feature">
//                 <Calendar className="feature-icon" />
//                 <span>Easy Scheduling</span>
//               </div>
//               <div className="booking-feature">
//                 <CheckCircle className="feature-icon" />
//                 <span>Instant Confirmations</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default About;



import React, { useEffect, useRef } from 'react';
import { Calendar, Clock, Users, Shield, Video, CheckCircle, Heart, Star, Award } from 'lucide-react';
import DoctorImage2 from '../../assets/about2.png';
import './About.scss';

const About: React.FC = () => {
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about">
      <section className="hero">
        <div className="hero-background">
          <div className="circles circle-1"></div>
          <div className="circles circle-2"></div>
          <div className="circles circle-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <div className="tag-badge">Healthcare Platform</div>
            <h1>
              Revolutionizing
              <br />
              <span className="highlight">Patient Care</span>
              <br />
              with CuraConnect
            </h1>
            <p>
              Empowering over <span className="highlight-text">9 million patients</span> to connect
              and engage with healthcare practices worldwide.
            </p>
            <div className="cta-buttons">
              <button className="started-button primary-btn">Get Started</button>
              <button className="started-button secondary-btn">Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-container">
              <img src={DoctorImage2} alt="Healthcare professional" />
              <div className="floating-badge patients-badge">
                <Users size={18} />
                <span>9M+ Patients</span>
              </div>
              <div className="floating-badge practices-badge">
                <Shield size={18} />
                <span>5K+ Practices</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="features">
          <div
            ref={el => featureRefs.current[0] = el}
            className="feature"
          >
            <div className="icon-wrapper">
              <Users className="icon" />
            </div>
            <h3>Easy Onboarding</h3>
            <p>Start your health journey with a simple sign-up process</p>
          </div>
          <div
            ref={el => featureRefs.current[1] = el}
            className="feature"
          >
            <div className="icon-wrapper">
              <Shield className="icon" />
            </div>
            <h3>Full Control</h3>
            <p>Customizable features to meet your unique healthcare needs</p>
          </div>
          <div
            ref={el => featureRefs.current[2] = el}
            className="feature"
          >
            <div className="icon-wrapper">
              <Clock className="icon" />
            </div>
            <h3>24/7 Access</h3>
            <p>Book appointments and access health information anytime</p>
          </div>
        </div>
      </section>

      <section className="mission">
        <h2>Our Mission</h2>
        <p>At CuraConnect, we're dedicated to bridging the gap between patients and healthcare providers, ensuring seamless communication and improved health outcomes for all.</p>
        <div className="mission-values">
          <div className="value">
            <Heart className="value-icon" />
            <h3>Patient-Centric Care</h3>
            <p>Putting patients first in every aspect of our service</p>
          </div>
          <div className="value">
            <Star className="value-icon" />
            <h3>Innovation</h3>
            <p>Continuously improving our platform with cutting-edge technology</p>
          </div>
          <div className="value">
            <Award className="value-icon" />
            <h3>Excellence</h3>
            <p>Striving for the highest standards in healthcare communication</p>
          </div>
        </div>
      </section>

      <section className="booking">
        <div className="booking-content">
          <div className="booking-image">
            <img
              src={DoctorImage2}
              alt="Doctor with patient"
              className="doctor-image"
            />
          </div>
          <div
            ref={el => featureRefs.current[3] = el}
            className="booking-text"
          >
            <h2>Seamless Booking Experience</h2>
            <p>
              Over 70% of patients prefer online specialist bookings.
              CuraConnect delivers a 24/7 booking platform, providing
              the freedom and modern experience patients expect.
            </p>
            <div className="booking-features">
              <div className="booking-feature">
                <Video className="feature-icon" />
                <span>Video Consultations</span>
              </div>
              <div className="booking-feature">
                <Calendar className="feature-icon" />
                <span>Easy Scheduling</span>
              </div>
              <div className="booking-feature">
                <CheckCircle className="feature-icon" />
                <span>Instant Confirmations</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;