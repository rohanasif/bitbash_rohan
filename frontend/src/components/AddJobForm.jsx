import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
} from "@mui/material";
import { api } from "../services/api";

const AddJobForm = ({ open, onClose, onJobAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    salary: "",
    job_type: "",
    url: "",
    tags: "",
  });

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const jobData = {
        ...formData,
        link: formData.url,
        date_posted: new Date().toISOString().split("T")[0],
      };

      const response = await api.createJob(jobData);
      onJobAdded(response.job, response.page);
      onClose();
      setFormData({
        title: "",
        company: "",
        location: "",
        description: "",
        salary: "",
        job_type: "",
        url: "",
        tags: "",
      });
    } catch (err) {
      console.error("Error creating job:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Job Listing</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Job Title"
                value={formData.title}
                onChange={handleChange("title")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Company"
                value={formData.company}
                onChange={handleChange("company")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleChange("location")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={handleChange("description")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary"
                value={formData.salary}
                onChange={handleChange("salary")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Job Type"
                value={formData.job_type}
                onChange={handleChange("job_type")}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Remote">Remote</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Application URL"
                value={formData.url}
                onChange={handleChange("url")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={formData.tags}
                onChange={handleChange("tags")}
                helperText="Enter tags separated by commas (e.g., Actuary, Insurance, Risk)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Add Job
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddJobForm;
