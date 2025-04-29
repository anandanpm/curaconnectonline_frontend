


import React, { useState, useEffect } from 'react'
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
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { RootState, AppDispatch } from '../../redux/store'
import { updateDoctorProfile } from '../../redux/doctorSlice'
import { uploadImageToCloudinary } from '../../services/Cloudinary'
import { resetDoctorPassword } from '../../api/doctorApi';
import './DoctorProfile.scss'




const ProfileSchema = Yup.object().shape({
  userName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().matches(/^[0-9]+$/, 'Must be only digits').min(10, 'Must be exactly 10 digits').max(10, 'Must be exactly 10 digits').required('Required'),
  age: Yup.number().min(1, 'Minimum should be 1').max(110, 'Maximum should be 110').required('Required'),
  gender: Yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender').required('Required'),
  address: Yup.string().min(2, 'Too Short!').max(500, 'Too Long!').required('Required'),
  clinic_name: Yup.string().min(2, 'Too Short!').max(100, 'Too Long!'),
  about: Yup.string().max(10000, 'Too Long!'),
  education: Yup.string().max(200, 'Too Long!'),
  experience: Yup.string().max(200, 'Too Long!'),
  medical_license: Yup.string().max(50, 'Too Long!'),
  department: Yup.string().max(50, 'Too Long!'),
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

export default function DoctorProfile() {
  const dispatch = useDispatch<AppDispatch>()
  const doctor = useSelector((state: RootState) => state.doctor)
  const [uploading, setUploading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const [passwordResetOpen, setPasswordResetOpen] = useState(false)

  const initialValues = {
    userName: doctor.username || '',
    email: doctor.email || '',
    phone: doctor.phone || '',
    age: doctor.age || '',
    gender: doctor.gender || '',
    address: doctor.address || '',
    clinic_name: doctor.clinic_name || '',
    about: doctor.about || '',
    education: doctor.education || '',
    experience: doctor.experience || '',
    medical_license: doctor.medical_license || '',
    department: doctor.department || '',
  }

  useEffect(() => {
    setProfileImageUrl(doctor.profile_pic || null)
    setCertificateUrl(doctor.certification || null)
  }, [doctor])

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploading(true)
      try {
        const imageUrl = await uploadImageToCloudinary(file)

        if (field === 'profile_pic') {
          setProfileImageUrl(imageUrl)
        } else if (field === 'certification') {
          setCertificateUrl(imageUrl)
        }

        setSnackbarMessage(`${field} uploaded successfully`)
        setSnackbarOpen(true)
      } catch (error) {
        console.error(`Error uploading ${field}:`, error)
        setSnackbarMessage(`Error uploading ${field}`)
        setSnackbarOpen(true)
      } finally {
        setUploading(false)
      }
    }
  }

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const updateData = {
        ...values,
        _id: doctor._id,
        profile_pic: profileImageUrl,
        certification: certificateUrl,
        username: values.userName // Map userName to username for backend
      }

      console.log('Submitting data:', updateData)
      const result = await dispatch(updateDoctorProfile(updateData)).unwrap()
      console.log('Update result:', result)

      setSnackbarMessage('Profile updated successfully')
      setSnackbarOpen(true)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setSnackbarMessage('Failed to update profile')
      setSnackbarOpen(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Paper elevation={0} className="profile-container">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ProfileSchema}
        onSubmit={handleSubmit}
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
            <div className='profile-header'>
              <Avatar
                src={profileImageUrl || "/placeholder.svg"}
                className='profile-avatar'
              />
              <h2 className='profile-title'>{doctor.username}</h2>
              <input
                accept="image/*"
                type="file"
                id="upload-photo"
                hidden
                onChange={(event) => handlePhotoUpload(event, 'profile_pic')}
              />
              <label htmlFor="upload-photo">
                <Button
                  component="span"
                  variant="contained"
                  size="small"
                  disabled={uploading}
                  className='submit-button'
                >
                  {uploading ? 'Uploading...' : 'Upload New Photo'}
                </Button>
              </label>
            </div>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  name="userName"
                  label="User Name"
                  value={values.userName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.userName && Boolean(errors.userName)}
                  helperText={touched.userName && errors.userName}
                  className='MuiTextField-root'
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="email"
                  label="Email Address"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  className='MuiTextField-root'
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={touched.phone && errors.phone}
                  className='MuiTextField-root'
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
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.age && Boolean(errors.age)}
                  helperText={touched.age && errors.age}
                  className='MuiTextField-root'
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
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.gender && Boolean(errors.gender)}
                  helperText={touched.gender && errors.gender}
                  className='MuiTextField-root'
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
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                  className='MuiTextField-root'
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  name="clinic_name"
                  label="Clinic Name"
                  value={values.clinic_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.clinic_name && Boolean(errors.clinic_name)}
                  helperText={touched.clinic_name && errors.clinic_name}
                  className='MuiTextField-root'
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  multiline
                  rows={4}
                  name="about"
                  label="About"
                  value={values.about}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.about && Boolean(errors.about)}
                  helperText={touched.about && errors.about}
                  className='MuiTextField-root'
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  multiline
                  rows={2}
                  name="education"
                  label="Education"
                  value={values.education}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.education && Boolean(errors.education)}
                  helperText={touched.education && errors.education}
                  className='MuiTextField-root'
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  multiline
                  rows={2}
                  name="experience"
                  label="Experience"
                  value={values.experience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.experience && Boolean(errors.experience)}
                  helperText={touched.experience && errors.experience}
                  className='MuiTextField-root'
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="medical_license"
                  label="Medical License"
                  value={values.medical_license}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.medical_license && Boolean(errors.medical_license)}
                  helperText={touched.medical_license && errors.medical_license}
                  className='MuiTextField-root'
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="department"
                  label="Department"
                  value={values.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.department && Boolean(errors.department)}
                  helperText={touched.department && errors.department}
                  className='MuiTextField-root'
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography>Certification</Typography>
                  <input
                    accept="image/*,application/pdf"
                    type="file"
                    id="upload-certificate"
                    hidden
                    onChange={(event) => handlePhotoUpload(event, 'certification')}
                  />
                  <label htmlFor="upload-certificate">
                    <Button
                      component="span"
                      variant="contained"
                      size="small"
                      disabled={uploading}
                      className='submit-button'
                    >
                      {uploading ? 'Uploading...' : 'Upload Certificate'}
                    </Button>
                  </label>
                </Box>

                {certificateUrl && (
                  <Box className='certificate-preview' mb={2}>
                    <img
                      src={certificateUrl}
                      alt="Certificate"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} className='form-actions'>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  className='submit-button'
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  className='reset-button'
                  onClick={() => {
                    console.log('Reset Password button clicked');
                    setPasswordResetOpen(true);
                  }}
                >
                  Reset Password
                </Button>
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
        className="password-reset-dialog"
      >
        <DialogTitle className="dialog-title">
          Reset Password
          <IconButton
            aria-label="close"
            onClick={() => setPasswordResetOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
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
              // Call the API to reset password
              await resetDoctorPassword({
                doctorId: doctor._id,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
              });

              setSnackbarMessage('Password updated successfully');
              setSnackbarOpen(true);
              setPasswordResetOpen(false);
              resetForm();
            } catch (error: any) {
              console.error('Password reset error:', error);
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
              <DialogContent className="dialog-content">
                <DialogContentText className="dialog-text">
                  To reset your password, please enter your current password and choose a new secure password.
                </DialogContentText>

                <Grid container spacing={2} className="password-form-container">
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
                      className="password-field"
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
                      className="password-field"
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
                      className="password-field"
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions className="dialog-actions">
                <Button
                  onClick={() => setPasswordResetOpen(false)}
                  color="primary"
                  className="cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  className="update-password-button"
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
    </Paper>
  )
}
