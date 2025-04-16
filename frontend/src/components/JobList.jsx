import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import JobCard from "./JobCard";
import { api } from "../services/api";

const JobList = forwardRef((props, ref) => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getJobs(
        filters,
        pagination.page,
        pagination.perPage
      );
      setJobs(data.jobs);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError("Failed to fetch jobs");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.perPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Expose the fetchJobs function to parent components
  useImperativeHandle(ref, () => ({
    refresh: fetchJobs,
  }));

  const handleDelete = async (id) => {
    try {
      await api.deleteJob(id);
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
      fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value }));
  };

  const handlePerPageChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      perPage: event.target.value,
      page: 1,
    }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          mb: 4,
          textAlign: "center",
          fontWeight: "bold",
          background: "linear-gradient(45deg, #90caf9 30%, #f48fb1 90%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Job Listings
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: "background.paper",
          borderRadius: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Location"
              value={filters.location || ""}
              onChange={handleFilterChange("location")}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Company"
              value={filters.company || ""}
              onChange={handleFilterChange("company")}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Job Type"
              value={filters.job_type || ""}
              onChange={handleFilterChange("job_type")}
              variant="outlined"
              size="small"
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      minWidth: "200px",
                    },
                  },
                },
              }}
              sx={{
                "& .MuiSelect-select": {
                  minWidth: "120px",
                },
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Remote">Remote</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {jobs.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No jobs found
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            {jobs.map((job) => (
              <Grid item xs={12} key={job.id}>
                <JobCard job={job} onDelete={handleDelete} />
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="per-page-label">Per Page</InputLabel>
              <Select
                labelId="per-page-label"
                value={pagination.perPage}
                label="Per Page"
                onChange={handlePerPageChange}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>

            <Stack spacing={2} alignItems="center">
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
              <Typography variant="body2" color="text.secondary">
                Showing {jobs.length} of {pagination.total} jobs
              </Typography>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
});

export default JobList;
