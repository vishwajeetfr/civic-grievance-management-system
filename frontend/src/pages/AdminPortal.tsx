import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search,
  FilterList,
  Visibility,
  Edit,
  Person,
  Schedule,
  LocationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintAPI } from "../services/api";
import { Complaint, ComplaintStatus, ComplaintType } from "../types";

const AdminPortal: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(
    ComplaintStatus.PENDING
  );
  const [adminNotes, setAdminNotes] = useState<string>("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: complaintsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "allComplaints",
      page,
      size,
      statusFilter,
      typeFilter,
      cityFilter,
    ],
    queryFn: () =>
      complaintAPI.getAllComplaints(
        page,
        size,
        "createdAt",
        "desc",
        statusFilter,
        typeFilter,
        cityFilter
      ),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: string;
      notes?: string;
    }) => complaintAPI.updateComplaintStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
      setStatusUpdateDialog(false);
      setSelectedComplaint(null);
      setAdminNotes("");
    },
  });

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

  const getTypeColor = (type: ComplaintType) => {
    const colors = {
      [ComplaintType.INFRASTRUCTURE]: "primary",
      [ComplaintType.HEALTHCARE]: "secondary",
      [ComplaintType.SANITATION]: "success",
      [ComplaintType.SAFETY]: "error",
      [ComplaintType.TRANSPORTATION]: "info",
      [ComplaintType.EDUCATION]: "warning",
      [ComplaintType.ENVIRONMENT]: "success",
      [ComplaintType.UTILITIES]: "primary",
      [ComplaintType.OTHER]: "default",
    };
    return colors[type] || "default";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value - 1);
  };

  const handleStatusUpdate = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusUpdateDialog(true);
  };

  const handleStatusUpdateSubmit = () => {
    if (selectedComplaint) {
      updateStatusMutation.mutate({
        id: selectedComplaint.id,
        status: newStatus,
        notes: adminNotes,
      });
    }
  };

  const filteredComplaints =
    complaintsData?.data?.content?.filter((complaint) => {
      const matchesSearch =
        !searchTerm ||
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        complaint.user.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    }) || [];

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
          Failed to load complaints. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Panel
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage all complaints and system administration
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography color="text.secondary" gutterBottom>
                    Total Complaints
                  </Typography>
                  <Typography variant="h4">
                    {complaintsData?.data?.totalElements || 0}
                  </Typography>
                </Box>
                <Chip label="All" color="primary" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {complaintsData?.data?.content?.filter(
                      (c) => c.status === ComplaintStatus.PENDING
                    ).length || 0}
                  </Typography>
                </Box>
                <Chip label="Pending" color="warning" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography color="text.secondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {complaintsData?.data?.content?.filter(
                      (c) => c.status === ComplaintStatus.IN_PROGRESS
                    ).length || 0}
                  </Typography>
                </Box>
                <Chip label="In Progress" color="info" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography color="text.secondary" gutterBottom>
                    Resolved
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {complaintsData?.data?.content?.filter(
                      (c) => c.status === ComplaintStatus.RESOLVED
                    ).length || 0}
                  </Typography>
                </Box>
                <Chip label="Resolved" color="success" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            <Grid size={{ xs: 12, sm: 2 }}>
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
                      {status.replace("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
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
                      {type.replace("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                label="City"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Filter by city"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setStatusFilter("");
                  setTypeFilter("");
                  setCityFilter("");
                  setSearchTerm("");
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
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No complaints found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search terms.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredComplaints.map((complaint) => (
              <Grid size={12} key={complaint.id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" component="h2">
                        {complaint.title}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip
                          label={complaint.status.replace("_", " ")}
                          color={getStatusColor(complaint.status) as any}
                          size="small"
                        />
                        <Chip
                          label={complaint.type.replace("_", " ")}
                          color={getTypeColor(complaint.type) as any}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {complaint.description.length > 200
                        ? `${complaint.description.substring(0, 200)}...`
                        : complaint.description}
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Person sx={{ mr: 1, fontSize: 16 }} />
                          <Typography variant="body2" color="text.secondary">
                            {complaint.user.name}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Schedule sx={{ mr: 1, fontSize: 16 }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(complaint.createdAt)}
                          </Typography>
                        </Box>
                      </Grid>
                      {complaint.address && (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2" color="text.secondary">
                              {complaint.city || "Unknown"}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        ID: #{complaint.id}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/complaint/${complaint.id}`)
                            }
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <IconButton
                            size="small"
                            onClick={() => handleStatusUpdate(complaint)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {complaintsData && complaintsData.data.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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

      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateDialog}
        onClose={() => setStatusUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Complaint Status</DialogTitle>
        <DialogContent>
          {selectedComplaint && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedComplaint.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Status: {selectedComplaint.status.replace("_", " ")}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
            >
              {Object.values(ComplaintStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Admin Notes (Optional)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about the status update..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdateSubmit}
            variant="contained"
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPortal;
