
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { logoutAdmin } from '../../redux/adminSlice';
import './Adminsidebar.scss';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/admin/patients', label: 'Patients', icon: <PeopleIcon /> },
  { path: '/admin/doctors', label: 'Doctors', icon: <DoctorIcon /> },
  { path: '/admin/review', label: 'review', icon: <AssignmentIcon /> },
];

const Sidebar: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate()


  const handleLogout = async () => {
    try {

      dispatch(logoutAdmin());
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Drawer variant="permanent" className="sidebar">
      <div className="logo">
        <Typography variant="h6" component={NavLink} to="/admin/dashboard">
          CuraConnect
        </Typography>
      </div>
      <List>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className="nav-link">
            {({ isActive }) => (
              <ListItem disablePadding>
                <ListItemButton component="div" className={isActive ? 'active' : ''}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )}
          </NavLink>
        ))}

        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;