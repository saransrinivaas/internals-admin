import React from "react";
import { Box, Typography, styled } from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import { LoadScript, GoogleMap, HeatmapLayer } from "@react-google-maps/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const OliveBox = styled(Box)({
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 4px 14px rgba(60,79,47,0.3)",
  marginBottom: 24,
});

const containerStyle = { width: "100%", height: "300px", borderRadius: 12, overflow: "hidden" };
const center = { lat: 37.7749, lng: -122.4194 };

// Dashboard Component
export default function Dashboard({ issues = [] }) {
  const totalIssues = issues.length || 30;
  const newIssues = issues.filter((i) => i.status === "New").length || 5;
  const inProgress = issues.filter((i) => i.status === "In Progress").length || 10;
  const resolved = issues.filter((i) => i.status === "Resolved").length || 15;

  const barData = {
    labels: ["Pothole", "Light", "Garbage", "Leakage", "Road"],
    datasets: [
      {
        label: "Volume",
        data: [35, 22, 18, 14, 12],
        backgroundColor: "#6B8A47",
        borderRadius: 6,
      },
    ],
  };

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "SLA %",
        data: [85, 90, 95, 88],
        fill: false,
        borderColor: "#6B8A47",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const heatmapData = []; // Replace with actual LatLng[] for map

  return (
    <>
      <OliveBox>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Issue Summary
        </Typography>
        <Typography>
          Total: {totalIssues} | New: {newIssues} | In Progress: {inProgress} | Resolved: {resolved}
        </Typography>
      </OliveBox>

      <OliveBox>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          City Hotspots
        </Typography>
        <LoadScript libraries={["visualization"]} googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11} options={{ gestureHandling: "greedy" }}>
            {heatmapData.length > 0 && <HeatmapLayer data={heatmapData} options={{ radius: 25 }} />}
          </GoogleMap>
        </LoadScript>
      </OliveBox>

      <OliveBox>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Top 5 Categories by Volume
        </Typography>
        <Box sx={{ height: 200 }}>
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
        </Box>
      </OliveBox>

      <OliveBox>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Resolution Performance (SLA %)
        </Typography>
        <Box sx={{ height: 250 }}>
          <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
        </Box>
      </OliveBox>
    </>
  );
}
