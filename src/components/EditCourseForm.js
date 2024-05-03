import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA4qjcP40hgzx-gWKqVB6c9h9OKpecZobw",
  authDomain: "lms-1-36b1f.firebaseapp.com",
  projectId: "lms-1-36b1f",
  storageBucket: "lms-1-36b1f.appspot.com",
  messagingSenderId: "568729903010",
  appId: "1:568729903010:web:5e85a998503b1054f9dcfb",
  measurementId: "G-Z5844EFCH1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const AddCourseForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [subCourses, setSubCourses] = useState([{ name: '', description: '', additionalContents: [], topics: [] }]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [courseThumbnailURL, setCourseThumbnailURL] = useState('');
  const [existingCourses, setExistingCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    // Fetch existing courses from Firebase
    const fetchExistingCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExistingCourses(courses);
      } catch (error) {
        console.error('Error fetching existing courses:', error);
      }
    };
    fetchExistingCourses();
  }, [db]);

  useEffect(() => {
    // Check if any file is being uploaded
    const uploading = subCourses.some(subCourse =>
      subCourse.additionalContents.some(content => content.uploading)
    );
    setIsUploading(uploading);
  }, [subCourses]);

  const handleAdditionalContentChange = (subCourseIndex, contentIndex, value) => {
    setSubCourses(prevSubCourses => {
      const updatedSubCourses = [...prevSubCourses];
      updatedSubCourses[subCourseIndex].additionalContents[contentIndex].value = value;
      return updatedSubCourses;
    });
  };

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Function to fetch and populate selected course data
  const handleCourseSelection = (courseId) => {
    const selectedCourseData = existingCourses.find(course => course.id === courseId);
    if (selectedCourseData) {
      setCourseName(selectedCourseData.courseName);
      setDescription(selectedCourseData.description);
      // Populate other fields as needed
    }
  };

  const handleAddTopic = (subCourseIndex) => {
    const updatedSubCourses = [...subCourses];
    updatedSubCourses[subCourseIndex].topics.push({ name: '', videoUrl: '' });
    setSubCourses(updatedSubCourses);
  };


  const handleRemoveTopic = (subCourseIndex, topicIndex) => {
    const updatedSubCourses = [...subCourses];
    updatedSubCourses[subCourseIndex].topics.splice(topicIndex, 1);
    setSubCourses(updatedSubCourses);
  };

  const handleFileUpload = async (event, subCourseIndex, contentIndex, isVideoUpload) => {
    try {
      const uploadedFile = event.target.files[0];
      let storagePath = '';
      
      // Determine storage path based on whether it's a video upload or additional content upload
      if (isVideoUpload) {
        storagePath = `videos/${uploadedFile.name}`;
      } else {
        storagePath = `additional/${uploadedFile.name}`;
      }
  
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, uploadedFile);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading file:', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setSubCourses(prevSubCourses => {
              const updatedSubCourses = [...prevSubCourses];
              if (isVideoUpload) {
                updatedSubCourses[subCourseIndex].topics[contentIndex].videoUrl = downloadURL;
              } else {
                if (!updatedSubCourses[subCourseIndex].additionalContents[contentIndex]) {
                  updatedSubCourses[subCourseIndex].additionalContents[contentIndex] = { type: '', value: '' };
                }
                updatedSubCourses[subCourseIndex].additionalContents[contentIndex].value = downloadURL;
              }
              return updatedSubCourses;
            });
          });
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  
  
  const handleSubmit = async () => {
    try {
      // Check if any file is still uploading
      if (isUploading) {
        setAlertMessage('Please wait for all files to finish uploading.');
        setShowAlert(true);
        return;
      }
  
      const courseData = {
        courseName,
        description,
        courseThumbnailURL, // Add course thumbnail URL here
        subCourses
      };
  
      // Map over subCourses to include additionalContents
      const formattedSubCourses = subCourses.map(subCourse => ({
        ...subCourse,
        additionalContents: subCourse.additionalContents.map(content => ({
          type: content.type,
          value: content.value // URL fetched from storage
        }))
      }));
  
      courseData.subCourses = formattedSubCourses;
  
      await addDoc(collection(db, 'courses'), courseData);
  
      setAlertMessage('Course added successfully');
      setShowAlert(true);
  
      setCourseName('');
      setDescription('');
      setCourseThumbnailURL(''); // Reset course thumbnail URL
      setSubCourses([{ name: '', description: '', additionalContents: [], topics: [] }]);
      setCurrentStep(1);
    } catch (error) {
      setAlertMessage('Error adding course. Please try again.');
      setShowAlert(true);
      console.error('Error adding course:', error);
    }
  };
  
  

  const handleAddSubCourse = () => {
    setSubCourses([...subCourses, { name: '', description: '', additionalContents: [], topics: [] }]);
    setCurrentStep(2); // Redirect to Step 2
  };

  const handleRemoveSubCourse = (index) => {
    const updatedSubCourses = [...subCourses];
    updatedSubCourses.splice(index, 1);
    setSubCourses(updatedSubCourses);
  };

  const handleAddAdditionalContent = (subCourseIndex) => {
    const updatedSubCourses = [...subCourses];
    updatedSubCourses[subCourseIndex].additionalContents.push({ type: '', value: '' });
    setSubCourses(updatedSubCourses);
  };

  const handleRemoveAdditionalContent = (subCourseIndex, contentIndex) => {
    const updatedSubCourses = [...subCourses];
    updatedSubCourses[subCourseIndex].additionalContents.splice(contentIndex, 1);
    setSubCourses(updatedSubCourses);
  };

  const handleVideoUpload = async (event, subCourseIndex, topicIndex) => {
    try {
      const uploadedVideo = event.target.files[0];
      const storageRef = ref(storage, `videos/${uploadedVideo.name}`);
      const uploadTask = uploadBytesResumable(storageRef, uploadedVideo);
  
      uploadTask.on('state_changed',
        (snapshot) => {
          // Handle progress
        },
        (error) => {
          console.error('Error uploading video:', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setSubCourses(prevSubCourses => {
              const updatedSubCourses = [...prevSubCourses];
              updatedSubCourses[subCourseIndex].topics[topicIndex].videoUrl = downloadURL;
              return updatedSubCourses;
            });
          });
        }
      );
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="w-full bg-gray-200 h-4 rounded">
        <div className="bg-green-500 h-full rounded" style={{ width: `${uploadProgress}%` }}></div>
      </div>
    );
  };

  const handleThumbnailUpload = async (event) => {
    try {
      const uploadedFile = event.target.files[0];
      const storageRef = ref(storage, `thumbnails/${uploadedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, uploadedFile);
  
      uploadTask.on('state_changed',
        (snapshot) => {
          // Handle progress
        },
        (error) => {
          console.error('Error uploading thumbnail:', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setCourseThumbnailURL(downloadURL); // Assuming you have a state variable to store the thumbnail URL
          });
        }
      );
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
    }
  };

  const renderStepOne = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 1: Course Details</h2>
      <form onSubmit={handleNextStep}>
        <div className="mb-4">
          <label htmlFor="courseName" className="block font-semibold mb-1">Course Name</label>
          <input
            type="text"
            id="courseName"
            className="w-full border border-gray-300 rounded p-2"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block font-semibold mb-1">Description</label>
          <textarea
            id="description"
            className="w-full border border-gray-300 rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            // required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="thumbnail" className="block font-semibold mb-1">Course Thumbnail</label>
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={(e) => handleThumbnailUpload(e)}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Next</button>
      </form>
    </div>
  );

  const renderStepTwo = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 2: Add Sub Courses</h2>
      {subCourses.map((subCourse, index) => (
        <div key={index} className="mb-4">
          <input
            type="text"
            placeholder={`Sub Course ${index + 1} Name`}
            className="w-full border border-gray-300 rounded p-2 mb-1"
            value={subCourse.name}
            onChange={(e) => {
              const updatedSubCourses = [...subCourses];
              updatedSubCourses[index].name = e.target.value;
              setSubCourses(updatedSubCourses);
            }}
            required
          />
          <textarea
            placeholder={`Sub Course ${index + 1} Description`}
            className="w-full border border-gray-300 rounded p-2 mb-1"
            value={subCourse.description}
            onChange={(e) => {
              const updatedSubCourses = [...subCourses];
              updatedSubCourses[index].description = e.target.value;
              setSubCourses(updatedSubCourses);
            }}
            required
          />
          {subCourse.additionalContents.map((content, contentIndex) => (
            <div key={contentIndex} className="flex items-center mb-1">
              <select
                className="border border-gray-300 rounded p-2 mr-2"
                value={content.type}
                onChange={(e) => {
                  const updatedSubCourses = [...subCourses];
                  updatedSubCourses[index].additionalContents[contentIndex].type = e.target.value;
                  setSubCourses(updatedSubCourses);
                }}
              >
                <option value="assignment">Assignment</option>
                <option value="notes">Notes</option>
                <option value="recordings">Recordings</option>
                <option value="others">Others</option>
              </select>
              {content.type === 'assignment' && (
                <input
                  type="file"
                  className="w-full border border-gray-300 rounded p-2"
                  onChange={(e) => handleFileUpload(e, index, contentIndex)}
                  required
                />
              )}
              {content.type === 'notes' && (
                <input
                  type="file"
                  className="w-full border border-gray-300 rounded p-2"
                  onChange={(e) => handleFileUpload(e, index, contentIndex)}
                  required
                />
              )}
              {content.type === 'recordings' && (
                <input
                  type="file"
                  className="w-full border border-gray-300 rounded p-2"
                  onChange={(e) => handleFileUpload(e, index, contentIndex)}
                  required
                />
              )}
              {content.type === 'others' && (
                <input
                  type="file"
                  className="w-full border border-gray-300 rounded p-2"
                  onChange={(e) => handleFileUpload(e, index, contentIndex)}
                  required
                />
              )}
              <button
                type="button"
                className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                onClick={() => handleRemoveAdditionalContent(index, contentIndex)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
            onClick={() => handleAddAdditionalContent(index)}
          >
            Add Additional Content
          </button>
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => handleRemoveSubCourse(index)}
          >
            Remove Sub Course
          </button>
        </div>
      ))}
      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleAddSubCourse}
      >
        Add Sub Course
      </button>
      <div className="flex justify-between">
        <button
          type="button"
          className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
          onClick={handlePreviousStep}
        >
          Previous
        </button>
        <button
          type="button"
          className="bg-green-500 text-white px-4 py-2 rounded mt-4"
          onClick={handleNextStep}
        >
          {currentStep === 4 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 3: Review and Submit</h2>
      <h3 className="text-xl font-semibold mb-2">Course Details</h3>
      <p><span className="font-semibold">Course Name:</span> {courseName}</p>
      <p><span className="font-semibold">Description:</span> {description}</p>
      <h3 className="text-xl font-semibold mb-2 mt-4">Sub Courses</h3>
      {subCourses.map((subCourse, index) => (
        <div key={index} className="mb-4">
          <p className="font-semibold mb-1">Sub Course {index + 1}</p>
          <p><span className="font-semibold">Name:</span> {subCourse.name}</p>
          <p><span className="font-semibold">Description:</span> {subCourse.description}</p>
          {subCourse.additionalContents.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold mb-1">Additional Contents:</p>
              <ul>
                {subCourse.additionalContents.map((content, contentIndex) => (
                  <li key={contentIndex}>{content.type}</li>
                ))}
              </ul>
            </div>
          )}
          {subCourse.topics.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold mb-1">Topics:</p>
              <ul>
                {subCourse.topics.map((topic, topicIndex) => (
                  <li key={topicIndex}>{topic.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        className="bg-gray-500 text-white px-4 py-2 rounded"
        onClick={handlePreviousStep}
      >
        Previous
      </button>
      <button
        type="button"
        className="bg-green-500 text-white px-4 py-2 rounded ml-2"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );

  return (
    <div className="container mx-auto mt-8 p-4">
      <div className="max-w-lg mx-auto">
        <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); handleCourseSelection(e.target.value); }}>
          <option value="">Select a course</option>
          {existingCourses.map(course => (
            <option key={course.id} value={course.id}>{course.courseName}</option>
          ))}
        </select>
        {/* Existing course selection dropdown */}
        {showAlert && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{alertMessage}</span>
          </div>
        )}
        {currentStep === 1 && renderStepOne()}
        {currentStep === 2 && renderStepTwo()}
        {currentStep === 3 && renderStepThree()}
        {isUploading && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Uploading Files</h3>
            {renderProgressBar()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCourseForm;
// import React, { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, getDoc,doc,updateDoc } from 'firebase/firestore';
// import AddCourseForm from './AddCourseForm'; // Assuming AddCourseForm is in a separate file

// const firebaseConfig = {
//   apiKey: "AIzaSyA6hi5WniSmIBsPCwcqk_QVizh8yHcYM88",
//   authDomain: "ravuru-ccbcd.firebaseapp.com",
//   projectId: "ravuru-ccbcd",
//   storageBucket: "ravuru-ccbcd.appspot.com",
//   messagingSenderId: "438776822141",
//   appId: "1:438776822141:web:31b8db8d2b789959003414",
//   measurementId: "G-9TDRW616T8"
// };
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// const EditCourseForm = ({ courseId }) => {
//   const [course, setCourse] = useState(null);
//   const [courseName, setCourseName] = useState('');
//   const [description, setDescription] = useState('');
//   const [subCourses, setSubCourses] = useState([{ name: '', description: '', additionalContents: [], topics: [] }]);
//   const [courseThumbnailURL, setCourseThumbnailURL] = useState('');
//   const [instructor, setInstructor] = useState('');
//   const [duration, setDuration] = useState('');
//   const [isUploading, setIsUploading] = useState(false);

//   useEffect(() => {
//     const fetchCourse = async () => {
//       try {
//         const docRef = doc(db, 'courses', courseId);
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           const courseData = docSnap.data();
//           setCourse(courseData);
//           setCourseName(courseData.courseName);
//           setDescription(courseData.description);
//           setSubCourses(courseData.subCourses || []);
//           setCourseThumbnailURL(courseData.courseThumbnailURL || '');
//           setInstructor(courseData.instructor || '');
//           setDuration(courseData.duration || '');
//         } else {
//           console.log('No such document!');
//         }
//       } catch (error) {
//         console.error('Error fetching course:', error);
//       }
//     };
//     fetchCourse();
//   }, [courseId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (isUploading) {
//         console.log('Please wait for all files to finish uploading.');
//         return;
//       }
//       const courseRef = doc(db, 'courses', courseId);
//       await updateDoc(courseRef, {
//         courseName,
//         description,
//         subCourses,
//         courseThumbnailURL,
//         instructor,
//         duration,
//       });
//       console.log('Course updated successfully');
//     } catch (error) {
//       console.error('Error updating course:', error);
//     }
//   };

//   return (
//     <div>
//       <h2>Edit Course</h2>
//       {course && (
//         <form onSubmit={handleSubmit}>
//           <div>
//             <label htmlFor="courseName">Course Name</label>
//             <input
//               type="text"
//               id="courseName"
//               value={courseName}
//               onChange={(e) => setCourseName(e.target.value)}
//             />
//           </div>
//           <div>
//             <label htmlFor="description">Description</label>
//             <textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </div>
//           <div>
//             <label htmlFor="instructor">Instructor</label>
//             <input
//               type="text"
//               id="instructor"
//               value={instructor}
//               onChange={(e) => setInstructor(e.target.value)}
//             />
//           </div>
//           <div>
//             <label htmlFor="duration">Duration</label>
//             <input
//               type="text"
//               id="duration"
//               value={duration}
//               onChange={(e) => setDuration(e.target.value)}
//             />
//           </div>
//           <button type="submit">Update</button>
//         </form>
//       )}
//     </div>
//   );
// };

// export default EditCourseForm;