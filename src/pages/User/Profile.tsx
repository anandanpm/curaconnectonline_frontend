
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import {
  TextField,
  Button,
  Grid,
  Avatar,
  Box,
  CircularProgress,
  Paper,
  Snackbar,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'
import { RootState, AppDispatch } from '../../redux/store'
import { updateProfile } from '../../redux/userSlice'
import { uploadImageToCloudinary } from '../../services/Cloudinary'
import { resetPassword } from '../../api/userApi'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
}))

const StyledButton = styled(Button)(() => ({
  '&.MuiButton-containedPrimary': {
    backgroundColor: '#008080',
    '&:hover': {
      backgroundColor: '#006666',
    },
  },
  '&.MuiButton-outlinedPrimary': {
    color: '#008080',
    borderColor: '#008080',
    '&:hover': {
      borderColor: '#006666',
    },
  },
}))

const ProfileSchema = Yup.object().shape({
  userName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(10, 'Must be exactly 10 digits')
    .max(10, 'Must be exactly 10 digits')
    .required('Required'),
  age: Yup.number()
    .min(1, 'Minimum should be 1')
    .max(110, 'Maximum should be 110')
    .required('Required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .required('Required'),
  address: Yup.string()
    .min(2, 'Too Short!')
    .max(100, 'Too Long!')
    .required('Required'),
})

// Password reset validation schema
const PasswordResetSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required')
})

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.user)
  const [uploading, setUploading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [passwordResetOpen, setPasswordResetOpen] = useState(false)
  const [formValues, setFormValues] = useState({
    userName: user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    age: user.age?.toString() || '',
    gender: user.gender || '',
    address: user.address || '',
  })

  useEffect(() => {
    setFormValues({
      userName: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      age: user.age?.toString() || '',
      gender: user.gender || '',
      address: user.address || '',
    })
  }, [user])

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setPreviewImage(previewUrl)

      setUploading(true)
      try {
        const imageUrl = await uploadImageToCloudinary(file)
        console.log('Uploaded image URL:', imageUrl)

        await dispatch(updateProfile({
          username: formValues.userName,
          email: formValues.email,
          phone: formValues.phone,
          age: formValues.age,
          gender: formValues.gender,
          address: formValues.address,
          profile_pic: imageUrl,
          _id: user._id
        })).unwrap()

        setPreviewImage(imageUrl)
        setSnackbarMessage('Profile picture updated successfully')
        setSnackbarOpen(true)
      } catch (error) {
        console.error('Error uploading image:', error)
        setPreviewImage(null)
        setSnackbarMessage('Error uploading image')
        setSnackbarOpen(true)
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <StyledPaper elevation={0}>
      <Formik
        enableReinitialize
        initialValues={formValues}
        validationSchema={ProfileSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await dispatch(updateProfile({
              username: values.userName,
              email: values.email,
              phone: values.phone,
              age: values.age,
              gender: values.gender,
              address: values.address,
              _id: user._id
            })).unwrap()
            console.log('Update Profile Response:', Response);
            setSnackbarMessage('Profile updated successfully')
            setSnackbarOpen(true)
          } catch (error) {
            console.error('Failed to update profile:', error)
            setSnackbarMessage('Failed to update profile')
            setSnackbarOpen(true)
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={previewImage || user.profile_pic || "/placeholder.svg"}
                  sx={{ width: 64, height: 64 }}
                />
                <Box>
                  <Box sx={{ fontWeight: 500, mb: 1 }}>{user.username}</Box>
                  <input
                    accept="image/*"
                    type="file"
                    id="upload-photo"
                    hidden
                    onChange={handlePhotoUpload}
                  />
                  <label htmlFor="upload-photo">
                    <Button
                      component="span"
                      variant="contained"
                      size="small"
                      disabled={uploading}
                      sx={{
                        bgcolor: '#008080',
                        '&:hover': { bgcolor: '#006666' }
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload New Photo'}
                    </Button>
                  </label>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  name="userName"
                  label="User Name"
                  value={values.userName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e)
                    setFormValues(prev => ({ ...prev, userName: e.target.value }))
                  }}
                  onBlur={handleBlur}
                  error={touched.userName && Boolean(errors.userName)}
                  helperText={touched.userName && errors.userName}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="email"
                  label="Email Address"
                  value={values.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e)
                    setFormValues(prev => ({ ...prev, email: e.target.value }))
                  }}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={values.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e)
                    setFormValues(prev => ({ ...prev, phone: e.target.value }))
                  }}
                  onBlur={handleBlur}
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={touched.phone && errors.phone}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="age"
                  label="Age"
                  type="number"
                  value={values.age}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e)
                    setFormValues(prev => ({ ...prev, age: e.target.value }))
                  }}
                  onBlur={handleBlur}
                  error={touched.age && Boolean(errors.age)}
                  helperText={touched.age && errors.age}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  select
                  name="gender"
                  label="Gender"
                  value={values.gender}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e)
                    setFormValues(prev => ({ ...prev, gender: e.target.value }))
                  }}
                  onBlur={handleBlur}
                  error={touched.gender && Boolean(errors.gender)}
                  helperText={touched.gender && errors.gender}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Field>
              </Grid>

              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  multiline
                  rows={4}
                  name="address"
                  label="Address"
                  value={values.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e)
                    setFormValues(prev => ({ ...prev, address: e.target.value }))
                  }}
                  onBlur={handleBlur}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <StyledButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                </StyledButton>
                <StyledButton
                  variant="outlined"
                  color="primary"
                  onClick={() => setPasswordResetOpen(true)}
                >
                  Reset Password
                </StyledButton>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

      {/* Password Reset Modal */}
      <Dialog
        open={passwordResetOpen}
        onClose={() => setPasswordResetOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Reset Password
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setPasswordResetOpen(false)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Formik
          initialValues={{
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          }}
          validationSchema={PasswordResetSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              await resetPassword({
                userId: user._id,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
              });

              setSnackbarMessage('Password updated successfully');
              setSnackbarOpen(true);
              setPasswordResetOpen(false);
              resetForm();
            } catch (error: any) {
              if (error.response?.status === 401) {
                setSnackbarMessage('Current password is incorrect');
              } else {
                setSnackbarMessage('Failed to update password');
              }
              setSnackbarOpen(true);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit}>
              <DialogContent>
                <DialogContentText sx={{ mb: 3 }}>
                  To reset your password, please enter your current password and choose a new password.
                </DialogContentText>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      margin="dense"
                      name="oldPassword"
                      label="Current Password"
                      type="password"
                      value={values.oldPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.oldPassword && Boolean(errors.oldPassword)}
                      helperText={touched.oldPassword && errors.oldPassword}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      margin="dense"
                      name="newPassword"
                      label="New Password"
                      type="password"
                      value={values.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.newPassword && Boolean(errors.newPassword)}
                      helperText={touched.newPassword && errors.newPassword}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      margin="dense"
                      name="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                <Button
                  onClick={() => setPasswordResetOpen(false)}
                  color="primary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{
                    bgcolor: '#008080',
                    '&:hover': { bgcolor: '#006666' }
                  }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Update Password'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </StyledPaper>
  )
}
