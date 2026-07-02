import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  CloudUpload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { complaintAPI } from '../services/api';
import { ComplaintRequest, ComplaintType } from '../types';
import LocationPicker from '../components/LocationPicker';

const ComplaintForm: React.FC = () => {
  const [formData, setFormData] = useState<ComplaintRequest>({
    title: '',
    description: '',
    type: ComplaintType.INFRASTRUCTURE,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    imageUrls: [],
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const navigate = useNavigate();

  // Get complaint types
  useQuery({
    queryKey: ['complaintTypes'],
    queryFn: () => complaintAPI.getComplaintTypes(),
  });

  // Create complaint mutation
  const createComplaintMutation = useMutation({
    mutationFn: (data: ComplaintRequest) => complaintAPI.createComplaint(data),
    onSuccess: () => {
      setSuccess('Complaint submitted successfully!');
      setTimeout(() => {
        navigate('/citizen');
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setFormData({
      ...formData,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);

        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();
        setUploadProgress(((index + 1) / files.length) * 100);
        return result.fileUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData({
        ...formData,
        imageUrls: [...(formData.imageUrls || []), ...uploadedUrls],
      });
    } catch (err) {
      setError('Failed to upload files: ' + (err as Error).message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageUrlAdd = () => {
    setFormData({
      ...formData,
      imageUrls: [...(formData.imageUrls || []), ''],
    });
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...(formData.imageUrls || [])];
    newImageUrls[index] = value;
    setFormData({
      ...formData,
      imageUrls: newImageUrls,
    });
  };

  const handleImageUrlRemove = (index: number) => {
    const newImageUrls = formData.imageUrls?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      imageUrls: newImageUrls,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    createComplaintMutation.mutate(formData);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Report New Issue
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Submit a new civic issue or complaint
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Issue Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief description of the issue"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel id="type-label">Issue Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formData.type}
                  label="Issue Type"
                  onChange={handleSelectChange}
                >
                  {Object.values(ComplaintType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={12}>
              <TextField
                required
                fullWidth
                id="description"
                label="Detailed Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about the issue..."
              />
            </Grid>

            {/* Location Picker */}
            <Grid size={12}>
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={{
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                  address: formData.address,
                }}
              />
            </Grid>

            {/* Additional Location Fields */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                id="city"
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                id="state"
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                id="zipCode"
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </Grid>

            {/* File Upload */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Supporting Images
              </Typography>
              
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="file-upload"
                      multiple
                      type="file"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUpload />}
                        disabled={uploading}
                      >
                        Upload Images
                      </Button>
                    </label>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Upload images from your device
                    </Typography>
                  </Box>
                  
                  {uploading && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Uploading... {uploadProgress.toFixed(0)}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Manual Image URL Entry */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Or add image URLs manually:
              </Typography>
              
              {formData.imageUrls?.map((url, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size="auto">
                        <TextField
                          fullWidth
                          label={`Image URL ${index + 1}`}
                          value={url}
                          onChange={(e) => handleImageUrlChange(index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </Grid>
                      <Grid size="auto">
                        <IconButton
                          onClick={() => handleImageUrlRemove(index)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              <Button
                startIcon={<Add />}
                onClick={handleImageUrlAdd}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Add Image URL
              </Button>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/citizen')}
                  disabled={createComplaintMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createComplaintMutation.isPending}
                >
                  {createComplaintMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ComplaintForm;
