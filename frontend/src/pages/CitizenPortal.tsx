import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Add,
  Visibility,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { complaintAPI } from '../services/api';
import { ComplaintStatus, ComplaintType } from '../types';

const CitizenPortal: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const navigate = useNavigate();

  // Fetch user's complaints
  const { data: complaintsData, isLoading, error } = useQuery({
    queryKey: ['myComplaints', page, size, statusFilter, typeFilter, searchTerm],
    queryFn: () => complaintAPI.getMyComplaints(page, size, 'createdAt', 'desc'),
  });

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return 'warning';
      case ComplaintStatus.IN_PROGRESS:
        return 'info';
      case ComplaintStatus.RESOLVED:
        return 'success';
      case ComplaintStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: ComplaintType) => {
    const colors = {
      [ComplaintType.INFRASTRUCTURE]: 'primary',
      [ComplaintType.HEALTHCARE]: 'secondary',
      [ComplaintType.SANITATION]: 'success',
      [ComplaintType.SAFETY]: 'error',
      [ComplaintType.TRANSPORTATION]: 'info',
      [ComplaintType.EDUCATION]: 'warning',
      [ComplaintType.ENVIRONMENT]: 'success',
      [ComplaintType.UTILITIES]: 'primary',
      [ComplaintType.OTHER]: 'default',
    };
    return colors[type] || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const filteredComplaints = complaintsData?.data?.content?.filter((complaint) => {
    const matchesStatus = !statusFilter || complaint.status === statusFilter;
    const matchesType = !typeFilter || complaint.type === typeFilter;
    const matchesSearch = !searchTerm || 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load complaints. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            My Complaints
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/complaint/new')}
          >
            Report New Issue
          </Button>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          View and track your submitted complaints
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.values(ComplaintStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {Object.values(ComplaintType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setStatusFilter('');
                  setTypeFilter('');
                  setSearchTerm('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No complaints found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm || statusFilter || typeFilter
                ? 'Try adjusting your filters or search terms.'
                : 'You haven\'t submitted any complaints yet.'}
            </Typography>
            {!searchTerm && !statusFilter && !typeFilter && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/complaint/new')}
              >
                Report Your First Issue
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredComplaints.map((complaint) => (
              <Grid size={12} key={complaint.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2">
                        {complaint.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={complaint.status.replace('_', ' ')}
                          color={getStatusColor(complaint.status) as any}
                          size="small"
                        />
                        <Chip
                          label={complaint.type.replace('_', ' ')}
                          color={getTypeColor(complaint.type) as any}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {complaint.description.length > 200
                        ? `${complaint.description.substring(0, 200)}...`
                        : complaint.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Submitted: {formatDate(complaint.createdAt)}
                        </Typography>
                        {complaint.resolvedAt && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            Resolved: {formatDate(complaint.resolvedAt)}
                          </Typography>
                        )}
                      </Box>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/complaint/${complaint.id}`)}
                      >
                        View Details
                      </Button>
                    </Box>

                    {complaint.address && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Location: {complaint.address}
                          {complaint.city && `, ${complaint.city}`}
                          {complaint.state && `, ${complaint.state}`}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {complaintsData && complaintsData.data.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={complaintsData.data.totalPages}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CitizenPortal;
