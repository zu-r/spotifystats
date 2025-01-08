// client/src/App.js
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';
import UploadPage from './pages/UploadPage';
import StatsPage from './pages/StatsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1DB954', // Spotify green
    },
    secondary: {
      main: '#191414', // Spotify black
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('upload');

  const handleUploadSuccess = () => {
    setCurrentPage('stats');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        {currentPage === 'upload' ? (
          <UploadPage onUploadSuccess={handleUploadSuccess} />
        ) : (
          <StatsPage onUploadMore={() => setCurrentPage('upload')} />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;