
import * as React from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { resetforgottenPassword, sendOtp, verifyOtp } from '../../api/userApi';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
  Link,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import './forgottenPassword.scss'

// Validation schemas
const emailSchema = Yup.object().shape({
  email: Yup.string().email("Please enter a valid email").required("Email is required"),
})

const otpSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{4}$/, "OTP must be 4 digits")
    .required("OTP is required"),
})

const passwordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase and number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
})

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = React.useState(1)
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [timer, setTimer] = React.useState(0)
  const [timerActive, setTimerActive] = React.useState(false)

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, timerActive]);

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startTimer = () => {
    setTimer(60); // 1 minute timer
    setTimerActive(true);
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const result = await sendOtp(email);
      console.log("OTP resent:", result);
      startTimer();
    } catch (error) {
      console.error("Error resending OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true)
        // Replace with your API call
        let result = await sendOtp(values.email)
        console.log(result)
        setEmail(values.email)
        setStep(2)
        startTimer();
      } catch (error) {
        console.error("Error sending OTP:", error)
      } finally {
        setLoading(false)
      }
    },
  })

  const otpForm = useFormik({
    initialValues: { otp: "" },
    validationSchema: otpSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true)
        // Replace with your API call
        const result = await verifyOtp(email, values.otp)
        console.log(result)
        setStep(3)
      } catch (error) {
        console.error("Error verifying OTP:", error)
      } finally {
        setLoading(false)
      }
    },
  })

  const passwordForm = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true)
        let result = await resetforgottenPassword(email, values.password)
        console.log(result)
        onClose()
      } catch (error) {
        console.error("Error resetting password:", error)
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "Reset Password"}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {step === 1 && (
          <>
            <DialogContentText sx={{ mb: 3 }}>
              Enter your email address to receive a verification code
            </DialogContentText>
            <Box component="form" onSubmit={emailForm.handleSubmit} noValidate>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                variant="outlined"
                margin="normal"
                value={emailForm.values.email}
                onChange={emailForm.handleChange}
                onBlur={emailForm.handleBlur}
                error={emailForm.touched.email && Boolean(emailForm.errors.email)}
                helperText={emailForm.touched.email && emailForm.errors.email}
              />
              <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2 }}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </Box>
          </>
        )}

        {step === 2 && (
          <Box component="form" onSubmit={otpForm.handleSubmit} noValidate>
            <DialogContentText sx={{ mb: 2 }}>
              A verification code has been sent to your email
            </DialogContentText>
            <TextField
              fullWidth
              id="otp"
              name="otp"
              label="OTP"
              type="text"
              variant="outlined"
              margin="normal"
              inputProps={{ maxLength: 4 }}
              value={otpForm.values.otp}
              onChange={otpForm.handleChange}
              onBlur={otpForm.handleBlur}
              error={otpForm.touched.otp && Boolean(otpForm.errors.otp)}
              helperText={otpForm.touched.otp && otpForm.errors.otp}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {timerActive ? `Resend in ${formatTime(timer)}` : ''}
              </Typography>
              <Link
                component="button"
                variant="body2"
                onClick={() => !timerActive && handleResendOtp()}
                disabled={timerActive || loading}
                underline="hover"
                sx={{
                  cursor: timerActive ? 'default' : 'pointer',
                  color: timerActive ? 'text.disabled' : 'primary.main',
                }}
              >
                Resend OTP
              </Link>
            </Box>

            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2 }}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </Box>
        )}

        {step === 3 && (
          <Box component="form" onSubmit={passwordForm.handleSubmit} noValidate>
            <TextField
              fullWidth
              id="password"
              name="password"
              label="New Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={passwordForm.values.password}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              error={passwordForm.touched.password && Boolean(passwordForm.errors.password)}
              helperText={passwordForm.touched.password && passwordForm.errors.password}
            />
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={passwordForm.values.confirmPassword}
              onChange={passwordForm.handleChange}
              onBlur={passwordForm.handleBlur}
              error={passwordForm.touched.confirmPassword && Boolean(passwordForm.errors.confirmPassword)}
              helperText={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword}
            />
            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2 }}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}