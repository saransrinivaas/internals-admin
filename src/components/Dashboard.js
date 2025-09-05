import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Bar, Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ icon, label, value, color, secondary }) => (
  <Card
    sx={{
      minWidth: 140,
      height: 100,
      borderRadius: 4,
      background: "#fff",
      boxShadow: "0 2px 20px #6b8a4722",
      overflow: "visible",
      mx: 2,
      mb: 0,
    }}
    elevation={0}
  >
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {icon}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: secondary || "#333",
              fontWeight: 800,
              mt: 0.5,
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard({ issues = [] }) {
  const { t, i18n } = useTranslation();

  // Stats data
  const totalIssues = issues.length || 30;
  const newIssues = issues.filter((i) => i.status === "New").length || 5;
  const inProgress = issues.filter((i) => i.status === "In Progress").length || 10;
  const resolved = issues.filter((i) => i.status === "Resolved").length || 15;

  const barData = {
    labels: [
      t("pothole") || "Pothole",
      t("light") || "Light",
      t("garbage") || "Garbage",
      t("leakage") || "Leakage",
      t("road") || "Road",
    ],
    datasets: [
      {
        label: t("volume") || "Volume",
        data: [35, 22, 18, 14, 12],
        backgroundColor: "#6B8A47",
        borderRadius: 6,
      },
    ],
  };

  const lineData = {
    labels: [
      t("week1") || "Week 1",
      t("week2") || "Week 2",
      t("week3") || "Week 3",
      t("week4") || "Week 4",
    ],
    datasets: [
      {
        label: t("sla") || "SLA %",
        data: [85, 90, 95, 88],
        fill: false,
        borderColor: "#6B8A47",
        tension: 0.4,
        pointBorderColor: "#3b5d3a",
        pointBackgroundColor: "#8CA68C",
        pointRadius: 7,
        pointHoverRadius: 10,
        showLine: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    animation: {
      duration: 1500,
      easing: "easeInOutQuint",
    },
    elements: {
      line: {
        tension: 0.35,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { font: { size: 15 } },
      },
      title: { display: false },
    },
  };

  const barOptions = {
    responsive: true,
    animation: {
      duration: 1200,
      easing: "easeInOutQuart",
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { font: { size: 15 } },
      },
      title: { display: false },
    },
  };

  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        bgcolor: "#f6f7f1",
        py: 4,
        px: { xs: 2, md: 6 },
        position: "relative",
      }}
    >
      {/* Language toggle button */}
      <Button
        variant="contained"
        onClick={toggleLanguage}
        sx={{
          position: "absolute",
          top: 32,
          right: 42,
          background: "#6B8A47",
          color: "#fff",
          px: 3,
          borderRadius: 2,
          fontWeight: 700,
          fontSize: 18,
          boxShadow: "0 1px 10px #5e774528",
          "&:hover": { backgroundColor: "#3b5d3a" },
          zIndex: 2,
        }}
      >
        {i18n.language === "en" ? "हिन्दी" : "English"}
      </Button>

      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          color: "#3C4F2F",
          fontFamily: "inherit",
          mb: 4,
          textShadow: "0 1px 7px #b1c4a533",
        }}
      >
        {t("superAdmin") || "Super Admin Dashboard"}
      </Typography>

      {/* Stats cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<AssignmentIcon sx={{ color: "#6B8A47", fontSize: 34 }} />}
            label={t("total")}
            value={totalIssues}
            color="#6B8A47"
            secondary="#3C4F2F"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<ReportProblemIcon sx={{ color: "#FFA726", fontSize: 34 }} />}
            label={t("new")}
            value={newIssues}
            color="#FFA726"
            secondary="#FFA726"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<AutorenewIcon sx={{ color: "#FFB300", fontSize: 34 }} />}
            label={t("inProgress")}
            value={inProgress}
            color="#FFB300"
            secondary="#FFB300"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<CheckCircleIcon sx={{ color: "#388E3C", fontSize: 34 }} />}
            label={t("resolved")}
            value={resolved}
            color="#388E3C"
            secondary="#388E3C"
          />
        </Grid>
      </Grid>

      {/* Stacked charts with bigger horizontal width */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ background: "#fff", borderRadius: 5, boxShadow: "0 2px 12px #79a06419" }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "#3b5d3a", mb: 2, display: "flex", alignItems: "center" }}
              >
                <BarChartIcon sx={{ mr: 1, color: "#6B8A47" }} />
                {t("topCategories")}
              </Typography>
              <Box sx={{ height: { xs: 300, md: 350 }, width: { xs: "100%", md: "90vw" }, mx: "auto" }}>
                <Bar data={barData} options={barOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ background: "#fff", borderRadius: 5, boxShadow: "0 2px 12px #79a06419" }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "#3b5d3a", mb: 2, display: "flex", alignItems: "center" }}
              >
                <PlaylistAddCheckIcon sx={{ mr: 1, color: "#6B8A47" }} />
                {t("resolutionPerformance")}
              </Typography>
              <Box sx={{ height: { xs: 300, md: 350 }, width: { xs: "100%", md: "90vw" }, mx: "auto" }}>
                <Line data={lineData} options={lineOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
