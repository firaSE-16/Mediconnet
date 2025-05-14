import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';
const BASE_URL = "http://localhost:5500";

const LabForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    testValue: '',
    normalRange: '',
    interpretation: '',
    notes: '',
    status: 'Pending'
  });

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/lab/requests/${id}`, {
          withCredentials: true
        });
        setRequest(res.data);
        setFormData({
          testValue: res.data.results?.testValue || '',
          normalRange: res.data.results?.normalRange || '',
          interpretation: res.data.results?.interpretation || '',
          notes: res.data.results?.notes || '',
          status: res.data.status
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lab request:', error);
        setLoading(false);
      }
    };
    
    fetchRequest();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axios.put(`${BASE_URL}/api/lab/requests/${id}`, formData, {
        withCredentials: true
      });
      navigate('/laboratorist/patientList');
    } catch (error) {
      console.error('Error updating lab results:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!request) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Lab request not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lab Test Details
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Patient Information</Typography>
              <Typography>
                <strong>Name:</strong> {request.patientID?.firstName} {request.patientID?.lastName}
              </Typography>
              <Typography>
                <strong>Fayda ID:</strong> {request.patientID?.faydaID}
              </Typography>
              <Typography>
                <strong>Gender:</strong> {request.patientID?.gender}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Test Information</Typography>
              <Typography>
                <strong>Test Type:</strong> {request.testType}
              </Typography>
              <Typography>
                <strong>Requested by:</strong> Dr. {request.doctorID?.firstName} {request.doctorID?.lastName}
              </Typography>
              <Typography>
                <strong>Status:</strong> 
                <Chip 
                  label={request.status} 
                  color={
                    request.status === 'Pending' ? 'warning' : 
                    request.status === 'In Progress' ? 'info' : 'success'
                  } 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Test Results
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Test Value"
                  name="testValue"
                  value={formData.testValue}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Normal Range"
                  name="normalRange"
                  value={formData.normalRange}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Interpretation"
                  name="interpretation"
                  value={formData.interpretation}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    type="submit" 
                    disabled={submitting}
                    sx={{ mr: 2 }}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Save Results'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/laboratorist/patientList')}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LabForm;