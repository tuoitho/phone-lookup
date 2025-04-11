import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline, Container, AppBar, Toolbar, Typography, Box, Alert } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone';
import './App.css'

// Pages
import HomePage from './pages/HomePage'
import PhoneDetailPage from './pages/PhoneDetailPage'

// Services
import { checkServerHealth } from './services/api'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    const checkServer = async () => {
      try {
        await checkServerHealth();
        setServerStatus('online');
      } catch (error) {
        console.error('Server health check failed:', error);
        setServerStatus('offline');
      }
    };

    checkServer();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <PhoneIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              PhoneLookup
            </Typography>
          </Toolbar>
        </AppBar>
        
        {serverStatus === 'offline' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối hoặc khởi động server.
          </Alert>
        )}

        <Box component="main" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/phone/:id" element={<PhoneDetailPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Box>

        <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', mt: 'auto' }}>
          <Container maxWidth="sm">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} PhoneLookup - CCVMTPTPM
            </Typography>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App
