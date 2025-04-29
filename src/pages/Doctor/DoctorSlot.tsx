
// import type React from "react"
// import { useState, useEffect } from "react"
// import { useSelector, useDispatch } from "react-redux"
// import dayjs from "dayjs"
// import { RRule, Frequency } from "rrule"
// import {
//   Container,
//   Typography,
//   Button,
//   Card,
//   CardContent,
//   CardHeader,
//   List,
//   ListItem,
//   ListItemText,
//   IconButton,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Snackbar,
//   Alert,
//   CircularProgress,
//   Box,
//   Fade,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   type SelectChangeEvent,
// } from "@mui/material"
// import { LocalizationProvider } from "@mui/x-date-pickers"
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
// import { DatePicker } from "@mui/x-date-pickers/DatePicker"
// import { TimePicker } from "@mui/x-date-pickers/TimePicker"
// import DeleteIcon from "@mui/icons-material/Delete"
// import AddIcon from "@mui/icons-material/Add"
// import SaveIcon from "@mui/icons-material/Save"
// import { createDoctorSlots, fetchSlots } from "../../redux/doctorSlice"
// import type { AppDispatch } from "../../redux/store"
// import './DoctorSlot.scss'

// interface Slot {
//   _id?: string
//   doctor_id: string
//   day: string
//   start_time: string
//   end_time: string
//   status: "available" | "booked"
//   recurrence?: string
//   created_at?: Date
//   updated_at?: Date
// }

// interface RootState {
//   doctor: {
//     _id: string
//     loading: boolean
//     error: string | null
//   }
// }

// const DoctorAppointmentPage: React.FC = () => {
//   const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
//   const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null)
//   const [newSlots, setNewSlots] = useState<Slot[]>([])
//   const [fetchedSlots, setFetchedSlots] = useState<Slot[]>([])
//   const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
//   const [errorMessage, setErrorMessage] = useState<string | null>(null)
//   const [backendResponse, setBackendResponse] = useState<{ message: string; result: Slot | null }>({
//     message: "",
//     result: null,
//   })
//   const [recurrence, setRecurrence] = useState<string>("none")

//   const dispatch = useDispatch<AppDispatch>()
//   const { _id: doctorId, loading, error } = useSelector((state: RootState) => state.doctor)

//   useEffect(() => {
//     const getSlots = async () => {
//       if (doctorId) {
//         try {
//           const response = await dispatch(fetchSlots(doctorId)).unwrap()
//           if (response && response.data && Array.isArray(response.data)) {
//             setFetchedSlots(response.data)
//           } else {
//             console.error("Unexpected response format:", response)
//             setErrorMessage("Unexpected response format from server")
//           }
//         } catch (error) {
//           console.error("Error fetching slots:", error)
//           setErrorMessage("Failed to fetch slots. Please try again.")
//         }
//       }
//     }
//     getSlots()
//   }, [doctorId, dispatch])

//   const generateRecurringSlots = (baseSlot: Slot): Slot[] => {
//     if (recurrence === "none") return [baseSlot]

//     const startDate = dayjs(baseSlot.day)
//     const [freq, interval] = recurrence.split("-")

//     // Updated to use the Frequency enum
//     const rruleOptions: Partial<any> = {
//       freq: Frequency[freq as keyof typeof Frequency],
//       interval: Number.parseInt(interval, 10),
//       dtstart: startDate.toDate(),
//       count: 52, // Generate slots for up to a year
//     }

//     const rule = new RRule(rruleOptions)
//     const dates = rule.all()

//     return dates.map((date) => ({
//       ...baseSlot,
//       day: dayjs(date).format("YYYY-MM-DD"),
//       recurrence: rule.toString(),
//     }))
//   }

//   const handleDateChange = (date: dayjs.Dayjs | null) => {
//     setSelectedDate(date)
//   }

//   const handleStartTimeChange = (time: dayjs.Dayjs | null) => {
//     setStartTime(time)
//   }

//   const handleRecurrenceChange = (event: SelectChangeEvent<string>) => {
//     setRecurrence(event.target.value)
//   }

//   const handleAddSlot = () => {
//     if (selectedDate && startTime) {
//       const now = dayjs()
//       const selectedDateTime = dayjs(`${selectedDate.format("YYYY-MM-DD")} ${startTime.format("HH:mm")}`)

