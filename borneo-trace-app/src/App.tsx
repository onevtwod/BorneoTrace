import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Web3Provider } from "./contexts/Web3Context";

// Components
import Layout from "./components/Layout";

// Pages
import HomePage from "./pages/HomePage";
import CertifierDashboard from "./pages/CertifierDashboard";
import ProducerDashboard from "./pages/ProducerDashboard";
import VerifierDashboard from "./pages/VerifierDashboard";
import ScanPage from "./pages/ScanPage";
import VerifyPage from "./pages/VerifyPage";

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32", // Green - representing sustainability
    },
    secondary: {
      main: "#1976d2", // Blue
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Web3Provider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/certifier" element={<CertifierDashboard />} />
              <Route path="/producer" element={<ProducerDashboard />} />
              <Route path="/verifier" element={<VerifierDashboard />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/verify/:batchId" element={<VerifyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;
