// client/src/pages/UploadPage.js
import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Alert,
  LinearProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadPage = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    
    if (droppedFile?.type !== 'application/json') {
      setError('Please upload a JSON file');
      return;
    }

    setFile(droppedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      console.log('Upload successful:', data);
      
      // Reset state after successful upload
      setFile(null);
      setUploadProgress(100);
      
      // Transition to stats page
      onUploadSuccess();
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Spotify Stats Analyzer
      </Typography>
      
      <Paper 
        sx={{ 
          mt: 2, 
          p: 3, 
          border: '2px dashed #ccc',
          textAlign: 'center',
          cursor: 'pointer'
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleFileDrop}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
          >
            Choose File
          </Button>
        </label>
        
        <Typography>
          {file ? `Selected: ${file.name}` : 'Drag and drop your Spotify JSON file here'}
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {file && !uploading && (
        <Button
          variant="contained"
          onClick={handleUpload}
          sx={{ mt: 2 }}
          fullWidth
        >
          Upload and Analyze
        </Button>
      )}

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}
    </Box>
  );
};

UploadPage.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
};

UploadPage.defaultProps = {
  onUploadSuccess: () => {},
};

export default UploadPage;