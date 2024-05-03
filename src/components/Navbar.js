import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon } from '@heroicons/react/outline'; // Importing the menu icon

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to track menu open/close

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the menu state
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white font-bold text-lg">Admin Dashboard</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/Dashboard">Dashboard</NavLink>
                <NavLink to="/CourseForm">Courses</NavLink>
                <NavLink to="/AddUsers">Users</NavLink>
                <NavLink to="/BlogForm">Blog</NavLink>

                {/* Add more navigation links as needed */}
              </div>
            </div>
          </div>
          {/* Menu button for mobile view */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
              aria-label="Open menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLinkMobile to="/Dashboard" onClick={toggleMenu}>
              Dashboard
            </NavLinkMobile>
            <NavLinkMobile to="/CourseForm" onClick={toggleMenu}>
              Courses
            </NavLinkMobile>
            <NavLinkMobile to="/AddUsers" onClick={toggleMenu}>
              Users
            </NavLinkMobile>
            <NavLinkMobile to="/BlogForm" onClick={toggleMenu}>
              Blog
            </NavLinkMobile>
            {/* Add more navigation links as needed */}
          </div>
        </div>
      )}
    </nav>
  );
};

// NavLink component for desktop view
const NavLink = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
      activeClassName="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
    >
      {children}
    </Link>
  );
};

// NavLink component for mobile view
const NavLinkMobile = ({ to, children, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
      activeClassName="bg-gray-900 text-white px-3 py-2 rounded-md text-base font-medium"
    >
      {children}
    </Link>
  );
};

export default Navbar;
