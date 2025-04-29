
// import React, { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { getPrescriptionByAppointmentId } from '../../api/userApi';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import './Prescription.scss';

// interface Medicine {
//   name: string;
//   dosage: string;
//   frequency: {
//     morning: boolean;
//     afternoon: boolean;
//     evening: boolean;
//     night: boolean;
//   };
//   duration: number;
//   instructions?: string;
// }

// interface Prescription {
//   _id?: string;
//   appointment_id: string;
//   medicines: Medicine[];
//   notes?: string;
//   created_at?: Date;
//   updated_at?: Date;
// }

// const PrescriptionDetails: React.FC = () => {
//   const { appointmentid } = useParams<{ appointmentid: string }>();
//   const [prescription, setPrescription] = useState<Prescription | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const prescriptionRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const fetchPrescriptionDetails = async () => {
//       if (!appointmentid) {
//         setError('Invalid Appointment ID');
//         setLoading(false);
//         return;
//       }

//       try {
//         const data = await getPrescriptionByAppointmentId(appointmentid);
//         // Handle data coming as an array with one prescription object
//         const firstPrescription = Array.isArray(data) ? data[0] : data;

//         // Create safe prescription object, ensuring medicines array is preserved
//         const safePrescription: Prescription = {
//           _id: firstPrescription?._id || '',
//           appointment_id: firstPrescription?.appointment_id || '',
//           medicines: firstPrescription?.medicines || [],
//           notes: firstPrescription?.notes || '',
//           created_at: firstPrescription?.created_at,
//           updated_at: firstPrescription?.updated_at
//         };

//         setPrescription(safePrescription);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching prescription:', err);
//         setError(err instanceof Error ? err.message : 'An unexpected error occurred');
//         setLoading(false);
//       }
//     };

//     fetchPrescriptionDetails();
//   }, [appointmentid]);

//   const formatFrequency = (frequency: Medicine['frequency']): string => {
//     if (!frequency) return 'Not specified';

//     const times: string[] = [];
//     if (frequency.morning) times.push('Morning');
//     if (frequency.afternoon) times.push('Afternoon');
//     if (frequency.evening) times.push('Evening');
//     if (frequency.night) times.push('Night');

//     return times.length > 0 ? times.join(', ') : 'Not specified';
//   };

//   const downloadPDF = () => {
//     if (!prescriptionRef.current) return;

//     html2canvas(prescriptionRef.current, { scale: 2 }).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const imgWidth = 190;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
//       pdf.save(`Prescription_${appointmentid}.pdf`);
//     });
//   };

//   if (loading) {
//     return (
//       <div className="prescription-details-container">
//         <div className="prescription-details">
//           <div className="prescription-loading">
//             <div className="loading-spinner"></div>
//             <p>Loading prescription details...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="prescription-details-container">
//         <div className="prescription-details">
//           <div className="prescription-error">
//             <svg className="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
//               <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//               <circle cx="12" cy="17" r="1" fill="currentColor" />
//             </svg>
//             <h3>Error Loading Prescription</h3>
//             <p>{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!prescription || !Array.isArray(prescription.medicines) || prescription.medicines.length === 0) {
//     return (
//       <div className="prescription-details-container">
//         <div className="prescription-details">
//           <div className="prescription-not-found">
//             <svg className="not-found-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M9 3H15M3 7H21M19 7L18.2987 17.5193C18.1935 19.0975 16.9037 20.3 15.321 20.3H8.67901C7.09628 20.3 5.80651 19.0975 5.70132 17.5193L5 7H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//               <path d="M10 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//               <path d="M14 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//             <h3>No Prescription Found</h3>
//             <p>There is no prescription available for this appointment.</p>
//             <p className="not-found-suggestion">The doctor may not have prescribed any medications for this visit.</p>
//             <button onClick={() => window.history.back()} className="back-btn">
//               Go Back
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="prescription-details-container">
//       <div className="prescription-details" ref={prescriptionRef}>
//         <div className="prescription-header">
//           <h2>Prescription Details</h2>
//           {prescription.notes && (
//             <div className="prescription-notes">
//               <p><strong>Notes:</strong> {prescription.notes}</p>
//             </div>
//           )}
//           <div className="prescription-info">
//             <p>
//               <strong>Prescription Date:</strong>{' '}
//               {prescription.created_at
//                 ? new Date(prescription.created_at).toLocaleDateString()
//                 : 'Date not available'}
//             </p>
//           </div>
//         </div>

//         <table className="medications-table">
//           <thead>
//             <tr>
//               <th>Medication</th>
//               <th>Dosage</th>
//               <th>Frequency</th>
//               <th>Duration</th>
//               <th>Instructions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {prescription.medicines.map((medicine, index) => (
//               <tr key={index}>
//                 <td>{medicine.name || 'N/A'}</td>
//                 <td>{medicine.dosage || 'N/A'}</td>
//                 <td>{formatFrequency(medicine.frequency)}</td>
//                 <td>{medicine.duration ? `${medicine.duration} days` : 'N/A'}</td>
//                 <td>{medicine.instructions || 'No specific instructions'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <button onClick={downloadPDF} className="download-btn">
//         Download PDF
//       </button>
//     </div>
//   );
// };

// export default PrescriptionDetails;

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getPrescriptionByAppointmentId } from '../../api/userApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Prescription.scss';
import companyLogo from '../../assets/company logo.png';

interface Medicine {
  name: string;
  dosage: string;
  frequency: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  duration: number;
  instructions?: string;
}

interface Prescription {
  _id?: string;
  appointment_id: string;
  medicines: Medicine[];
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  doctor?: {
    username?: string;
    department?: string;
    clinic_name?: string;
  };
  patient?: {
    username?: string;
    age?: string;
    gender?: string;
  };
}

