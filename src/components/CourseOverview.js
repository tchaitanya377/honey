import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';

const CourseOverview = () => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const sectionsSnapshot = await db.collection('courseSections').get();
        const sectionsData = sectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSections(sectionsData);
      } catch (error) {
        console.error('Error fetching course sections:', error);
      }
    };

    fetchSections();
  }, []);

  return (
    <div className="p-4">
      <div className="mt-6 bg-white rounded shadow">
        <h3 className="text-lg font-semibold p-4">Activities</h3>
        <div className="flex space-x-4 p-4">
          {/* Add tab buttons and logic here */}
        </div>

        <div className="p-4">
          {/* Render sections and lectures dynamically */}
          {sections.map(section => (
            <div key={section.id} className="mb-4">
              <h3 className="font-semibold">{section.title}</h3>
              <div className="mt-2 space-y-2">
                {section.lectures.map(lecture => (
                  <div key={lecture.id} className="flex items-center justify-between bg-white px-4 py-2 rounded-md">
                    <span className="text-gray-800">{lecture.title}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500">{lecture.duration}</span>
                      <Link to={`/Myaccount/Course/start/${section.id}/${lecture.id}`} className="text-blue-500 hover:text-blue-600">
                        Go to Lecture
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
