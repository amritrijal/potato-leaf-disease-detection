import React, { useState, useRef } from 'react';
import ImageUploadAndShowResult from './components/ImageUploadAndShowResult';
import './HomeStyle.css';

export const ImageUpload = () => {
  const imageRefs = useRef([]);

  const handleCheckAll = () => {
    const totalImages = imageRefs.current.length;

    const checkNextImage = async (index) => {
      if (index < totalImages) {
        const imageRef = imageRefs.current[index];
        if (imageRef.selectedFile) {
          await imageRef.checkBtnHandle();
        }
        checkNextImage(index + 1);
      }
    };

    checkNextImage(0);
  };

  return (
    <>
      <div className='app-container'>
        <h1 className='header'>Potato Leaf Disease Detection</h1>

        <div className='column4'>
          {new Array(16).fill('a').map((_, index) => (
            <ImageUploadAndShowResult
              key={index}
              ref={(ref) => (imageRefs.current[index] = ref)}
              acceptedFileTypes={['.jpg']}
            />
          ))}
        </div>

        <div className='check-all-button-container'>
          <button onClick={handleCheckAll}>Check All</button>
        </div>
      </div>
    </>
  );
};