const PrescriptionDetails: React.FC = () => {
  const { appointmentid } = useParams<{ appointmentid: string }>();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const prescriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrescriptionDetails = async () => {
      if (!appointmentid) {
        setError('Invalid Appointment ID');
        setLoading(false);
        return;
      }

      try {
        const data = await getPrescriptionByAppointmentId(appointmentid);
        // Handle data coming as an array with one prescription object
        const firstPrescription = Array.isArray(data) ? data[0] : data;

        // Create safe prescription object, ensuring medicines array is preserved
        const safePrescription: Prescription = {
          _id: firstPrescription?._id || '',
          appointment_id: firstPrescription?.appointment_id || '',
          medicines: firstPrescription?.medicines || [],
          notes: firstPrescription?.notes || '',
          created_at: firstPrescription?.created_at,
          updated_at: firstPrescription?.updated_at,
          doctor: firstPrescription?.doctor || {},
          patient: firstPrescription?.patient || {}
        };

        setPrescription(safePrescription);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching prescription:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setLoading(false);
      }
    };

    fetchPrescriptionDetails();
  }, [appointmentid]);

  const formatFrequency = (frequency: Medicine['frequency']): string => {
    if (!frequency) return 'Not specified';

    const times: string[] = [];
    if (frequency.morning) times.push('Morning');
    if (frequency.afternoon) times.push('Afternoon');
    if (frequency.evening) times.push('Evening');
    if (frequency.night) times.push('Night');

    return times.length > 0 ? times.join(', ') : 'Not specified';
  };

  const downloadPDF = () => {
    if (!prescriptionRef.current) return;

    html2canvas(prescriptionRef.current, { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`CuraConnect_Prescription_${appointmentid}.pdf`);
    });
  };

  if (loading) {
    return (
      <div className="prescription-details-container">
        <div className="prescription-details">
          <div className="prescription-loading">
            <div className="loading-spinner"></div>
            <p>Loading prescription details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prescription-details-container">
        <div className="prescription-details">
          <div className="prescription-error">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
            </svg>
            <h3>Error Loading Prescription</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!prescription || !Array.isArray(prescription.medicines) || prescription.medicines.length === 0) {
    return (
      <div className="prescription-details-container">
        <div className="prescription-details">
          <div className="prescription-not-found">
            <svg className="not-found-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3H15M3 7H21M19 7L18.2987 17.5193C18.1935 19.0975 16.9037 20.3 15.321 20.3H8.67901C7.09628 20.3 5.80651 19.0975 5.70132 17.5193L5 7H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>No Prescription Found</h3>
            <p>There is no prescription available for this appointment.</p>
            <p className="not-found-suggestion">The doctor may not have prescribed any medications for this visit.</p>
            <button onClick={() => window.history.back()} className="back-btn">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prescription-details-container">
      <div className="prescription-pdf" ref={prescriptionRef}>
        <div className="prescription-header-container">
          <div className="company-info">
            <img src={companyLogo} alt="Cura Connect Logo" className="company-logo" />
            <div className="company-details">
              <h1 className="company-name">Cura Connect</h1>
              <p className="company-tagline">Your Health, Our Priority</p>
            </div>
          </div>
          
          <div className="rx-symbol">
            <span>℞</span>
          </div>
        </div>

        <div className="prescription-divider"></div>

        <div className="prescription-metadata">
          <div className="prescription-date">
            <p><strong>Date:</strong> {prescription.created_at
              ? new Date(prescription.created_at).toLocaleDateString()
              : new Date().toLocaleDateString()}</p>
          </div>
          <div className="prescription-id">
            <p><strong>Prescription ID:</strong> {prescription._id?.substring(0, 8) || appointmentid?.substring(0, 8)}</p>
          </div>
        </div>

        <div className="prescription-divider dashed"></div>

        <div className="patient-doctor-details">
          <div className="patient-details">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> {prescription.patient?.username || 'Not specified'}</p>
            {prescription.patient?.age && <p><strong>Age:</strong> {prescription.patient.age}</p>}
            {prescription.patient?.gender && <p><strong>Gender:</strong> {prescription.patient.gender}</p>}
          </div>
          <div className="doctor-details">
            <h3>Doctor Information</h3>
            <p><strong>Doctor:</strong> {prescription.doctor?.username || 'Not specified'}</p>
            {prescription.doctor?.department && <p><strong>Specialization:</strong> {prescription.doctor.department}</p>}
            {prescription.doctor?.clinic_name && <p><strong>Clinic:</strong> {prescription.doctor.clinic_name}</p>}
          </div>
        </div>

        <div className="prescription-divider"></div>

        <div className="medication-header">
          <h3>Prescribed Medications</h3>
        </div>

        <table className="medications-table">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map((medicine, index) => (
              <tr key={index}>
                <td>{medicine.name || 'N/A'}</td>
                <td>{medicine.dosage || 'N/A'}</td>
                <td>{formatFrequency(medicine.frequency)}</td>
                <td>{medicine.duration ? `${medicine.duration} days` : 'N/A'}</td>
                <td>{medicine.instructions || 'No specific instructions'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {prescription.notes && (
          <div className="doctor-notes">
            <h3>Doctor's Notes</h3>
            <p>{prescription.notes}</p>
          </div>
        )}

        <div className="prescription-footer">
          <div className="doctor-signature">
          </div>
          <div className="prescription-stamp">
            <p>This is a digital prescription from Cura Connect</p>
            <p>Valid for 30 days from issue date</p>
          </div>
        </div>
      </div>

      <div className="actions-container">
        <button onClick={downloadPDF} className="download-btn">
          Download Prescription
        </button>
        <button onClick={() => window.history.back()} className="back-btn">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default PrescriptionDetails;