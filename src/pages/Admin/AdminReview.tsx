import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchReviews } from "../../redux/adminSlice"
import type { AppDispatch, RootState } from "../../redux/store"
import { ChevronLeft, ChevronRight, Star, StarHalf } from "lucide-react"
import "./AdminReview.scss"

// Interface updated to match the actual backend response
interface ReviewResponse {
  reviewId: string
  appointmentId: any
  doctorName: string
  doctorProfileImage: string
  patientName: string
  patientEmail: string
  rating: number
  reviewText: string
  createdAt: string
}

const ReviewList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const { loading, error } = useSelector((state: RootState) => state.admin)
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewsPerPage] = useState(8)

  useEffect(() => {
    const fetchData = async () => {
      const data = await dispatch(fetchReviews())
      console.log(data.payload, 'is the data coming or not')
      setReviews(data.payload)
    }
    fetchData()
  }, [dispatch])

  // Get current reviews
  const indexOfLastReview = currentPage * reviewsPerPage
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="review-list__star filled" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="review-list__star half-filled" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="review-list__star empty" />)
    }

    return stars
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  if (loading) return <div className="review-list__loading">Loading...</div>
  if (error) return <div className="review-list__error">{error}</div>

  return (
    <div className="review-list">
      <h2 className="review-list__title">Patient Reviews</h2>
      <div className="review-list__container">
        {currentReviews.map((review) => (
          <div key={review.reviewId} className="review-list__card">
            <div className="review-list__header">
              <div className="review-list__doctor">
                <img
                  src={review.doctorProfileImage || "/placeholder.svg?height=40&width=40"}
                  alt={`${review.doctorName}'s profile`}
                  className="review-list__profile-pic"
                />
                <div className="review-list__info">
                  <h3>Dr. {review.doctorName}</h3>
                  <div className="review-list__rating">
                    {renderStars(review.rating)}
                    <span className="review-list__rating-number">{review.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="review-list__patient">
                <span>Reviewed by:</span>
                <div className="review-list__patient-info">
                  <span>{review.patientName}</span>
                </div>
                <span className="review-list__date">{formatDate(review.createdAt)}</span>
              </div>
            </div>
            <div className="review-list__content">
              <p className="review-list__text">{review.reviewText}</p>
            </div>
          </div>
        ))}
      </div>
      {reviews.length > reviewsPerPage && (
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination__btn"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: Math.ceil(reviews.length / reviewsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`pagination__btn ${currentPage === i + 1 ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(reviews.length / reviewsPerPage)}
            className="pagination__btn"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewList