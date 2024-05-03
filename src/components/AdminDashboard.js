import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CoursePage from './CoursePage'; // Import CoursePage
import EditCourseForm from './EditCourseForm';
import CourseList from './CourseList';

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    // Function to fetch total number of users
    const fetchTotalUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = querySnapshot.size;
        console.log('Total Users:', totalUsers);
        setTotalUsers(totalUsers);
      } catch (error) {
        console.error('Error fetching total users:', error);
      }
    };

    // Function to fetch total number of courses
    const fetchTotalCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const totalCourses = querySnapshot.size;
        console.log('Total Courses:', totalCourses);
        setTotalCourses(totalCourses);
      } catch (error) {
        console.error('Error fetching total courses:', error);
      }
    };

    // Call the functions to fetch data on component mount
    fetchTotalUsers();
    fetchTotalCourses();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navigation */}

      {/* Main content */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              {/* Add your dashboard content here */}
              <h2 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h2>
              <p className="text-gray-600">You can add your dashboard components and functionality here.</p>
              {/* Display total users and courses */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white shadow-sm rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                  <p className="text-gray-600">{totalUsers}</p>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Total Courses</h3>
                  <p className="text-gray-600">{totalCourses}</p>
                </div>
                {/* Add more sections as needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <CourseList/>
      <EditCourseForm/>
      <CoursePage/>  */}
    </div>
  );
};

export default AdminDashboard;
