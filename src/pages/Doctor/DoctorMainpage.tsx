import React from 'react'
import Doctorimage from '../../assets/doctormain1.png'
import Appointmentimage from '../../assets/doctormain2.png'
import Videocallimage from '../../assets/vediocall.png'
import Patientlistimage from '../../assets/patientlist.png'
import Onlinepayimage from '../../assets/online money.png'

import './DoctorMainpage.scss'

const DocMainpage: React.FC = () => {
  const services = [
    {
      title: "Appointment",
      description: "Easy book appointments with your preferred doctor. Get a time slot that works best for you and manage your schedule effortlessly.",
      image: Appointmentimage
    },
    {
      title: "vedio call",
      description: "Connect with your doctor through secure high-quality video calls, ensuring you get the care you need without leaving the comfort of your home.",
      image: Videocallimage
    },
    {
      title: "patient list",
      description: "Access and manage patient details in an organized manner, keeping track of medical history and treatment plans.",
      image: Patientlistimage
    },
    {
      title: "online pay",
      description: "Experience hassle-free secure payments with secure gateways. Pay your medical bills instantly, saving time and effort.",
      image: Onlinepayimage
    }
  ]

  return (
    <main className="doc-mainpage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__container">
          <div className="hero__content">
            <h1 className="hero__title">
              Transforming Lives Through Solutions
            </h1>
            <div className="hero__text">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat. Duis aute irure dolor.
              </p>
            </div>
          </div>
          <div className="hero__image">
            <img
              src={Doctorimage}
              alt="Medical professional"
              className="hero__image-content"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <h2 className="services__title">Our Services</h2>
        <div className="services__grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-card__image">
                <img
                  src={service.image}
                  alt={service.title}
                  className="service-card__image-content"
                />
              </div>
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__description">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default DocMainpage
