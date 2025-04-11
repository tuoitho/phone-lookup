import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Container
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { searchPhones } from '../services/api';
import PhoneList from './PhoneList';
import { toast } from 'react-toastify';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // only phone 10 digits
    if (!/^\d{10}$/.test(query)) {
      toast.error('Số điện thoại phải có 10 chữ số!');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchPhones(query);
      setPhones(results);
      setSearched(true);
    } catch (error) {
      console.error('Error searching phones:', error);
      setError(error.response?.data?.error || 'Có lỗi xảy ra khi tìm kiếm.');
      setPhones([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Tra cứu thông tin số điện thoại
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Nhập số điện thoại cần tra cứu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ mr: 1 }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={loading || !query.trim()}
            sx={{ minWidth: '120px' }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {searched && !loading && phones.length === 0 && !error && (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Không tìm thấy kết quả nào phù hợp.
          </Typography>
        )}

        {phones.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kết quả tìm kiếm:
            </Typography>
            <PhoneList phones={phones} />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SearchBar;
