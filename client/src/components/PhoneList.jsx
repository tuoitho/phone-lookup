import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  Typography,
  Divider,
  Box,
  Rating,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const PhoneList = ({ phones }) => {
  return (
    <Paper variant="outlined">
      <List sx={{ width: '100%' }}>
        {phones.map((phone, index) => (
          <React.Fragment key={phone.id}>
            {index > 0 && <Divider />}
            <ListItem 
              component={Link} 
              to={`/phone/${phone.id}`}
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <PhoneIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="span">
                      {phone.phone_number}
                    </Typography>
                    {phone.avgRating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                        <Rating value={phone.avgRating} readOnly size="small" precision={0.5} />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          ({phone.avgRating.toFixed(1)})
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    {phone.name && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, fontSize: '0.875rem', opacity: 0.7 }} />
                        <Typography variant="body2" component="span">
                          {phone.name}
                        </Typography>
                      </Box>
                    )}
                    {phone.address && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 1, fontSize: '0.875rem', opacity: 0.7 }} />
                        <Typography variant="body2" component="span">
                          {phone.address}
                        </Typography>
                      </Box>
                    )}
                    {phone.reviews && phone.reviews.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`${phone.reviews.length} đánh giá`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default PhoneList;
