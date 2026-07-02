import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import { complaintAPI } from "../services/api";
import { Complaint, ComplaintStatus } from "../types";

const GoogleMap: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = () => {
      const mapElement = document.getElementById("map");
      if (!mapElement) return;

      const defaultCenter = { lat: 40.7128, lng: -74.006 };

      const newMap = new google.maps.Map(mapElement, {
        zoom: 12,
        center: defaultCenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });

      setMap(newMap);
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Load Google Maps API if not already loaded
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=visualization`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!map || !complaints.length) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    complaints.forEach((complaint) => {
      if (complaint.latitude && complaint.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: complaint.latitude, lng: complaint.longitude },
          map: map,
          title: complaint.title,
          icon: {
            url: getMarkerIcon(complaint.status),
            scaledSize: new google.maps.Size(32, 32),
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px;">${
                complaint.title
              }</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                ${complaint.type.replace(
                  "_",
                  " "
                )} - ${complaint.status.replace("_", " ")}
              </p>
              <p style="margin: 0; font-size: 11px; color: #888;">
                ${complaint.description.substring(0, 100)}...
              </p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
        bounds.extend(marker.getPosition()!);
      }
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, complaints, markers]);

  const getMarkerIcon = (status: ComplaintStatus) => {
    const colors = {
      [ComplaintStatus.PENDING]: "#ff9800",
      [ComplaintStatus.IN_PROGRESS]: "#2196f3",
      [ComplaintStatus.RESOLVED]: "#4caf50",
      [ComplaintStatus.REJECTED]: "#f44336",
    };

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="${
          colors[status] || "#666"
        }" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="4" fill="white"/>
      </svg>
    `)}`;
  };

  return (
    <Box
      id="map"
      sx={{
        width: "100%",
        height: "500px",
        borderRadius: 1,
        overflow: "hidden",
      }}
    />
  );
};

const PublicHeatmap: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch complaints for heatmap
  const {
    data: complaints,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["heatmapComplaints", statusFilter],
    queryFn: () => complaintAPI.getComplaintsForHeatmap(),
  });

  // Fetch complaint statistics
  const { data: stats } = useQuery({
    queryKey: ["complaintStats"],
    queryFn: () => complaintAPI.getComplaintStats(),
  });

  const filteredComplaints =
    complaints?.data?.filter((complaint) => {
      if (!statusFilter) return true;
      return complaint.status === statusFilter;
    }) || [];

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return "warning";
      case ComplaintStatus.IN_PROGRESS:
        return "info";
      case ComplaintStatus.RESOLVED:
        return "success";
      case ComplaintStatus.REJECTED:
        return "error";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load heatmap data. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Public Heatmap
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View complaint distribution across the city
        </Typography>
      </Box>

      {/* Statistics */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Complaints
                </Typography>
                <Typography variant="h4">
                  {stats.data.totalComplaints}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.data.pendingComplaints}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h4" color="info.main">
                  {stats.data.inProgressComplaints}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Resolved
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.data.resolvedComplaints}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Map Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.values(ComplaintStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`Total: ${filteredComplaints.length}`}
                  color="primary"
                  variant="outlined"
                />
                {Object.values(ComplaintStatus).map((status) => {
                  const count = filteredComplaints.filter(
                    (c) => c.status === status
                  ).length;
                  if (count === 0) return null;
                  return (
                    <Chip
                      key={status}
                      label={`${status.replace("_", " ")}: ${count}`}
                      color={getStatusColor(status) as any}
                      variant="outlined"
                      size="small"
                    />
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Complaint Distribution Map
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click on markers to view complaint details. Different colors
            represent different statuses.
          </Typography>

          {!process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? (
            <Alert severity="warning">
              Google Maps API key not configured. Please add
              REACT_APP_GOOGLE_MAPS_API_KEY to your environment variables.
            </Alert>
          ) : (
            <GoogleMap complaints={filteredComplaints} />
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Legend
          </Typography>
          <Grid container spacing={2}>
            {Object.values(ComplaintStatus).map((status) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={status}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: getStatusColor(status) + ".main",
                    }}
                  />
                  <Typography variant="body2">
                    {status.replace("_", " ")}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PublicHeatmap;
