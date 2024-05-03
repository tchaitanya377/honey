import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'; 
import { Link } from 'react-router-dom';

 // Import Firestore if you're using Firestore

const CoursePage = () => {
  const [courseCategories, setCourseCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Assuming you have a Firestore collection named 'courses' in your Firebase project
        const coursesSnapshot = await firebase.firestore().collection('courses').get();

        const categoriesData = coursesSnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });

        setCourseCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      {courseCategories.map((category) => (
        <Link to={`/Myaccount/CourseOverview/${category.id}`} key={category.id} className="mb-6">
          <h2 className="text-lg font-bold mb-4">{category.title.trim()}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {category.courses.map((course) => (
              <div key={course.id} className="p-4 border rounded shadow">
                <img src={course.image} alt={course.title} className="w-full h-24 sm:h-32 object-cover mb-2 rounded" />
                <p className="text-sm sm:text-base">{course.title}</p>
              </div>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CoursePage;
