// import React from 'react'
// import AddCourseForm from './components/AddCourseForm'
// import CourseList from './components/CourseList'

// const App = () => {
//   return (
//     <div>
//       <AddCourseForm/>
//       <CourseList/>
//     </div>
//   )
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddCourseForm from './components/AddCourseForm';
import AdminLogin from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AddUsers from './components/AddUsers';
import Navbar from './components/Navbar';
import BlogForm from './components/BlogForm';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/CourseForm" element={<AddCourseForm />} />
        <Route path="/" element={<AdminLogin />} />
        <Route path="/Dashboard" element={<AdminDashboard />} />
        <Route path="/AddUsers" element={<AddUsers />} /> 
        <Route path="/BlogForm" element={<BlogForm />} /> 


      </Routes>
    </Router>
  );
}

export default App;