//       if (selectedDateTime.isBefore(now)) {
//         setErrorMessage("Cannot create a slot in the past. Please select a future date and time.")
//         return
//       }

//       const endTime = startTime.add(1, "hour")
//       const baseSlot: Slot = {
//         doctor_id: doctorId,
//         day: selectedDate.format("YYYY-MM-DD"),
//         start_time: startTime.format("HH:mm"),
//         end_time: endTime.format("HH:mm"),
//         status: "available",
//       }

//       const recurringSlots = generateRecurringSlots(baseSlot)
//       const hasOverlap = recurringSlots.some((newSlot) => {
//         const isDuplicateInNew = [...newSlots, ...fetchedSlots].some(
//           (slot) =>
//             slot.day === newSlot.day &&
//             ((slot.start_time <= newSlot.start_time && newSlot.start_time < slot.end_time) ||
//               (slot.start_time < newSlot.end_time && newSlot.end_time <= slot.end_time) ||
//               (newSlot.start_time <= slot.start_time && slot.end_time <= newSlot.end_time)),
//         )

//         return isDuplicateInNew
//       })

//       if (hasOverlap) {
//         setErrorMessage(
//           "One or more recurring slots overlap with existing slots. Please choose different times or recurrence options.",
//         )
//       } else {
//         setNewSlots([...newSlots, ...recurringSlots])
//         setStartTime(null)
//         setErrorMessage(null)
//       }
//     }
//   }

//   const handleDeleteSlot = (index: number) => {
//     const updatedSlots = newSlots.filter((_, i) => i !== index)
//     setNewSlots(updatedSlots)
//   }

//   const handleSaveSlots = () => {
//     setOpenConfirmDialog(true)
//   }

//   const handleConfirmSave = async () => {
//     try {
//       const responses = await Promise.all(newSlots.map((slot) => dispatch(createDoctorSlots(slot))))
//       const lastResponse = responses[responses.length - 1]
//       if (lastResponse && lastResponse.payload) {
//         setBackendResponse(lastResponse.payload as { message: string; result: Slot | null })
//       }
//       setOpenConfirmDialog(false)
//       setNewSlots([])

//       if (doctorId) {
//         const response = await dispatch(fetchSlots(doctorId)).unwrap()
//         if (response && response.data && Array.isArray(response.data)) {
//           setFetchedSlots(response.data)
//         } else {
//           console.error("Unexpected response format after save:", response)
//           setErrorMessage("Unexpected response format from server after save")
//         }
//       }
//     } catch (error) {
//       console.error("Error saving slots:", error)
//       setErrorMessage("Failed to save slots. Please try again.")
//     }
//   }

//   const formatTime = (time: string) => {
//     return dayjs(time, "HH:mm").format("h:mm A")
//   }

//   const formatRecurrence = (recurrence: string): string => {
//     if (recurrence === "none") return "No recurrence"
//     const rule = RRule.fromString(recurrence)
//     return rule.toText()
//   }

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
//         <CircularProgress size={60} thickness={4} />
//       </Box>
//     )
//   }

//   if (error) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
//         <Typography color="error" variant="h5">
//           Error: {error}
//         </Typography>
//       </Box>
//     )
//   }

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Container maxWidth="lg" className="appointment-page">
//         <Typography variant="h3" className="page-title" gutterBottom>
//           Manage Appointment Slots
//         </Typography>
//         <Box className="content-wrapper">
//           <Card className="appointment-card create-slot-card">
//             <CardHeader title={<Typography variant="h5">Create New Slot</Typography>} className="card-header" />
//             <CardContent className="card-content">
//               <Box className="form-container">
//                 <DatePicker
//                   label="Select Date"
//                   value={selectedDate}
//                   onChange={handleDateChange}
//                   disablePast
//                   slotProps={{ textField: { fullWidth: true, className: "date-picker" } }}
//                 />
//                 <TimePicker
//                   label="Start Time"
//                   value={startTime}
//                   onChange={handleStartTimeChange}
//                   slotProps={{ textField: { fullWidth: true, className: "time-picker" } }}
//                 />
//                 <FormControl fullWidth>
//                   <InputLabel>Recurrence</InputLabel>
//                   <Select value={recurrence} onChange={handleRecurrenceChange} label="Recurrence">
//                     <MenuItem value="none">No recurrence</MenuItem>
//                     <MenuItem value="DAILY-1">Daily</MenuItem>
//                     <MenuItem value="WEEKLY-1">Weekly</MenuItem>
//                     <MenuItem value="WEEKLY-2">Every 2 weeks</MenuItem>
//                     <MenuItem value="MONTHLY-1">Monthly</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={handleAddSlot}
//                   disabled={!selectedDate || !startTime}
//                   fullWidth
//                   className="add-slot-button"
//                   startIcon={<AddIcon />}
//                 >
//                   Add Slot
//                 </Button>
//               </Box>
//             </CardContent>
//           </Card>

