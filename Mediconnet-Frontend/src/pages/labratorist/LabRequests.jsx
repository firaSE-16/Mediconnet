import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Button  // Added Button import here
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { format } from 'date-fns';
const BASE_URL = "http://localhost:5500";

const LabRequests = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/lab/requests`, {
          params: {
            status: statusFilter,
            search: searchTerm
          },
          withCredentials: true
        });
        setRequests(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lab requests:', error);
        setLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      fetchRequests();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lab Test Requests
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Search patients..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="">All Statuses</MenuItem>
        </Select>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Fayda ID</TableCell>
              <TableCell>Test Type</TableCell>
              <TableCell>Request Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No requests found</TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request._id} hover>
                  <TableCell>
                    {request.patientID?.firstName} {request.patientID?.lastName}
                  </TableCell>
                  <TableCell>{request.patientID?.faydaID}</TableCell>
                  <TableCell>{request.testType}</TableCell>
                  <TableCell>{format(new Date(request.requestDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status} 
                      color={getStatusColor(request.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/laboratorist/requests/${request._id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LabRequests;