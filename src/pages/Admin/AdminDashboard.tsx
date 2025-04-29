import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Card, CardContent, Typography, Grid, Box, Tabs, Tab,
  Paper, CircularProgress, FormControl, InputLabel, Select, MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  People, Assignment, MedicalServices, TrendingUp,
  CalendarToday, DateRange, CalendarViewMonth
} from '@mui/icons-material';
import { fetchDashboardMetrics, fetchAppointmentStats } from '../../api/adminApi';
import './AdminDashboard.scss';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface DashboardMetrics {
  totalDoctors: number;
  totalUsers: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  revenueGenerated: number;
}

interface ChartData {
  daily: { name: string; appointments: number }[];
  weekly: { name: string; appointments: number }[];
  yearly: { name: string; appointments: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState<string>('lastWeek');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardMetrics = await fetchDashboardMetrics();
      const appointmentStats = await fetchAppointmentStats(timeRange);

      setMetrics(dashboardMetrics);
      setChartData(appointmentStats);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
    setTimeRange(event.target.value as string);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <Typography variant="h6" color="error">{error}</Typography>
        <button className="retry-button" onClick={loadDashboardData}>Retry</button>
      </div>
    );
  }

  // Placeholder data if real data isn't available
  const pieData = [
    { name: 'Completed', value: metrics?.completedAppointments || 0 },
    { name: 'Cancelled', value: metrics?.cancelledAppointments || 0 },
    { name: 'Pending', value: metrics?.pendingAppointments || 0 },
  ];

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Admin Dashboard</h1>

      {/* Summary Cards */}
      <div className="dashboard__summary">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="summary-card doctor-card">
              <CardContent>
                <div className="card-icon">
                  <MedicalServices />
                </div>
                <Typography variant="h5" component="div" className="metric-value">
                  {metrics?.totalDoctors}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Doctors
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="summary-card user-card">
              <CardContent>
                <div className="card-icon">
                  <People />
                </div>
                <Typography variant="h5" component="div" className="metric-value">
                  {metrics?.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="summary-card appointment-card">
              <CardContent>
                <div className="card-icon">
                  <Assignment />
                </div>
                <Typography variant="h5" component="div" className="metric-value">
                  {metrics?.totalAppointments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Appointments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className="summary-card revenue-card">
              <CardContent>
                <div className="card-icon">
                  <TrendingUp />
                </div>
                <Typography variant="h5" component="div" className="metric-value">
                  ${metrics?.revenueGenerated}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revenue Generated
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>

      {/* Charts Section */}
      <div className="dashboard__charts">
        <Paper elevation={3} className="chart-container">
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="appointment stats tabs">
              <Tab icon={<CalendarToday />} label="Daily" />
              <Tab icon={<DateRange />} label="Weekly" />
              <Tab icon={<CalendarViewMonth />} label="Yearly" />
            </Tabs>

            <FormControl variant="outlined" size="small" className="time-range-selector">
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="Time Range"
              >
                <MenuItem value="lastWeek">Last Week</MenuItem>
                <MenuItem value="lastMonth">Last Month</MenuItem>
                <MenuItem value="lastQuarter">Last Quarter</MenuItem>
                <MenuItem value="lastYear">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Daily Chart */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom className="chart-title">
              Daily Appointment Statistics
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chartData?.daily || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#8884d8" name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </TabPanel>

          {/* Weekly Chart */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom className="chart-title">
              Weekly Appointment Statistics
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={chartData?.weekly || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#2196f3"
                  activeDot={{ r: 8 }}
                  name="Appointments"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabPanel>

          {/* Yearly Chart */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom className="chart-title">
              Yearly Appointment Statistics
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chartData?.yearly || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#4caf50" name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </TabPanel>
        </Paper>
      </div>

      {/* Distribution Pie Chart */}
      <div className="dashboard__distribution">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} className="pie-chart-container">
              <Typography variant="h6" gutterBottom className="chart-title">
                Appointment Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} appointments`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} className="stats-container">
              <Typography variant="h6" gutterBottom className="chart-title">
                Appointment Details
              </Typography>
              <div className="stats-grid">
                <div className="stat-item">
                  <Typography variant="subtitle2">Total Appointments</Typography>
                  <Typography variant="h4">{metrics?.totalAppointments || 0}</Typography>
                </div>
                <div className="stat-item">
                  <Typography variant="subtitle2">Completed</Typography>
                  <Typography variant="h4" className="completed-text">{metrics?.completedAppointments || 0}</Typography>
                </div>
                <div className="stat-item">
                  <Typography variant="subtitle2">Cancelled</Typography>
                  <Typography variant="h4" className="cancelled-text">{metrics?.cancelledAppointments || 0}</Typography>
                </div>
                <div className="stat-item">
                  <Typography variant="subtitle2">Pending</Typography>
                  <Typography variant="h4" className="pending-text">{metrics?.pendingAppointments || 0}</Typography>
                </div>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Dashboard;