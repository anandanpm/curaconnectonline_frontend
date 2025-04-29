
// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { submitAppointmentReview } from '../../api/userApi';
// import './Review.scss';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux/store';

// export interface ReviewSubmission {
//   appointmentid: string;
//   rating: number;
//   reviewText: string;
//   userid: string;
// }

// const RatingReview: React.FC = () => {
//   const { appointmentid } = useParams<{ appointmentid: string }>();
//   const navigate = useNavigate(); // Add navigation hook

//   const [rating, setRating] = useState<number>(0);
//   const [hover, setHover] = useState<number>(0);
//   const [review, setReview] = useState<string>('');
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [submitStatus, setSubmitStatus] = useState<{
//     success: boolean | null,
//     message: string
//   }>({ success: null, message: '' });
//   const user = useSelector((state: RootState) => state.user._id);

//   const maxRating = 5;

//   const handleRatingClick = (currentRating: number) => {
//     setRating(currentRating);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Ensure appointmentId exists
//     if (!appointmentid) {
//       setSubmitStatus({
//         success: false,
//         message: 'Appointment ID is missing'
//       });
//       return;
//     }

//     // Prepare review submission data
//     const reviewData: ReviewSubmission = {
//       appointmentid,
//       rating,
//       reviewText: review,
//       userid: user
//     };

//     setIsSubmitting(true);
//     setSubmitStatus({ success: null, message: '' });

//     try {
//       // Submit review to backend
//       await submitAppointmentReview(reviewData);

//       // Reset form
//       setRating(0);
//       setReview('');

//       // Set success status
//       setSubmitStatus({
//         success: true,
//         message: 'Review submitted successfully!'
//       });

//       // Navigate to about page after successful submission
//       navigate('/about');
//     } catch (error) {
//       // Handle error
//       console.error('Review submission failed', error);
//       setSubmitStatus({
//         success: false,
//         message: 'Failed to submit review. Please try again.'
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="rating-review-container">
//       {submitStatus.success === false && (
//         <div className="error-message">
//           {submitStatus.message}
//         </div>
//       )}
//       {submitStatus.success === true && (
//         <div className="success-message">
//           {submitStatus.message}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="rating-review-form">
//         <div className="rating-section">
//           <h3>Your Rating</h3>
//           <div className="star-rating">
//             {[...Array(maxRating)].map((_star, index) => {
//               const ratingValue = index + 1;
//               return (
//                 <span
//                   key={index}
//                   className={`star ${ratingValue <= (hover || rating) ? 'active' : ''
//                     }`}
//                   onClick={() => handleRatingClick(ratingValue)}
//                   onMouseEnter={() => setHover(ratingValue)}
//                   onMouseLeave={() => setHover(0)}
//                 >
//                   ★
//                 </span>
//               );
//             })}
//           </div>
//           <p className="rating-text">
//             {rating > 0 ? `You rated ${rating} out of ${maxRating}` : 'Please select a rating'}
//           </p>
//         </div>

//         <div className="review-section">
//           <h3>Write a Review</h3>
//           <textarea
//             className="review-textarea"
//             value={review}
//             onChange={(e) => setReview(e.target.value)}
//             placeholder="Share your thoughts about your experience..."
//             rows={4}
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           className="submit-button"
//           disabled={rating === 0 || review.trim() === '' || isSubmitting}
//         >
//           {isSubmitting ? 'Submitting...' : 'Submit Review'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default RatingReview;


import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import * as Yup from 'yup';
import { submitAppointmentReview } from '../../api/userApi';
import './Review.scss';

export interface ReviewSubmission {
  appointmentid: string;
  rating: number;
  reviewText: string;
  userid: string;
}

// Yup validation schema
const reviewSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, 'Please select a rating')
    .required('Rating is required'),
  reviewText: Yup.string()
    .min(10, 'Review must be at least 10 characters')
    .required('Review is required'),
});

const RatingReview: React.FC = () => {
  const { appointmentid } = useParams<{ appointmentid: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user._id);

  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean | null; message: string }>({
    success: null,
    message: '',
  });
  const [validationErrors, setValidationErrors] = useState<{ rating?: string; reviewText?: string }>({});

  const maxRating = 5;

  const handleRatingClick = (currentRating: number) => {
    setRating(currentRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reviewData: ReviewSubmission = {
      appointmentid: appointmentid || '',
      rating,
      reviewText: review,
      userid: user,
    };

    // Validate using Yup
    try {
      await reviewSchema.validate(reviewData, { abortEarly: false });
      setValidationErrors({});
    } catch (err: any) {
      const errors: { rating?: string; reviewText?: string } = {};
      err.inner.forEach((validationError: Yup.ValidationError) => {
        if (validationError.path && !errors[validationError.path as keyof typeof errors]) {
          errors[validationError.path as keyof typeof errors] = validationError.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ success: null, message: '' });

    try {
      await submitAppointmentReview(reviewData);
      setRating(0);
      setReview('');
      setSubmitStatus({ success: true, message: 'Review submitted successfully!' });
      setTimeout(() => navigate('/about'), 1500);
    } catch (error: any) {
      console.error('Review submission failed', error);
      setSubmitStatus({
        success: false,
        message: error?.response?.data?.message || 'Failed to submit review. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rating-review-container">
      {submitStatus.success === false && (
        <div className="error-message">{submitStatus.message}</div>
      )}
      {submitStatus.success === true && (
        <div className="success-message">{submitStatus.message}</div>
      )}

      <form onSubmit={handleSubmit} className="rating-review-form">
        <div className="rating-section">
          <h3>Your Rating</h3>
          <div className="star-rating">
            {[...Array(maxRating)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <span
                  key={index}
                  className={`star ${ratingValue <= (hover || rating) ? 'active' : ''}`}
                  onClick={() => handleRatingClick(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </span>
              );
            })}
          </div>
          {validationErrors.rating && <p className="error-text">{validationErrors.rating}</p>}
          <p className="rating-text">
            {rating > 0 ? `You rated ${rating} out of ${maxRating}` : 'Please select a rating'}
          </p>
        </div>

        <div className="review-section">
          <h3>Write a Review</h3>
          <textarea
            className="review-textarea"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your thoughts about your experience..."
            rows={4}
          />
          {validationErrors.reviewText && (
            <p className="error-text">{validationErrors.reviewText}</p>
          )}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default RatingReview;