//           <Box className="slots-container">
//             <Card className="appointment-card slots-list-card">
//               <CardHeader title={<Typography variant="h5">Existing Slots</Typography>} className="card-header" />
//               <CardContent className="card-content">
//                 {fetchedSlots.length > 0 ? (
//                   <List className="slots-list">
//                     {fetchedSlots.map((slot) => (
//                       <Fade in={true} key={slot._id}>
//                         <ListItem className="slot-item">
//                           <ListItemText
//                             primary={`${slot.day} | ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}
//                             secondary={`Status: ${slot.status}${slot.recurrence ? ` | ${formatRecurrence(slot.recurrence)}` : ""}`}
//                             className="slot-text"
//                           />
//                         </ListItem>
//                       </Fade>
//                     ))}
//                   </List>
//                 ) : (
//                   <Typography variant="body1" align="center" className="no-slots-message">
//                     No slots have been created yet.
//                   </Typography>
//                 )}
//               </CardContent>
//             </Card>

//             <Card className="appointment-card slots-list-card">
//               <CardHeader title={<Typography variant="h5">New Slots</Typography>} className="card-header" />
//               <CardContent className="card-content">
//                 <List className="slots-list">
//                   {newSlots.map((slot, index) => (
//                     <Fade in={true} key={index}>
//                       <ListItem
//                         className="slot-item"
//                         secondaryAction={
//                           <IconButton
//                             edge="end"
//                             aria-label="delete"
//                             onClick={() => handleDeleteSlot(index)}
//                             className="delete-button"
//                           >
//                             <DeleteIcon />
//                           </IconButton>
//                         }
//                       >
//                         <ListItemText
//                           primary={`${slot.day} | ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}
//                           secondary={slot.recurrence ? formatRecurrence(slot.recurrence) : "No recurrence"}
//                           className="slot-text"
//                         />
//                       </ListItem>
//                     </Fade>
//                   ))}
//                 </List>
//               </CardContent>
//             </Card>
//           </Box>

//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleSaveSlots}
//             disabled={newSlots.length === 0}
//             fullWidth
//             className="save-slots-button"
//             startIcon={<SaveIcon />}
//           >
//             Save Slots
//           </Button>
//         </Box>

//         <Dialog
//           open={openConfirmDialog}
//           onClose={() => setOpenConfirmDialog(false)}
//           aria-labelledby="alert-dialog-title"
//           aria-describedby="alert-dialog-description"
//         >
//           <DialogTitle id="alert-dialog-title">{"Confirm Save"}</DialogTitle>
//           <DialogContent>
//             <DialogContentText id="alert-dialog-description">
//               Are you sure you want to save these slots?{" "}
//               {newSlots.length > 1 && `This will create ${newSlots.length} slots.`}
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
//             <Button onClick={handleConfirmSave} autoFocus>
//               Confirm
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Snackbar
//           open={!!errorMessage}
//           autoHideDuration={6000}
//           onClose={() => setErrorMessage(null)}
//           anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//         >
//           <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: "100%" }}>
//             {errorMessage}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </LocalizationProvider>
//   )
// }

// export default DoctorAppointmentPage

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { RRule, Frequency } from "rrule";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Grid,
  Fab,
  SelectChangeEvent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RepeatIcon from "@mui/icons-material/Repeat";
import CloseIcon from "@mui/icons-material/Close";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { createDoctorSlots, fetchSlots } from "../../redux/doctorSlice";
import { deleteSlot } from "../../api/doctorApi";
import type { AppDispatch } from "../../redux/store";
import "./DoctorSlot.scss";

interface Slot {
  _id?: string;
  doctor_id: string;
  day: string;
  start_time: string;
  end_time: string;
  status: "available" | "booked";
  recurrence?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface RootState {
  doctor: {
    _id: string;
    slots: Slot[]; // Make sure this property exists in your Redux state
    loading: boolean;
    error: string | null;
  };
}

const DoctorAppointmentPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [newSlots, setNewSlots] = useState<Slot[]>([]);
  const [fetchedSlots, setFetchedSlots] = useState<Slot[]>([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<{ open: boolean; slotId: string | null }>({
    open: false,
    slotId: null,
  });
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [backendResponse, setBackendResponse] = useState<{ message: string; result: Slot | null }>({
    message: "",
    result: null,
  });
  const [recurrence, setRecurrence] = useState<string>("none");

  const dispatch = useDispatch<AppDispatch>();
  const { _id: doctorId, loading: reduxLoading, error: reduxError } = useSelector((state: RootState) => state.doctor);

  const fetchDoctorSlots = async () => {
    if (doctorId) {
      try {
        setLoading(true);
        const response = await dispatch(fetchSlots(doctorId)).unwrap();
        console.log("Fetched slots response:", response); // Debugging
        
        if (response && response.data && Array.isArray(response.data)) {
          setFetchedSlots(response.data);
        } else if (response && Array.isArray(response)) {
          // Handle case where the response might be an array directly
          setFetchedSlots(response);
        } else {
          console.error("Unexpected response format:", response);
          setErrorMessage("Unexpected response format from server");
          setFetchedSlots([]); // Initialize to empty array rather than undefined
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
        setErrorMessage("Failed to fetch slots. Please try again.");
        setFetchedSlots([]); // Initialize to empty array on error
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDoctorSlots();
  }, [doctorId, dispatch]);

  const generateRecurringSlots = (baseSlot: Slot): Slot[] => {
    if (recurrence === "none") return [baseSlot];

    const startDate = dayjs(baseSlot.day);
    const [freq, interval] = recurrence.split("-");

    // Convert string frequency to RRule Frequency enum
    const frequencyMap: Record<string, number> = {
      DAILY: Frequency.DAILY,
      WEEKLY: Frequency.WEEKLY,
      MONTHLY: Frequency.MONTHLY
    };

    const rruleOptions = {
      freq: frequencyMap[freq],
      interval: Number.parseInt(interval, 10),
      dtstart: startDate.toDate(),
      count: 52, // Generate slots for up to a year
    };

    const rule = new RRule(rruleOptions);
    const dates = rule.all();

    return dates.map((date) => ({
      ...baseSlot,
      day: dayjs(date).format("YYYY-MM-DD"),
      recurrence: rule.toString(),
    }));
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const handleStartTimeChange = (time: dayjs.Dayjs | null) => {
    setStartTime(time);
  };

  const handleRecurrenceChange = (event: SelectChangeEvent<string>) => {
    setRecurrence(event.target.value);
  };

  const handleOpenCreateModal = () => {
    setSelectedDate(null);
    setStartTime(null);
    setRecurrence("none");
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };

  const handleAddSlot = () => {
    if (selectedDate && startTime) {
      const now = dayjs();
      const selectedDateTime = dayjs(`${selectedDate.format("YYYY-MM-DD")} ${startTime.format("HH:mm")}`);

      if (selectedDateTime.isBefore(now)) {
        setErrorMessage("Cannot create a slot in the past. Please select a future date and time.");
        return;
      }

      // Changed to 30 minutes duration instead of 1 hour
      const endTime = startTime.add(30, "minute");
      const baseSlot: Slot = {
        doctor_id: doctorId,
        day: selectedDate.format("YYYY-MM-DD"),
        start_time: startTime.format("HH:mm"),
        end_time: endTime.format("HH:mm"),
        status: "available",
      };

      const recurringSlots = generateRecurringSlots(baseSlot);
      const hasOverlap = recurringSlots.some((newSlot) => {
        const isDuplicateInNew = [...newSlots, ...fetchedSlots].some(
          (slot) =>
            slot.day === newSlot.day &&
            ((slot.start_time <= newSlot.start_time && newSlot.start_time < slot.end_time) ||
              (slot.start_time < newSlot.end_time && newSlot.end_time <= slot.end_time) ||
              (newSlot.start_time <= slot.start_time && slot.end_time <= newSlot.end_time)),
        );

        return isDuplicateInNew;
      });

      if (hasOverlap) {
        setErrorMessage(
          "One or more recurring slots overlap with existing slots. Please choose different times or recurrence options.",
        );
      } else {
        setNewSlots([...newSlots, ...recurringSlots]);
        setStartTime(null);
        setSelectedDate(null);
        setRecurrence("none");
        setErrorMessage(null);
        setSuccessMessage("Slot added successfully! Don't forget to save your changes.");
        setOpenCreateModal(false);
      }
    }
  };

  const handleDeleteSlot = (index: number) => {
    const updatedSlots = newSlots.filter((_, i) => i !== index);
    setNewSlots(updatedSlots);
    setSuccessMessage("Slot removed from queue. Changes not yet saved.");
  };

  const handleDeleteExistingSlot = (slotId: string) => {
    setOpenDeleteDialog({ open: true, slotId });
  };

  const confirmDeleteExistingSlot = async () => {
    if (openDeleteDialog.slotId) {
      try {
        setLoading(true);
        await deleteSlot(openDeleteDialog.slotId);
        setSuccessMessage("Slot deleted successfully!");
        fetchDoctorSlots();
      } catch (error) {
        console.error("Error deleting slot:", error);
        setErrorMessage("Failed to delete slot. Please try again.");
      } finally {
        setLoading(false);
        setOpenDeleteDialog({ open: false, slotId: null });
      }
    }
  };

  const handleSaveSlots = () => {
    setOpenConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      setLoading(true);
      const responses = await Promise.all(newSlots.map((slot) => dispatch(createDoctorSlots(slot))));
      const lastResponse = responses[responses.length - 1];
      if (lastResponse && lastResponse.payload) {
        setBackendResponse(lastResponse.payload as { message: string; result: Slot | null });
      }
      setOpenConfirmDialog(false);
      setNewSlots([]);
      setSuccessMessage("All slots saved successfully!");

      await fetchDoctorSlots();
    } catch (error) {
      console.error("Error saving slots:", error);
      setErrorMessage("Failed to save slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return dayjs(time, "HH:mm").format("h:mm A");
  };

  const formatRecurrence = (recurrence: string): string => {
    if (recurrence === "none") return "No recurrence";
    try {
      const rule = RRule.fromString(recurrence);
      return rule.toText();
    } catch (error) {
      console.error("Error parsing recurrence rule:", error);
      return "Custom recurrence";
    }
  };

  if (reduxLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" className="loading-container">
        <CircularProgress size={60} thickness={4} color="primary" />
        <Typography variant="h6" className="loading-text">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (reduxError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" className="error-container">
        <Typography color="error" variant="h5">
          Error: {reduxError}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          className="retry-button"
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" className="appointment-page">
        <Box className="page-title-container">
          <Typography variant="h3" className="page-title" gutterBottom>
            <ChecklistIcon className="title-icon" />
            Manage Appointment Slots
          </Typography>
        </Box>

        <Box className="content-wrapper">
          <Box className="slots-header">
            <Typography variant="h5" className="section-title">
              Appointment Slots
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCreateModal}
              className="create-slot-button"
              startIcon={<AddIcon />}
            >
              CREATE NEW SLOT
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className="appointment-card slots-list-card">
                <CardHeader title="Existing Slots" className="card-header" />
                <CardContent className="card-content">
                  {fetchedSlots && fetchedSlots.length > 0 ? (
                    <List className="slots-list">
                      {fetchedSlots.map((slot) => (
                        <Fade in={true} key={slot._id || `${slot.day}-${slot.start_time}`}>
                          <ListItem
                            className={`slot-item ${slot.status === "booked" ? "booked-slot" : "available-slot"}`}
                            secondaryAction={
                              slot.status === "available" && (
                                <Tooltip title="Delete slot">
                                  <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDeleteExistingSlot(slot._id as string)}
                                    className="delete-button"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              )
                            }
                          >
                            <ListItemText
                              primary={
                                <span className="slot-date-time">
                                  {dayjs(slot.day).format("MMM DD, YYYY")} | {formatTime(slot.start_time)} -{" "}
                                  {formatTime(slot.end_time)}
                                </span>
                              }
                              secondary={
                                <span className="slot-details">
                                  <span className={`status-badge ${slot.status}`}>{slot.status}</span>
                                  {slot.recurrence ? ` | ${formatRecurrence(slot.recurrence)}` : ""}
                                </span>
                              }
                              className="slot-text"
                            />
                          </ListItem>
                        </Fade>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" align="center" className="no-slots-message">
                      No slots have been created yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="appointment-card slots-list-card">
                <CardHeader title="New Slots" className="card-header" />
                <CardContent className="card-content">
                  {newSlots.length > 0 ? (
                    <List className="slots-list">
                      {newSlots.map((slot, index) => (
                        <Fade in={true} key={index}>
                          <ListItem
                            className="slot-item new-slot"
                            secondaryAction={
                              <Tooltip title="Remove from queue">
                                <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={() => handleDeleteSlot(index)}
                                  className="delete-button"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <ListItemText
                              primary={
                                <span className="slot-date-time">
                                  {dayjs(slot.day).format("MMM DD, YYYY")} | {formatTime(slot.start_time)} -{" "}
                                  {formatTime(slot.end_time)}
                                </span>
                              }
                              secondary={
                                <span className="slot-details">
                                  <span className="status-badge pending">pending</span>
                                  {slot.recurrence ? ` | ${formatRecurrence(slot.recurrence)}` : " | No recurrence"}
                                </span>
                              }
                              className="slot-text"
                            />
                          </ListItem>
                        </Fade>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" align="center" className="no-slots-message">
                      No new slots in queue. Click "CREATE NEW SLOT" to add slots.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {newSlots.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveSlots}
              className="save-slots-button"
            >
              Save Slots
            </Button>
          )}

          {/* Floating Action Button for mobile */}
          <Fab color="primary" aria-label="add" className="mobile-add-button" onClick={handleOpenCreateModal}>
            <AddIcon />
          </Fab>
        </Box>

        {/* Create Slot Modal */}
        <Dialog
          open={openCreateModal}
          onClose={handleCloseCreateModal}
          aria-labelledby="create-slot-dialog-title"
          maxWidth="sm"
          fullWidth
          className="create-slot-modal"
        >
          <DialogTitle id="create-slot-dialog-title" className="create-modal-header">
            <Typography variant="h5">Create New Appointment Slot</Typography>
            <IconButton aria-label="close" onClick={handleCloseCreateModal} className="close-button">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="create-modal-content">
            <Box className="form-container">
              <Box className="form-field-with-icon">
                <CalendarMonthIcon className="form-field-icon" />
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  disablePast
                  slotProps={{ textField: { fullWidth: true, className: "date-picker" } }}
                />
              </Box>

              <Box className="form-field-with-icon">
                <AccessTimeIcon className="form-field-icon" />
                <TimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  slotProps={{ textField: { fullWidth: true, className: "time-picker" } }}
                />
              </Box>

              <Typography variant="caption" className="time-caption">
                Note: Each slot duration is 30 minutes
              </Typography>

              <Box className="form-field-with-icon">
                <RepeatIcon className="form-field-icon" />
                <FormControl fullWidth>
                  <InputLabel>Recurrence</InputLabel>
                  <Select
                    value={recurrence}
                    onChange={handleRecurrenceChange}
                    label="Recurrence"
                    className="recurrence-select"
                  >
                    <MenuItem value="none">No recurrence</MenuItem>
                    <MenuItem value="DAILY-1">Daily</MenuItem>
                    <MenuItem value="WEEKLY-1">Weekly</MenuItem>
                    <MenuItem value="WEEKLY-2">Every 2 weeks</MenuItem>
                    <MenuItem value="MONTHLY-1">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions className="create-modal-actions">
            <Button onClick={handleCloseCreateModal} className="cancel-button">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddSlot}
              disabled={!selectedDate || !startTime}
              className="add-slot-button"
              startIcon={<AddIcon />}
            >
              Add Slot
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Save Dialog */}
        <Dialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          className="dialog-container"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Save"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to save these slots?{" "}
              {newSlots.length > 1 && `This will create ${newSlots.length} slots.`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog(false)} className="cancel-button">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSave}
              color="primary"
              variant="contained"
              autoFocus
              className="confirm-button"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog
          open={openDeleteDialog.open}
          onClose={() => setOpenDeleteDialog({ open: false, slotId: null })}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          className="dialog-container"
        >
          <DialogTitle id="delete-dialog-title">{"Delete Slot"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete this slot? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog({ open: false, slotId: null })} className="cancel-button">
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteExistingSlot}
              color="error"
              variant="contained"
              autoFocus
              className="delete-confirm-button"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: "100%" }} variant="filled">
            {errorMessage}
          </Alert>
        </Snackbar>

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: "100%" }} variant="filled">
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default DoctorAppointmentPage;