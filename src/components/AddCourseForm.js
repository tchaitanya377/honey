import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
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
  
  
  // const handleSubmit = async () => {
  //   try {
  //     // Check if any file is still uploading
  //     if (isUploading) {
  //       setAlertMessage('Please wait for all files to finish uploading.');
  //       setShowAlert(true);
  //       return;
  //     }
  
  //     const courseData = {
  //       courseName,
  //       description,
  //       courseThumbnailURL, // Add course thumbnail URL here
  //       subCourses
  //     };
  
  //     // Map over subCourses to include additionalContents
  //     const formattedSubCourses = subCourses.map(subCourse => ({
  //       ...subCourse,
  //       additionalContents: subCourse.additionalContents.map(content => ({
  //         type: content.type,
  //         value: content.value // URL fetched from storage
  //       }))
  //     }));
  
  //     courseData.subCourses = formattedSubCourses;
  
  //     await addDoc(collection(db, 'courses'), courseData);
  
  //     setAlertMessage('Course added successfully');
  //     setShowAlert(true);
  
  //     setCourseName('');
  //     setDescription('');
  //     setCourseThumbnailURL(''); // Reset course thumbnail URL
  //     setSubCourses([{ name: '', description: '', additionalContents: [], topics: [] }]);
  //     setCurrentStep(1);
  //   } catch (error) {
  //     setAlertMessage('Error adding course. Please try again.');
  //     setShowAlert(true);
  //     console.error('Error adding course:', error);
  //   }
  // };

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
                  type="text"
                  placeholder="Video URL"
                  className="w-full border border-gray-300 rounded p-2"
                  value={content.value}
                  onChange={(e) => {
                    const updatedSubCourses = [...subCourses];
                    updatedSubCourses[index].additionalContents[contentIndex].value = e.target.value;
                    setSubCourses(updatedSubCourses);
                  }}
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
                onClick={() => handleRemoveAdditionalContent(index, contentIndex)}
                className="ml-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddAdditionalContent(index)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            Add Additional Content
          </button>
          {subCourses.length > 1 && <button type="button" onClick={() => handleRemoveSubCourse(index)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Remove Sub Course</button>}
        </div>
      ))}
      <button onClick={handlePreviousStep} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">Previous</button>
      <button onClick={handleNextStep} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Next</button>
    </div>
  );

  const renderStepThree = () => (
        <div>
          <h2 className="text-2xl font-bold mb-4">Step 3: Add Topics</h2>
          {subCourses.map((subCourse, subCourseIndex) => (
            <div key={subCourseIndex} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Sub Course {subCourseIndex + 1}</h3>
              {subCourse.topics.map((topic, topicIndex) => (
                <div key={topicIndex} className="mb-2">
                  <input
                    type="text"
                    placeholder={`Topic ${topicIndex + 1} Name`}
                    className="w-full border border-gray-300 rounded p-2 mb-1"
                    value={topic.name}
                    onChange={(e) => {
                      const updatedSubCourses = [...subCourses];
                      updatedSubCourses[subCourseIndex].topics[topicIndex].name = e.target.value;
                      setSubCourses(updatedSubCourses);
                    }}
                    required
                  />
                  <select
                    value={topic.source}
                    onChange={(e) => {
                      const updatedSubCourses = [...subCourses];
                      updatedSubCourses[subCourseIndex].topics[topicIndex].source = e.target.value;
                      setSubCourses(updatedSubCourses);
                    }}
                    className="border border-gray-300 rounded p-2 mb-2"
                  >
                    <option value="file">Upload Video</option>
                    <option value="url">Video URL</option>
                    <option value="both">Both</option>
                  </select>
                  {topic.source === 'file' && (
                    <input
                      type="file"
                      accept="video/*"
                      className="mb-2"
                      onChange={(e) => handleVideoUpload(e, subCourseIndex, topicIndex)}
                      required
                    />
                  )}
                  {topic.source === 'url' && (
                    <input
                      type="text"
                      placeholder="Video URL"
                      className="w-full border border-gray-300 rounded p-2"
                      value={topic.videoUrl}
                      onChange={(e) => {
                        const updatedSubCourses = [...subCourses];
                        updatedSubCourses[subCourseIndex].topics[topicIndex].videoUrl = e.target.value;
                        setSubCourses(updatedSubCourses);
                      }}
                      required
                    />
                  )}
                  {topic.source === 'both' && (
                    <div>
                      <input
                        type="file"
                        accept="video/*"
                        className="mb-2"
                        onChange={(e) => handleVideoUpload(e, subCourseIndex, topicIndex)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Video URL"
                        className="w-full border border-gray-300 rounded p-2"
                        value={topic.videoUrl}
                        onChange={(e) => {
                          const updatedSubCourses = [...subCourses];
                          updatedSubCourses[subCourseIndex].topics[topicIndex].videoUrl = e.target.value;
                          setSubCourses(updatedSubCourses);
                        }}
                        required
                      />
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => handleAddTopic(subCourseIndex)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">Add Topic</button>
              {subCourse.topics.length > 1 && <button type="button" onClick={() => handleRemoveTopic(subCourseIndex)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Remove Topic</button>}
            </div>
          ))}
          <button onClick={handlePreviousStep} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">Previous</button>
          <button onClick={handleNextStep} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Next</button>
        </div>
      );

  const renderStepFour = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Step 4: Confirm and Submit</h2>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Course Details</h3>
        <p><strong>Course Name:</strong> {courseName}</p>
        <p><strong>Description:</strong> {description}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Sub Courses and Topics</h3>
        {subCourses.map((subCourse, index) => (
          <div key={index} className="mb-4">
            <h4 className="text-xl font-semibold mb-2">Sub Course {index + 1}</h4>
            <p><strong>Name:</strong> {subCourse.name}</p>
            <p><strong>Description:</strong> {subCourse.description}</p>
            <p><strong>Topics:</strong></p>
            <ul>
              {subCourse.topics.map((topic, topicIndex) => (
                <li key={topicIndex}>
                  {topic.name} - {topic.videoUrl ? 'Uploaded' : 'Not Uploaded'}
                </li>
              ))}
            </ul>
            <p><strong>Additional Contents:</strong></p>
            <ul>
              {subCourse.additionalContents.map((content, contentIndex) => (
                <li key={contentIndex}>
                  {content.type} - {content.value ? 'Uploaded' : 'Not Uploaded'}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button onClick={handleAddSubCourse} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">Add Sub Course</button>
    <button onClick={handlePreviousStep} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">Previous</button>
       <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Submit</button>
    </div>
  );
  const renderAdditionalContent = (subCourseIndex, contentIndex) => {
    const content = subCourses[subCourseIndex].additionalContents[contentIndex];
    if (content.type === 'recordings') {
      return (
        <input
          type="text"
          placeholder="Video URL"
          className="w-full border border-gray-300 rounded p-2"
          value={content.value}
          onChange={(e) => handleAdditionalContentChange(subCourseIndex, contentIndex, e.target.value)}
          required
        />
      );
    } else {
      return (
        <input
          type="file"
          className="w-full border border-gray-300 rounded p-2"
          onChange={(e) => handleFileUpload(e, subCourseIndex, contentIndex, false)}
          required
        />
      );
    }
  };

  const renderSubCourse = (subCourse, subCourseIndex) => (
    <div key={subCourseIndex} className="mb-4">
      <h4 className="text-xl font-semibold mb-2">Sub Course {subCourseIndex + 1}</h4>
      <p><strong>Name:</strong> {subCourse.name}</p>
      <p><strong>Description:</strong> {subCourse.description}</p>
      <p><strong>Topics:</strong></p>
      {subCourse.topics.map((topic, topicIndex) => (
        <div key={topicIndex} className="mb-2">
          {/* Render topic details */}
        </div>
      ))}
      <p><strong>Additional Contents:</strong></p>
      {subCourse.additionalContents.map((content, contentIndex) => (
        <div key={contentIndex} className="flex items-center mb-1">
          {/* Render additional content */}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      {currentStep === 1 && renderStepOne()}
      {currentStep === 2 && renderStepTwo()}
      {currentStep === 3 && renderStepThree()}
      {currentStep === 4 && renderStepFour()}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4">
            <p className="text-lg font-semibold">{alertMessage}</p>
            <button onClick={() => setShowAlert(false)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourseForm;
