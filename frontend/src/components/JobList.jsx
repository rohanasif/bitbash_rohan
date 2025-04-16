import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  memo,
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
  Button,
} from "@mui/material";
import JobCard from "./JobCard";
import { api } from "../services/api";

// Separate FilterBar component to prevent unnecessary re-renders
const FilterBar = memo(({ onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState({
    location: "",
    company: "",
    job_type: "",
  });

  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        backgroundColor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Location"
            value={localFilters.location}
            onChange={handleFilterChange("location")}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
                height: 40,
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.875rem",
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Company"
            value={localFilters.company}
            onChange={handleFilterChange("company")}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
                height: 40,
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.875rem",
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            select
            label="Job Type"
            value={localFilters.job_type}
            onChange={handleFilterChange("job_type")}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "background.paper",
              },
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
            <MenuItem value="Internship">Internship</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              height: 40,
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            Apply Filters
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
});

FilterBar.displayName = "FilterBar";

const JobList = forwardRef((props, ref) => {
  const [jobs, setJobs] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({});
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
        appliedFilters,
        pagination.page,
        pagination.perPage
      );

      // Handle empty job list
      if (!data.jobs || data.jobs.length === 0) {
        setJobs([]);
      } else {
        setJobs(data.jobs);
      }

      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.total_pages,
      }));
      setError(null);
    } catch (err) {
      setError("Failed to fetch jobs");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, pagination.page, pagination.perPage]);

  // Effect for initial load and pagination changes
  useEffect(() => {
    fetchJobs();
  }, [pagination.page, pagination.perPage, fetchJobs]);

  // Expose functions to parent components
  useImperativeHandle(ref, () => ({
    refresh: fetchJobs,
    resetPagination: () => {
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    setPage: (page) => {
      setPagination((prev) => ({ ...prev, page }));
    },
  }));

  const handleDelete = async (id) => {
    try {
      await api.deleteJob(id);
      fetchJobs(); // Refresh the list after deletion
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value }));
  };

  const handlePerPageChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      perPage: event.target.value,
      page: 1, // Reset to first page when changing items per page
    }));
  };

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
          fontSize: { xs: "2rem", md: "2.5rem" },
        }}
      >
        Job Listings
      </Typography>

      <FilterBar onApplyFilters={handleApplyFilters} />

      {loading ? (
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
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : jobs.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No jobs found
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} sm={6} lg={4} key={job.id}>
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <JobCard job={job} onDelete={handleDelete} />
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              mt: 4,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center", sm: "center" },
              gap: 2,
              p: 2,
              backgroundColor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="per-page-label">Per Page</InputLabel>
                <Select
                  labelId="per-page-label"
                  value={pagination.perPage}
                  label="Per Page"
                  onChange={handlePerPageChange}
                  sx={{
                    backgroundColor: "background.paper",
                  }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Stack spacing={2} alignItems="center">
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                siblingCount={1}
                boundaryCount={1}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "text.primary",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Showing{" "}
                {jobs.length > 0
                  ? (pagination.page - 1) * pagination.perPage + 1
                  : 0}{" "}
                to{" "}
                {Math.min(
                  pagination.page * pagination.perPage,
                  pagination.total
                )}{" "}
                of {pagination.total} jobs
              </Typography>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
});

export default JobList;
