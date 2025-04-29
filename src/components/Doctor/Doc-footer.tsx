import React from 'react';
import './Doc-Footer.scss';


interface FooterProps { }

const DocFooter: React.FC<FooterProps> = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <h2 className="footer__logo">Curraconnect</h2>
          <p className="footer__copyright">
            Copyright © 2022 BRIX Templates<br />
            | All Rights Reserved
          </p>
        </div>

        <div className="footer__content">
          <div className="footer__section">
            <h3 className="footer__section-title">Important links</h3>
            <ul className="footer__list">
              <li><a href="#" className="footer__link">Appointment</a></li>
              <li><a href="#" className="footer__link">Doctor</a></li>
              <li><a href="#" className="footer__link">About us</a></li>
              <li><a href="#" className="footer__link">Service</a></li>
            </ul>
          </div>

          <div className="footer__section">
            <h3 className="footer__section-title">Contact us</h3>
            <ul className="footer__list">
              <li>Call: (237) 681-812-255</li>
              <li>Email: fitdineesue@gmail.com</li>
              <li>Address: 0123 Some place</li>
              <li>Some country</li>
            </ul>
          </div>

          <div className="footer__section">
            <h3 className="footer__section-title">Follow us</h3>
            <ul className="footer__list">
              <li><a href="#" className="footer__link">Facebook</a></li>
              <li><a href="#" className="footer__link">Twitter</a></li>
              <li><a href="#" className="footer__link">Instagram</a></li>
              <li><a href="#" className="footer__link">LinkedIn</a></li>
              <li><a href="#" className="footer__link">YouTube</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DocFooter;
