import { useState, useRef } from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import JobList from "./components/JobList";
import AddJobForm from "./components/AddJobForm";
import "./App.css";

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: "#fff",
    },
    h6: {
      fontWeight: 600,
      color: "#fff",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e",
          borderRadius: 12,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.23)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
          },
        },
      },
    },
  },
});

function App() {
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const jobListRef = useRef();

  const handleJobAdded = () => {
    // Refresh the job list
    jobListRef.current?.refresh();
    setIsAddJobOpen(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              Actuary Job Listings
            </Typography>
            <Button
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsAddJobOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 2,
              }}
            >
              Add Job
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg">
          <Box
            sx={{
              my: 4,
              py: 2,
            }}
          >
            <JobList ref={jobListRef} />
          </Box>
        </Container>

        <AddJobForm
          open={isAddJobOpen}
          onClose={() => setIsAddJobOpen(false)}
          onJobAdded={handleJobAdded}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
