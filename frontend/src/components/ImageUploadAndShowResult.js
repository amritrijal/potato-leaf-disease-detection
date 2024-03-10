import { useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { Button } from '@material-ui/core';
import { SyncLoader } from 'react-spinners';
import './ImageStyle.css';

const ImageUploadAndShowResult = forwardRef((props, ref) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectFileUrl, setSelectedFileUrl] = useState(null);
  const [result, setResult] = useState({ class: '', confidence: '' });
  const [loading, setLoading] = useState(false);
  const [pesticideRecommendation, setPesticideRecommendation] = useState('');

  // Expose the selectedFile and checkBtnHandle to the parent component
  useImperativeHandle(ref, () => ({
    selectedFile,
    checkBtnHandle
  }));

  const checkBtnHandle = async () => {
    if (!selectedFile) {
      // If no file is selected, return early and do nothing
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      let res = await axios({
        method: 'post',
        url: 'http://localhost:8001/predict',
        data: formData,
      });
      setResult({ class: res.data.class, confidence: res.data.confidence });
      console.log(typeof res.data.confidence)

      if (res.data.confidence > 0.90) {

        if (res.data.class.toLowerCase() === 'early blight') {
          setPesticideRecommendation('Use pesticide like "saaf"');
        } else if (res.data.class.toLowerCase() === 'late blight') {
          setPesticideRecommendation('Use pesticide "dyphane M-45"');
        } else {
          setPesticideRecommendation('The plant is healthy, no pesticide needed.');
        }
      }

    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const MAX_FILE_SIZE_MB = 7;

  const fileChangeHandle = (e) => {
    const selectedFile = e.target.files[0];

    // Check if a file is selected
    if (!selectedFile) {
      return;
    }

    // Check file size
    const fileSizeMB = selectedFile.size / (1024 * 1024); // Convert bytes to MB
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert(`File size exceeds the maximum limit of ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    // Check file extension
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
    if (fileExtension !== 'jpg') {
      alert('Only .jpg file format is allowed.');
      return;
    }

    setSelectedFile(selectedFile);

    const fileReader = new FileReader();
    fileReader.readAsDataURL(selectedFile);
    fileReader.addEventListener('load', (e) => setSelectedFileUrl(fileReader.result));
  };


  return (
    <div className='imageupload_container'>
      <input onChange={fileChangeHandle} type='file' accept='.jpg' name='file' placeholder='Select leaf image' />
      <Button onClick={checkBtnHandle} variant='contained' color='primary'>
        Check
      </Button>

      {selectFileUrl && <img className='imageupload_container_image' src={selectFileUrl} alt='selected file' />}

      {loading && <SyncLoader loading color='blue' />}

      {result.class && <h1>Predicted: {result.class}</h1>}
      {result.confidence && result.confidence > 0.9 && <h1>Confidence: {result.confidence}</h1>}
      {pesticideRecommendation && result.confidence > 0.9 && <h1>Pesticide: {pesticideRecommendation}</h1>}
    </div>
  );
});

export default ImageUploadAndShowResult;
