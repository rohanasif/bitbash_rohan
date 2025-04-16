import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import { format } from "date-fns";

const JobCard = ({ job, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this job listing?")) {
      onDelete(job.id);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: "background.paper",
        borderRadius: 2,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={handleDelete}
          sx={{
            position: "absolute",
            top: -8,
            right: -8,
            backgroundColor: "background.paper",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            "&:hover": {
              backgroundColor: "error.main",
              color: "white",
            },
          }}
        >
          <DeleteIcon />
        </IconButton>

        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "primary.main",
            mb: 2,
          }}
        >
          {job.title}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <BusinessIcon sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="subtitle1" color="text.secondary">
              {job.company}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocationOnIcon sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {job.location}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <WorkIcon sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {job.job_type}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body1"
          paragraph
          sx={{
            color: "text.primary",
            mb: 2,
            lineHeight: 1.6,
          }}
        >
          {job.description}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {job.skills &&
            job.skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{
                  backgroundColor: "rgba(144, 202, 249, 0.1)",
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "rgba(144, 202, 249, 0.2)",
                  },
                }}
              />
            ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Posted: {format(new Date(job.posted_date), "PPP")}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Apply Now
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default JobCard;
