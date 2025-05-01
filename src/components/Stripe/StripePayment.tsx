

import type React from "react"
import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { createPaymentIntent } from "../../api/userApi"
import "./StripePayment.scss"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { useNavigate } from "react-router-dom"

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_API_KEY
)

interface PaymentFormProps {
  amount: number
  userId: string
  slotId: string
  onSuccess: (paymentIntentId: string) => void
  onCancel: () => void
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const user = useSelector((state: RootState) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const { clientSecret } = await createPaymentIntent(user._id, amount)
        setClientSecret(clientSecret)
      } catch (err) {
        setError("Failed to initialize payment. Please try again.")
      }
    }

    fetchClientSecret()
  }, [amount, user._id])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    if (cardElement) {
      try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        })

        if (error) {
          setError(error.message || "Payment failed")
        } else if (paymentIntent.status === "succeeded") {
          onSuccess(paymentIntent.id)
          navigate("/appointment-success")
        }
      } catch (err) {
        setError("An unexpected error occurred")
      } finally {
        setProcessing(false)
      }
    }
  }

  if (!clientSecret) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="stripe-payment-modal">
      <div className="stripe-payment-content">
        <h2>Complete Your Payment</h2>
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-row">
            <label htmlFor="card-element">Credit or debit card</label>
            <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="amount-display">
            <span>Total Amount:</span>
            <span className="amount">${amount.toFixed(2)}</span>
          </div>

          <div className="button-container">
            <button type="submit" disabled={!stripe || processing || !clientSecret} className="submit-button">
              {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
            </button>
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const StripePayment: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}

export default StripePayment

