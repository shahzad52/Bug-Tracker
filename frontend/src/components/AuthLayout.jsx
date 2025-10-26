import React from "react";
import { ManageBugLogo } from "../assets/icons";
import { Outlet } from "react-router-dom";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-[45%] bg-gray-900 relative">
        <img
          src="/images/digital-products.jpg"
          alt="Digital Products"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute bottom-4 left-4 text-white text-2xl font-bold flex items-center z-10">
          <ManageBugLogo className="h-8 w-8 mr-2" />
          ManageBug
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 xl:px-20 py-12 bg-white">
        <div className="w-full max-w-[480px] lg:max-w-[400px] mx-auto">
          {children}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
