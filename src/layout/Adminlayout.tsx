import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from '../components/Admin/Adminsidebar';


const AdminLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </Box>
  );
};

export default AdminLayout;



// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import { Box, CssBaseline } from '@mui/material';
// import Sidebar from '../components/Admin/Adminsidebar';

// interface AdminLayoutProps {
//   children: React.ReactNode;
// }

// const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
//   return (
//     <Box sx={{ display: 'flex' }}>
//       <CssBaseline />
//       <Sidebar />
//       <main className="main-content">
//         {children || <Outlet />}
//       </main>
//     </Box>
//   );
// };

// export default AdminLayout;
