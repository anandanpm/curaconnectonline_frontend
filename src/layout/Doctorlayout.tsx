import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import DocHeader from "../components/Doctor/Doc-header";
import DocFooter from "../components/Doctor/Doc-footer";
import Loading from "../components/Loading/Loading";

const DoctorLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Clean up the timer
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <DocHeader />
      <Outlet />
      <DocFooter />
    </>
  )

}


export default DoctorLayout

// import React from "react";
// import { Outlet } from "react-router-dom";
// import DocHeader from "../components/Doctor/Doc-header";
// import DocFooter from "../components/Doctor/Doc-footer";

// interface DoctorLayoutProps {
//   children: React.ReactNode;
// }

// const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
//   return (
//     <>
//       <DocHeader />
//       {children || <Outlet />}
//       <DocFooter />
//     </>
//   );
// };

// export default DoctorLayout;
