import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/User/Header";
import Footer from "../components/User/Footer";
import Loading from "../components/Loading/Loading";

const UserLayout: React.FC = () => {
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
    <div className="user-layout">
      <Header />
      <main className="user-layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;

