import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Avatar, Paper, Button } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
const BASE_URL = "http://localhost:5500";

const DashboardLaboratorist = () => {
  const [technicianData, setTechnicianData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch technician account data with credentials
        const accountRes = await axios.get(`${BASE_URL}/api/lab/account/current`, {
          withCredentials: true
        });
        setTechnicianData(accountRes.data);
        
        // Fetch pending requests count with credentials
        const requestsRes = await axios.get(`${BASE_URL}/api/lab/requests?status=Pending`, {
          withCredentials: true
        });
        setPendingRequests(requestsRes.data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lab Technician Dashboard
      </Typography>
      
      {technicianData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant="h5">{`${technicianData.firstName} ${technicianData.lastName}`}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Lab Technician
                </Typography>
                <Typography variant="body1">
                  {technicianData.hospital?.name || 'Hospital not specified'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {technicianData.email} | {technicianData.contactNumber}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card onClick={() => navigate('/laboratorist/patientList')} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography variant="h6" color="text.secondary">
                    Pending Tests
                  </Typography>
                  <Typography variant="h3">{pendingRequests}</Typography>
                </div>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <MedicalServicesIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardLaboratorist;