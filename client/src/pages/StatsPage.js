// client/src/pages/StatsPage.js
import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Button 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const StatsPage = ({ onUploadMore }) => {
  const [topArtists, setTopArtists] = useState([]);
  const [timePatterns, setTimePatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [artistsRes, patternsRes] = await Promise.all([
        fetch('http://localhost:3001/api/stats/top-artists'),
        fetch('http://localhost:3001/api/stats/time-patterns')
      ]);

      const artists = await artistsRes.json();
      const patterns = await patternsRes.json();

      setTopArtists(artists);
      setTimePatterns(patterns);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAdditionalFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      // Refresh stats after successful upload
      await fetchStats();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Your Listening Statistics
        </Typography>
        
        <input
          type="file"
          accept=".json"
          onChange={handleAdditionalFileUpload}
          style={{ display: 'none' }}
          id="additional-file-input"
        />
        <label htmlFor="additional-file-input">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
          >
            Add More Data
          </Button>
        </label>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top Artists
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topArtists}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="artist_name" angle={-45} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="play_count" fill="#1DB954" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Listening Patterns by Hour
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timePatterns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="play_count" fill="#1DB954" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default StatsPage;