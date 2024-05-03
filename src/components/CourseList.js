// import React, { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, getDocs } from 'firebase/firestore';
// import ReactPlayer from 'react-player';
// // Your Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyA4qjcP40hgzx-gWKqVB6c9h9OKpecZobw",
//   authDomain: "lms-1-36b1f.firebaseapp.com",
//   projectId: "lms-1-36b1f",
//   storageBucket: "lms-1-36b1f.appspot.com",
//   messagingSenderId: "568729903010",
//   appId: "1:568729903010:web:5e85a998503b1054f9dcfb",
//   measurementId: "G-Z5844EFCH1"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// const CourseList = () => {
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, 'courses'));
//         const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setCourses(coursesData);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching courses:', error);
//       }
//     };

//     fetchCourses();
//   }, []);

//   const handleContextMenu = (e) => {
//     e.preventDefault(); // Prevent default context menu
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
//       <h2 className="text-2xl font-bold mb-4">Courses</h2>
//       {courses.map(course => (
//         <div key={course.id} className="mb-4">
//           <h3 className="text-lg font-semibold">{course.courseName}</h3>
//           <p className="mb-2">{course.description}</p>
//           <div>
//             <h4 className="text-md font-semibold mb-1">Sub Courses</h4>
//             {course.subCourses.map((subCourse, index) => (
//               <div key={index} className="mb-2">
//                 <p className="text-gray-600">{`${index + 1}. ${subCourse.name}`}</p>
//                 <p className="text-sm text-gray-500">{subCourse.description}</p>
//                 <div>
//                   <h5 className="text-sm font-semibold mb-1">Topics</h5>
//                   {subCourse.topics.map((topic, index) => (
//                     <div key={index} className="flex items-center">
//                       <span className="text-gray-600">{`${index + 1}. ${topic.name}`}</span>
//                       <video src={topic.videoUrl} controls controlsList="nodownload" onContextMenu={handleContextMenu} className="ml-2" />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CourseList;

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import ReactPlayer from 'react-player';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4qjcP40hgzx-gWKqVB6c9h9OKpecZobw",
  authDomain: "lms-1-36b1f.firebaseapp.com",
  projectId: "lms-1-36b1f",
  storageBucket: "lms-1-36b1f.appspot.com",
  messagingSenderId: "568729903010",
  appId: "1:568729903010:web:5e85a998503b1054f9dcfb",
  measurementId: "G-Z5844EFCH1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleContextMenu = (e) => {
    e.preventDefault(); // Prevent default context menu
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Courses</h2>
      {courses.map(course => (
        <div key={course.id} className="mb-4">
          <h3 className="text-lg font-semibold">{course.courseName}</h3>
          <p className="mb-2">{course.description}</p>
          <div>
            <h4 className="text-md font-semibold mb-1">Sub Courses</h4>
            {course.subCourses.map((subCourse, index) => (
              <div key={index} className="mb-2">
                <p className="text-gray-600">{`${index + 1}. ${subCourse.name}`}</p>
                <p className="text-sm text-gray-500">{subCourse.description}</p>
                <div>
                  <h5 className="text-sm font-semibold mb-1">Topics</h5>
                  {subCourse.topics.map((topic, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-gray-600">{`${index + 1}. ${topic.name}`}</span>
                      {topic.videoUrl.includes('you') ? (
                        <ReactPlayer url={topic.videoUrl} controls={true} width="auto" height="auto" />
                      ) : (
                        <video src={topic.videoUrl} controls controlsList="nodownload" onContextMenu={handleContextMenu} className="ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;