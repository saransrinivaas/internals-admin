import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Container
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
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
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

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchIssues = async () => {
      const snap = await getDocs(collection(db, "issues"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIssues(data);
    };
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "category"));
      const data = snap.docs.map((doc) => doc.data().CategoryName);
      setCategories(data);
    };
    fetchIssues();
    fetchCategories();
  }, []);

  const totalIssues = issues.length;
  const newIssues = issues.filter((i) => i.status === "New").length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;
  const categoryLabels = categories.slice(0, 5);

  // Bar chart data
  const barData = {
    labels: categoryLabels.map((label) =>
      t(label?.toLowerCase()) || label
    ),
    datasets: [
      {
        label: t("volume") || "Volume",
        data: categoryLabels.map((label) =>
          issues.filter((issue) => issue.category === label).length
        ),
        backgroundColor: "#6B8A47",
        borderRadius: 6,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: "easeInOutCubic",
      loop: false,
    },
    plugins: {
      legend: { display: true, position: "top", labels: { font: { size: 15 } } },
      title: { display: false },
      tooltip: { enabled: true, animation: { duration: 1000 } },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  
  const lineData = {
    labels: [
      t("week1") || "Week 1",
      t("week2") || "Week 2",
      t("week3") || "Week 3",
      t("week4") || "Week 4"
    ],
    datasets: [
      {
        label: t("sla") || "SLA %",
        data: [85, 90, 95, 88],
        fill: false,
        borderColor: "#6B8A47",
        tension: 0.45,
        pointBorderColor: "#3b5d3a",
        pointBackgroundColor: "#8CA68C",
        pointRadius: 7,
        pointHoverRadius: 12,
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1800,
      easing: "easeInOutQuart",
      loop: false,
    },
    elements: {
      line: { tension: 0.45 },
    },
    plugins: {
      legend: { display: true, position: "top", labels: { font: { size: 15 } } },
      title: { display: false },
      tooltip: { enabled: true, animation: { duration: 900 } },
    },
    interaction: {
      mode: 'index',
      axis: 'x',
      intersect: false,
    },
  };

  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");

  const StatCardUI = ({ icon, label, value, color, secondary }) => (
    <Card
      sx={{
        minWidth: 120,
        height: 90,
        borderRadius: 4,
        background: "#fff",
        boxShadow: "0 2px 20px #8BA47322",
        mx: { xs: 1, md: 2 },
        mb: { xs: 2, md: 0 },
        transition: 'transform 0.15s cubic-bezier(.38,.71,.61,.95)',
        '&:hover': { transform: 'scale(1.07)' }
      }}
      elevation={0}
    >
      <CardContent sx={{ p: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {icon}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>
              {label}
            </Typography>
            <Typography
              variant="h5"
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

  return (
    <Box sx={{ bgcolor: "#f6f7f1", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Language Toggle Button */}
        

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: "#3C4F2F",
            fontFamily: "inherit",
            mb: 4,
            textShadow: "0 1px 7px #b1c4a533",
            textAlign: "center"
          }}
        >
          {t("superAdmin") || "Super Admin Dashboard"}
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 2, justifyContent: "center" }}>
          <Grid item xs={6} md={3}>
            <StatCardUI
              icon={<AssignmentIcon sx={{ color: "#6B8A47", fontSize: 28 }} />}
              label={t("total") || "Total Issues"}
              value={totalIssues}
              color="#6B8A47"
              secondary="#3C4F2F"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCardUI
              icon={<ReportProblemIcon sx={{ color: "#FFA726", fontSize: 28 }} />}
              label={t("new") || "New Issues"}
              value={newIssues}
              color="#FFA726"
              secondary="#FFA726"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCardUI
              icon={<AutorenewIcon sx={{ color: "#FFB300", fontSize: 28 }} />}
              label={t("inProgress") || "In Progress"}
              value={inProgress}
              color="#FFB300"
              secondary="#FFB300"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCardUI
              icon={<CheckCircleIcon sx={{ color: "#388E3C", fontSize: 28 }} />}
              label={t("resolved") || "Resolved"}
              value={resolved}
              color="#388E3C"
              secondary="#388E3C"
            />
          </Grid>
        </Grid>

        {/* Charts: stacked vertically and centered */}
        <Grid container spacing={2} direction="column" alignItems="center">
          <Grid item xs={12} sx={{ width: "100%" }}>
            <Card sx={{
              bgcolor: "#fff",
              borderRadius: 5,
              boxShadow: "0 2px 12px #79a06419",
              width: '100%',
              maxWidth: 550,
              mx: "auto",
              p: { xs: 1, md: 2 }
            }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold"
                  sx={{ color: "#3b5d3a", mb: 2, display: "flex", alignItems: "center" }}>
                  <BarChartIcon sx={{ mr: 1, color: "#6B8A47" }} />
                  {t("topCategories") || "Top Categories"}
                </Typography>
                <Box sx={{
                  overflow: "hidden",
                  height: { xs: 100, sm: 140, md: 160 },
                  width: "100%",
                  mx: "auto"
                }}>
                  <Bar data={barData} options={barOptions} style={{ width: "100%", height: "100%" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sx={{ width: "100%" }}>
            <Card sx={{
              bgcolor: "#fff",
              borderRadius: 5,
              boxShadow: "0 2px 12px #79a06419",
              width: '100%',
              maxWidth: 550,
              mx: "auto",
              p: { xs: 1, md: 2 }
            }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold"
                  sx={{ color: "#3b5d3a", mb: 2, display: "flex", alignItems: "center" }}>
                  <PlaylistAddCheckIcon sx={{ mr: 1, color: "#6B8A47" }} />
                  {t("resolutionPerformance") || "Resolution Performance"}
                </Typography>
                <Box sx={{
                  overflow: "hidden",
                  height: { xs: 100, sm: 140, md: 160 },
                  width: "100%",
                  mx: "auto"
                }}>
                  <Line data={lineData} options={lineOptions} style={{ width: "100%", height: "100%" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}