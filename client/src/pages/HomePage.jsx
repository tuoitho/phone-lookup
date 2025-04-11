import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import SearchBar from '../components/SearchBar';

const HomePage = () => {
  return (
    <Container>
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tra cứu thông tin số điện thoại
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Nhập số điện thoại để tìm kiếm thông tin và xem đánh giá từ người dùng
        </Typography>
      </Box>

      <SearchBar />
      
      <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          Về dịch vụ tra cứu số điện thoại
        </Typography>
        <Typography paragraph>
          Dịch vụ này giúp bạn tìm kiếm thông tin về số điện thoại, xem đánh giá từ người dùng khác và chia sẻ trải nghiệm của riêng bạn.
        </Typography>
        <Typography paragraph>
          Bạn có thể tìm kiếm bằng số điện thoại hoặc tên người dùng. Các đánh giá được cung cấp bởi cộng đồng người dùng.
        </Typography>
      </Paper>
    </Container>
  );
};

export default HomePage;
