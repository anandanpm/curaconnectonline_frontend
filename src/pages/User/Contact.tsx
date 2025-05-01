
import type React from "react"
import "./Contact.scss"
import doctorImage from "../../assets/doctor treating.avif"

const ContactPage: React.FC = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="image-section">
          <img
            src={doctorImage || "/placeholder.svg"}
            alt="Healthcare professional attending to a patient"
            className="contact-image"
          />
          <div className="image-overlay"></div>
        </div>
        <div className="info-section">
          <div className="info-content">
            <h2 className="contact-heading">CONTACT US</h2>

            <div className="office-info">
              <h3 className="sub-heading">OUR OFFICE</h3>
              <div className="address-block">
                <p className="address">56704 Willow Station</p>
                <p className="address">Suite 300, Washington, USA</p>
              </div>

              <div className="contact-details">
                <div className="contact-item">
                  <div className="icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="contact-icon"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <p className="phone">Tel: (410) 555-0132</p>
                </div>
                <div className="contact-item">
                  <div className="icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="contact-icon"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <p className="email">Email: curaconnect@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="contact-cta">
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
