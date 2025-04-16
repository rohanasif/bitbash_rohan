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
        border: "1px solid",
        borderColor: "divider",
        minHeight: 360,
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          borderColor: "primary.main",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <IconButton
          onClick={handleDelete}
          sx={{
            position: "absolute",
            top: -8,
            right: -8,
            backgroundColor: "background.paper",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              backgroundColor: "error.main",
              color: "white",
              borderColor: "error.main",
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
            pr: 4,
            fontSize: { xs: "1.25rem", md: "1.5rem" },
            lineHeight: 1.2,
          }}
        >
          {job.title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
            "& > *": {
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(144, 202, 249, 0.1)",
              padding: "4px 12px",
              borderRadius: "16px",
              fontSize: "0.875rem",
            },
          }}
        >
          <Box>
            <BusinessIcon
              sx={{ mr: 1, color: "primary.main", fontSize: "1rem" }}
            />
            <Typography variant="subtitle2" color="text.primary" noWrap>
              {job.company}
            </Typography>
          </Box>

          <Box>
            <LocationOnIcon
              sx={{ mr: 1, color: "primary.main", fontSize: "1rem" }}
            />
            <Typography variant="body2" color="text.primary" noWrap>
              {job.location}
            </Typography>
          </Box>

          {job.job_type && (
            <Box>
              <WorkIcon
                sx={{ mr: 1, color: "primary.main", fontSize: "1rem" }}
              />
              <Typography variant="body2" color="text.primary" noWrap>
                {job.job_type}
              </Typography>
            </Box>
          )}
        </Box>

        {job.description && (
          <Typography
            variant="body1"
            paragraph
            sx={{
              color: "text.primary",
              mb: 2,
              lineHeight: 1.6,
              fontSize: "0.95rem",
              flexGrow: 1,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {job.description}
          </Typography>
        )}

        {job.tags && job.tags.trim() && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            {job.tags.split(",").map((tag) => {
              const trimmedTag = tag.trim();
              return trimmedTag ? (
                <Chip
                  key={trimmedTag}
                  label={trimmedTag}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(144, 202, 249, 0.1)",
                    color: "primary.main",
                    border: "1px solid",
                    borderColor: "primary.main",
                    fontSize: "0.75rem",
                    height: 24,
                    "& .MuiChip-label": {
                      px: 1.5,
                    },
                    "&:hover": {
                      backgroundColor: "rgba(144, 202, 249, 0.2)",
                    },
                  }}
                />
              ) : null;
            })}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {job.date_posted
              ? `Posted: ${job.date_posted}`
              : job.created_at
              ? `Added: ${format(new Date(job.created_at), "PPP")}`
              : "Date not available"}
          </Typography>

          {job.url && (
            <Button
              variant="contained"
              color="primary"
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              }}
            >
              Apply Now
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default JobCard;
