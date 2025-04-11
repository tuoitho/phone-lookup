import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Rating, 
  Divider, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getPhoneDetails, addReview } from '../services/api';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CommentIcon from '@mui/icons-material/Comment';

const PhoneDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phoneData, setPhoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    reviewer_name: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchPhoneDetails = async () => {
      try {
        setLoading(true);
        const data = await getPhoneDetails(id);
        setPhoneData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching phone details:', error);
        setError(error.response?.data?.error || 'Không thể tải thông tin số điện thoại.');
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneDetails();
  }, [id, reviewSuccess]);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (event, newValue) => {
    setNewReview(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.rating) return;

    try {
      setSubmittingReview(true);
      await addReview(id, newReview);
      setNewReview({
        rating: 5,
        comment: '',
        reviewer_name: ''
      });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang tải thông tin...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Quay lại trang tìm kiếm
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Quay lại tìm kiếm
      </Button>

      {phoneData && (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Thông tin số điện thoại
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h4" component="div">
                {phoneData.phone_number}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              {phoneData.reviews && phoneData.reviews.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating 
                    value={phoneData.avgRating} 
                    readOnly 
                    precision={0.5} 
                  />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {phoneData.avgRating.toFixed(1)} ({phoneData.reviews.length} đánh giá)
                  </Typography>
                </Box>
              )}

              {phoneData.name && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, opacity: 0.7 }} />
                  <Typography variant="body1">
                    {phoneData.name}
                  </Typography>
                </Box>
              )}

              {phoneData.address && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 1, opacity: 0.7 }} />
                  <Typography variant="body1">
                    {phoneData.address}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gửi đánh giá của bạn
            </Typography>
            
            <Box component="form" onSubmit={handleSubmitReview}>
              <Box sx={{ mb: 2 }}>
                <FormLabel component="legend">Đánh giá của bạn</FormLabel>
                <Rating
                  name="rating"
                  value={newReview.rating}
                  onChange={handleRatingChange}
                  size="large"
                />
              </Box>
              
              <TextField
                fullWidth
                variant="outlined"
                label="Tên của bạn (tùy chọn)"
                name="reviewer_name"
                value={newReview.reviewer_name}
                onChange={handleReviewChange}
                margin="normal"
              />
              
              <TextField
                fullWidth
                variant="outlined"
                label="Nhận xét của bạn (tùy chọn)"
                name="comment"
                value={newReview.comment}
                onChange={handleReviewChange}
                margin="normal"
                multiline
                rows={3}
              />
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
                
                {reviewSuccess && (
                  <Typography variant="body2" color="success.main" sx={{ ml: 2 }}>
                    Đánh giá đã được gửi thành công!
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>

          {phoneData.reviews && phoneData.reviews.length > 0 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Đánh giá về số điện thoại này
              </Typography>
              
              <List>
                {phoneData.reviews.map((review) => (
                  <React.Fragment key={review.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {review.reviewer_name.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography component="span" variant="subtitle1" sx={{ mr: 1 }}>
                              {review.reviewer_name}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" />
                          </Box>
                        }
                        secondary={
                          <>
                            {review.comment && (
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'block', my: 1 }}
                              >
                                {review.comment}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {new Date(review.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default PhoneDetailPage;
