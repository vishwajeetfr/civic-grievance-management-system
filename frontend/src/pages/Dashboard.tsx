import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
  LinearProgress,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  List,
  AdminPanelSettings,
  Map,
  Report,
  CheckCircle,
  Build,
  Pending,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { complaintAPI } from '../services/api';
import { Role, ComplaintStatus } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch complaint statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['complaintStats'],
    queryFn: () => complaintAPI.getComplaintStats(),
  });

  // Fetch user's recent complaints
  const { data: recentComplaints } = useQuery({
    queryKey: ['recentComplaints'],
    queryFn: () => complaintAPI.getMyComplaints(0, 5, 'createdAt', 'desc'),
    enabled: !!user,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

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

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return <Pending />;
      case ComplaintStatus.IN_PROGRESS:
        return <Build />;
      case ComplaintStatus.RESOLVED:
        return <CheckCircle />;
      case ComplaintStatus.REJECTED:
        return <Report />;
      default:
        return <Pending />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const totalComplaints = stats?.data?.totalComplaints || 0;
  const resolvedComplaints = stats?.data?.resolvedComplaints || 0;
  const resolutionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {getGreeting()}, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome to the Civic Issue Reporting System
        </Typography>
      </Box>

      {/* Statistics Overview */}
      {statsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Total Complaints
                    </Typography>
                    <Typography variant="h4">
                      {stats?.data?.totalComplaints || 0}
                    </Typography>
                  </Box>
                  <Report color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {stats?.data?.pendingComplaints || 0}
                    </Typography>
                  </Box>
                  <Pending color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography color="text.secondary" gutterBottom>
                      In Progress
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      {stats?.data?.inProgressComplaints || 0}
                    </Typography>
                  </Box>
                  <Build color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Resolved
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {stats?.data?.resolvedComplaints || 0}
                    </Typography>
                  </Box>
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Resolution Rate */}
      {stats && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resolution Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={resolutionRate}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h6">
                  {resolutionRate.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {resolvedComplaints} of {totalComplaints} complaints resolved
            </Typography>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Add color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Report Issue</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Submit a new civic issue or complaint
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/complaint/new')}
                    disabled={user?.role !== Role.CITIZEN && user?.role !== Role.ADMIN}
                  >
                    Report Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <List color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">My Complaints</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    View and track your submitted complaints
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/citizen')}
                    disabled={user?.role !== Role.CITIZEN && user?.role !== Role.ADMIN}
                  >
                    View All
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {user?.role === Role.ADMIN && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <AdminPanelSettings color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Admin Panel</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Manage all complaints and system administration
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate('/admin')}>
                      Manage
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Map color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Public Heatmap</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    View complaint distribution across the city
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate('/heatmap')}>
                    View Map
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Complaints */}
          {recentComplaints && recentComplaints.data.content && recentComplaints.data.content.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Your Recent Complaints
              </Typography>
              <Grid container spacing={2}>
                {recentComplaints.data.content.slice(0, 3).map((complaint) => (
                  <Grid size={12} key={complaint.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="h3">
                            {complaint.title}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(complaint.status)}
                            label={complaint.status.replace('_', ' ')}
                            color={getStatusColor(complaint.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {complaint.description.substring(0, 100)}...
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Submitted {formatDate(complaint.createdAt)}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          onClick={() => navigate(`/complaint/${complaint.id}`)}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {recentComplaints.data.content.length > 3 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button onClick={() => navigate('/citizen')}>
                    View All Complaints
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Grid>

        {/* User Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Profile
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">
                {user?.name}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {user?.email}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {user?.role?.toLowerCase()}
              </Typography>
            </Box>
            {user?.city && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">
                  {user?.city}, {user?.state}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* System Status */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">System Health</Typography>
                <Typography variant="body2" color="success.main">Operational</Typography>
              </Box>
              <LinearProgress variant="determinate" value={100} color="success" />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Response Time</Typography>
                <Typography variant="body2" color="success.main">Fast</Typography>
              </Box>
              <LinearProgress variant="determinate" value={95} color="success" />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Uptime</Typography>
                <Typography variant="body2" color="success.main">99.9%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={99.9} color="success" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
