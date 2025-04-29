
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Snackbar,
  Alert,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { createPrescription } from "../../api/doctorApi";
import * as yup from 'yup';
import './DocPrescription.scss';

// Updated interface to match backend schema
export interface PrescriptionData {
  appointment_id: string;
  medicines: {
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
  }[];
  notes?: string;
}

interface MedicineEntry {
  id: number;
  name: string;
  dosage: string;
  frequency: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  duration: number;
  instructions: string;
}

// Fixed the ValidationErrors interface to properly type the errors
interface ValidationErrors {
  medicines: {
    [key: number]: {
      name?: string;
      dosage?: string;
      frequency?: string;
      duration?: string;
      instructions?: string;
    }
  };
  general?: string;
}

// Validation Schema
const medicineSchema = yup.object().shape({
  name: yup.string().required('Medicine name is required'),
  dosage: yup.string().required('Dosage is required'),
  frequency: yup.object({
    morning: yup.boolean().required(),
    afternoon: yup.boolean().required(),
    evening: yup.boolean().required(),
    night: yup.boolean().required(),
  }).test(
    'at-least-one-frequency',
    'Select at least one time of day',
    (value) => {
      if (!value) return false;
      return value.morning || value.afternoon || value.evening || value.night;
    }
  ),
  duration: yup.number().min(1, 'Duration must be at least 1 day').required('Duration is required'),
  instructions: yup.string()
});

const prescriptionSchema = yup.object().shape({
  medicines: yup.array().of(medicineSchema).min(1, 'Add at least one medicine'),
  notes: yup.string()
});

// Styled Components
const PrescriptionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
}));

const FormHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 600,
  color: theme.palette.primary.main,
}));

const PrescriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();

  const [medicines, setMedicines] = useState<MedicineEntry[]>([
    {
      id: 1,
      name: '',
      dosage: '',
      frequency: {
        morning: false,
        afternoon: false,
        evening: false,
        night: false
      },
      duration: 1,
      instructions: ''
    }
  ]);

  const [notes, setNotes] = useState<string>('');
  // Initialize with empty object for medicines errors
  const [errors, setErrors] = useState<ValidationErrors>({ medicines: {} });

  // State for handling API response and errors
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMedicineEntry = () => {
    const newId = medicines.length > 0
      ? Math.max(...medicines.map(m => m.id)) + 1
      : 1;
    setMedicines([
      ...medicines,
      {
        id: newId,
        name: '',
        dosage: '',
        frequency: {
          morning: false,
          afternoon: false,
          evening: false,
          night: false
        },
        duration: 1,
        instructions: ''
      }
    ]);
  };

  const updateMedicineEntry = (id: number, field: keyof MedicineEntry, value: any) => {
    setMedicines(medicines.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ));

    // Clear related error when field is updated
    if (errors.medicines[id] && errors.medicines[id][field as keyof typeof errors.medicines[typeof id]]) {
      setErrors(prev => ({
        ...prev,
        medicines: {
          ...prev.medicines,
          [id]: {
            ...prev.medicines[id],
            [field]: undefined
          }
        }
      }));
    }
  };

  const updateMedicineFrequency = (id: number, frequencyField: keyof MedicineEntry['frequency']) => {
    setMedicines(medicines.map(med =>
      med.id === id
        ? {
          ...med,
          frequency: {
            ...med.frequency,
            [frequencyField]: !med.frequency[frequencyField]
          }
        }
        : med
    ));

    // Clear frequency error when any frequency option is selected
    if (errors.medicines[id] && errors.medicines[id].frequency) {
      setErrors(prev => ({
        ...prev,
        medicines: {
          ...prev.medicines,
          [id]: {
            ...prev.medicines[id],
            frequency: undefined
          }
        }
      }));
    }
  };

  const removeMedicineEntry = (id: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(med => med.id !== id));

      // Remove errors for the deleted medicine
      const updatedErrors = { ...errors };
      delete updatedErrors.medicines[id];
      setErrors(updatedErrors);
    }
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      await prescriptionSchema.validate({
        medicines,
        notes
      }, { abortEarly: false });

      setErrors({ medicines: {} });
      return true;
    } catch (yupError) {
      if (yupError instanceof yup.ValidationError) {
        const newErrors: ValidationErrors = { medicines: {} };

        yupError.inner.forEach(err => {
          const path = err.path;

          if (path) {
            if (path.startsWith('medicines[')) {
              // Extract medicine index and field name
              const matches = path.match(/medicines\[(\d+)]\.(.+)/);
              if (matches && matches.length === 3) {
                const index = parseInt(matches[1]);
                const medicineId = medicines[index].id;
                const field = matches[2];

                if (!newErrors.medicines[medicineId]) {
                  newErrors.medicines[medicineId] = {};
                }

                // Type-safe assignment of error message
                if (field === 'name' || field === 'dosage' || field === 'frequency' ||
                  field === 'duration' || field === 'instructions') {
                  newErrors.medicines[medicineId][field] = err.message;
                }
              }
            } else {
              newErrors.general = err.message;
            }
          }
        });

        setErrors(newErrors);
      }

      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointmentId) {
      setSnackbarMessage('Missing appointment details');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Validate form using Yup
    const isValid = await validateForm();

    if (!isValid) {
      setSnackbarMessage('Please fix all validation errors');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Prepare prescription data
    const prescriptionData: PrescriptionData = {
      appointment_id: appointmentId,
      medicines: medicines.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions
      })),
      notes: notes
    };

    try {
      setIsSubmitting(true);
      // Call API to create prescription
      await createPrescription(prescriptionData);

      // Show success message
      setSnackbarMessage('Prescription created successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      // Navigate back to patient list or appointments
      setTimeout(() => {
        navigate('/doctor/patient');
      }, 1500);
    } catch (error: any) {
      // Handle API error
      const errorMessage = error.response?.data?.message || 'Failed to create prescription. Please try again.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Type-safe helper function to get error messages
  const getError = (medicineId: number, field: keyof ValidationErrors['medicines'][number]): string | undefined => {
    return errors.medicines[medicineId] ? errors.medicines[medicineId][field] : undefined;
  };

  return (
    <Box
      className="prescription-page"
      sx={{
        flexGrow: 1,
        padding: 3,
        backgroundColor: '#f4f6f8',
        minHeight: '100vh'
      }}
    >
      <PrescriptionPaper
        className="prescription-page__paper"
        elevation={3}
      >
        <FormHeader
          className="prescription-page__header"
          variant="h4"
          align="center"
        >
          Create Prescription
        </FormHeader>

        <form onSubmit={handleSubmit}>
          {medicines.map((medicine) => (
            <Grid
              container
              spacing={2}
              key={medicine.id}
              className="prescription-page__medicine-entry"
              sx={{
                marginBottom: 2,
                backgroundColor: 'white',
                padding: 2,
                borderRadius: 2
              }}
            >
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Medicine Name"
                  variant="outlined"
                  value={medicine.name}
                  onChange={(e) => updateMedicineEntry(medicine.id, 'name', e.target.value)}
                  required
                  className="prescription-input__field"
                  error={Boolean(getError(medicine.id, 'name'))}
                  helperText={getError(medicine.id, 'name')}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Dosage"
                  variant="outlined"
                  value={medicine.dosage}
                  onChange={(e) => updateMedicineEntry(medicine.id, 'dosage', e.target.value)}
                  required
                  className="prescription-input__field"
                  error={Boolean(getError(medicine.id, 'dosage'))}
                  helperText={getError(medicine.id, 'dosage')}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Duration (Days)"
                  variant="outlined"
                  value={medicine.duration}
                  onChange={(e) => updateMedicineEntry(medicine.id, 'duration', Number(e.target.value))}
                  required
                  className="prescription-input__field"
                  error={Boolean(getError(medicine.id, 'duration'))}
                  helperText={getError(medicine.id, 'duration')}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 30].map((days) => (
                    <MenuItem key={days} value={days}>
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  className="prescription-page__time-buttons"
                >
                  <Button
                    variant={medicine.frequency.morning ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => updateMedicineFrequency(medicine.id, 'morning')}
                  >
                    Morning
                  </Button>
                  <Button
                    variant={medicine.frequency.afternoon ? "contained" : "outlined"}
                    color="secondary"
                    onClick={() => updateMedicineFrequency(medicine.id, 'afternoon')}
                  >
                    Afternoon
                  </Button>
                  <Button
                    variant={medicine.frequency.evening ? "contained" : "outlined"}
                    color="error"
                    onClick={() => updateMedicineFrequency(medicine.id, 'evening')}
                  >
                    Evening
                  </Button>
                  <Button
                    variant={medicine.frequency.night ? "contained" : "outlined"}
                    color="info"
                    onClick={() => updateMedicineFrequency(medicine.id, 'night')}
                  >
                    Night
                  </Button>
                  {medicines.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeMedicineEntry(medicine.id)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
                {getError(medicine.id, 'frequency') && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    {getError(medicine.id, 'frequency')}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Instructions"
                  variant="outlined"
                  multiline
                  rows={2}
                  value={medicine.instructions}
                  onChange={(e) => updateMedicineEntry(medicine.id, 'instructions', e.target.value)}
                  className="prescription-input__field"
                  placeholder="Any specific instructions for this medicine"
                  error={Boolean(getError(medicine.id, 'instructions'))}
                  helperText={getError(medicine.id, 'instructions')}
                />
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12} sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              label="Prescription Notes"
              variant="outlined"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="prescription-input__field"
              placeholder="Additional notes for the prescription"
            />
          </Grid>

          {errors.general && (
            <Typography
              color="error"
              variant="body2"
              sx={{ mb: 2 }}
            >
              {errors.general}
            </Typography>
          )}

          <Box
            className="prescription-page__actions"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 2
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={addMedicineEntry}
            >
              Add Medicine
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Prescription'}
            </Button>
          </Box>
        </form>
      </PrescriptionPaper>

      {/* Snackbar for feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        className="prescription-snackbar"
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PrescriptionPage;