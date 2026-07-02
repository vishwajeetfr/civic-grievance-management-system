import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  LocationOn,
  Person,
  Schedule,
  CheckCircle,
  Pending,
  Build,
  Cancel,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { complaintAPI } from '../services/api';
import { ComplaintStatus, ComplaintType } from '../types';
import { useAuth } from '../contexts/AuthContext';

const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintAPI.getComplaintById(Number(id)),
    enabled: !!id,
  });

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return <Pending color="warning" />;
      case ComplaintStatus.IN_PROGRESS:
        return <Build color="info" />;
      case ComplaintStatus.RESOLVED:
        return <CheckCircle color="success" />;
      case ComplaintStatus.REJECTED:
        return <Cancel color="error" />;
      default:
        return <Pending />;
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !complaint) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load complaint details. Please try again.
        </Alert>
      </Container>
    );
  }

  // Check if user has access to this complaint
  if (user?.role !== 'ADMIN' && complaint.data.user.id !== user?.id) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          You don't have permission to view this complaint.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {complaint.data.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            icon={getStatusIcon(complaint.data.status)}
            label={complaint.data.status.replace('_', ' ')}
            color={getStatusColor(complaint.data.status) as any}
          />
          <Chip
            label={complaint.data.type.replace('_', ' ')}
            color={getTypeColor(complaint.data.type) as any}
            variant="outlined"
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {complaint.data.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Location Information */}
          {(complaint.data.address || complaint.data.city || complaint.data.state) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Location
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {complaint.data.address && (
                    <Box>
                      <strong>Address:</strong> {complaint.data.address}
                    </Box>
                  )}
                  {(complaint.data.city || complaint.data.state || complaint.data.zipCode) && (
                    <Box sx={{ mt: 1 }}>
                      {complaint.data.city && complaint.data.state ? (
                        <>{complaint.data.city}, {complaint.data.state}</>
                      ) : (
                        <>{complaint.data.city || complaint.data.state}</>
                      )}
                      {complaint.data.zipCode && ` ${complaint.data.zipCode}`}
                    </Box>
                  )}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Images */}
          {complaint.data.images && complaint.data.images.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Supporting Images
                </Typography>
                <Grid container spacing={2}>
                  {complaint.data.images.map((image, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                      <Paper
                        sx={{
                          p: 1,
                          textAlign: 'center',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => window.open(image.imageUrl, '_blank')}
                      >
                        <img
                          src={image.imageUrl}
                          alt={`Supporting evidence ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {image.imageName || `Image ${index + 1}`}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Admin Notes */}
          {complaint.data.adminNotes && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Admin Notes
                </Typography>
                <Typography variant="body1">
                  {complaint.data.adminNotes}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Status Timeline */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status Timeline
              </Typography>
              <Timeline>
                {complaint.data.updates?.map((update, index) => (
                  <TimelineItem key={update.id}>
                    <TimelineSeparator>
                      <TimelineDot color={getStatusColor(update.newStatus) as any}>
                        {getStatusIcon(update.newStatus)}
                      </TimelineDot>
                      {index < (complaint.data.updates?.length || 0) - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(update.createdAt)}
                      </Typography>
                      <Typography variant="body2">
                        {update.message}
                      </Typography>
                      {update.updatedBy && (
                        <Typography variant="caption" color="text.secondary">
                          by {update.updatedBy.name}
                        </Typography>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </Card>

          {/* Complaint Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Complaint Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Submitted by
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {complaint.data.user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {complaint.data.user.email}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Submitted
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {formatDate(complaint.data.createdAt)}
                </Typography>
              </Box>

              {complaint.data.resolvedAt && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircle sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Resolved
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {formatDate(complaint.data.resolvedAt)}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ComplaintDetails;
