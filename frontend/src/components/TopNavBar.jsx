import React, { Fragment, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Briefcase, LogOut, Settings } from "lucide-react";
import { Menu, Transition } from '@headlessui/react';
import NotificationsPopover from './NotificationsPopover';

const ManageBugLogo = () => (
    <div className="flex items-center gap-2">
      <div className="bg-blue-600 p-2 rounded-lg">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
          <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="font-semibold text-xl text-gray-800">ManageBug</span>
    </div>
);

export default function TopNavBar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  
  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-2 text-sm font-medium py-5 border-b-2 transition-colors ${
      isActive 
        ? 'text-blue-600 border-blue-600' 
        : 'text-gray-500 border-transparent hover:text-gray-800'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <NavLink to="/"><ManageBugLogo /></NavLink>
            <nav className="hidden md:flex items-center gap-8">
              <NavLink to="/" className={navLinkClass}>
                <Briefcase size={18} />
                Projects
              </NavLink>
              <NavLink to="/bugs" className={navLinkClass}>
                <Briefcase size={18} />
                Bugs
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-5">
            
            {<NotificationsPopover />}
            
            <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-3 focus:outline-none">
                    <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
                        {user.profile_picture_url ? (
                            <img 
                                src={user.profile_picture_url} 
                                alt={user.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-black text-white flex items-center justify-center font-semibold text-sm">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                </Menu.Button>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-1 py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <NavLink 
                                        to="/profile"
                                        className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    >
                                        <Settings className="mr-2 h-5 w-5" />
                                        Profile Settings
                                    </NavLink>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button 
                                        onClick={handleLogout} 
                                        className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    >
                                        <LogOut className="mr-2 h-5 w-5" />
                                        Logout
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
          </div>
          

        </div>
      </div>
    </header>
  );
}

