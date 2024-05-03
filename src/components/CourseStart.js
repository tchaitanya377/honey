import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import MyNav from './MyNav';
import { db } from '../firebase';

const CourseStart = ({ match }) => {
  const [section, setSection] = useState(null);
  const [lecture, setLecture] = useState(null);
  const playerRef = useRef(null); // Reference to ReactPlayer component

  useEffect(() => {
    const fetchSectionAndLecture = async () => {
      const { sectionId, lectureId } = match.params;
      
      try {
        const sectionDoc = await db.collection('courseSections').doc(sectionId).get();
        const sectionData = sectionDoc.data();
        setSection(sectionData);

        const lectureData = sectionData.lectures.find(lec => lec.id === lectureId);
        setLecture(lectureData);
      } catch (error) {
        console.error('Error fetching section and lecture:', error);
      }
    };

    fetchSectionAndLecture();
  }, [match.params]);

  const jumpToTime = (time) => {
    playerRef.current.seekTo(time);
  };

  return (
    <>
      <MyNav />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <ReactPlayer
          ref={playerRef}
          url={lecture ? lecture.videoLink : ''}
          width="100%"
          height="500px" // Adjust the height here
          controls={true}
        />
        <div className="md:flex md:justify-between md:items-start">
          <div className="md:w-1/2 md:pr-8 md:mb-0 mb-8">
            <div className="overflow-y-auto">
              {section && (
                <div className="mb-8">
                  <h3 className="font-semibold">{section.title}</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between bg-white px-4 py-2 rounded-md">
                      <span className="text-gray-800">{lecture.title}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500">{lecture.duration}</span>
                        <span
                          className="cursor-pointer text-blue-500 hover:text-blue-600"
                          onClick={() => jumpToTime(0)} // Assuming lectures are roughly a minute each
                        >
                          Go to Lecture
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="md:w-1/2 md:pl-8">
            {/* Add notes section here */}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseStart;
