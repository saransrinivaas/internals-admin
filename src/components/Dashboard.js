import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Container,
  Button,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import { Bar, Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      const snap = await getDocs(collection(db, "issues"));
      setIssues(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "category"));
      setCategories(snap.docs.map((doc) => doc.data().CategoryName));
    };
    const fetchDepartments = async () => {
      const snap = await getDocs(collection(db, "departments"));
      setDepartments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    const fetchStaff = async () => {
      const snap = await getDocs(collection(db, "staff"));
      setStaff(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchIssues();
    fetchCategories();
    fetchDepartments();
    fetchStaff();
  }, []);

  const totalIssues = issues.length;
  const verifiedIssues = issues.filter((i) => i.status === "Verified").length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;

  const totalDepartments = departments.length;
  const totalStaff = staff.length;

  // Calculate top 5 categories with most issues
  const categoryCounts = categories.map((cat) => ({
    name: cat,
    count: issues.filter((issue) => issue.category === cat).length,
  }));
  const sortedCategories = categoryCounts.sort((a, b) => b.count - a.count);
  const topCategories = sortedCategories.slice(0, 5);

  const barData = {
    labels: topCategories.map((cat) => t(cat.name.toLowerCase()) || cat.name),
    datasets: [
      {
        label: t("volume") || "Volume",
        data: topCategories.map((cat) => cat.count),
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
      legend: {
        display: true,
        position: "top",
        labels: { font: { size: 18, weight: "bold" }, color: "#2e471e" },
      },
      tooltip: {
        enabled: true,
        titleFont: { size: 18, weight: "bold" },
        bodyFont: { size: 16 },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 18, weight: "bold" },
          color: "#3b5b27",
        },
        title: {
          display: false,
        },
      },
      y: {
        ticks: {
          font: { size: 18, weight: "bold" },
          color: "#3b5b27",
        },
        title: {
          display: false,
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  // Olive/green palette for pie chart
  const pieData = {
    labels: [
      t("verified") || "Verified",
      t("inProgress") || "In Progress",
      t("resolved") || "Resolved",
    ],
    datasets: [
      {
        label: t("issueStatus") || "Issue Status",
        data: [verifiedIssues, inProgress, resolved],
        backgroundColor: [
          "#6B8A47", // Olive green (verified)
          "#A8C47E", // Lighter olive (in progress)
          "#3b5b27", // Dark olive green (resolved)
        ],
        hoverOffset: 30,
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: "easeOutBounce",
      loop: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { font: { size: 18, weight: "bold" }, color: "#2e471e" },
      },
      tooltip: {
        enabled: true,
        titleFont: { size: 18, weight: "bold" },
        bodyFont: { size: 16 },
      },
      title: {
        display: false,
      },
    },
  };

  const toggleLanguage = () =>
    i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");

  const StatCardUI = ({ icon, label, value, color, secondary }) => (
    <Card
      className="dash-stat-card"
      sx={{
        minWidth: 180,
        height: 140,
        borderRadius: 6,
        background: "#fff",
        boxShadow: "0 2px 20px #8BA47322",
        mx: { xs: 2, md: 3 },
        mb: { xs: 3, md: 0 },
        transition: "transform 0.3s",
        "&:hover": {
          transform: "scale(1.07)",
        },
      }}
      elevation={0}
    >
      <CardContent sx={{ p: 2 }}>
        <Box className="dash-stat-card__content" sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {icon}
          <Box>
            <Typography variant="h6" sx={{ color, fontWeight: 800, fontSize: 22 }}>
              {label}
            </Typography>
            <Typography
              variant="h3"
              sx={{ color: secondary || "#333", fontWeight: 900, mt: 1, fontSize: 36 }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box
      className="dashboard-page"
      sx={{
        bgcolor: "#f6f7f1",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        overflowX: "hidden",
        // --- Hidden scrollbar for this area, while scroll stays possible
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 4 },
          px: { xs: 1, md: 4 },
          height: "100vh",
          width: "100%",
          flexGrow: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar in container also
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <Box
          className="dash-stats-row"
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            mb: 6,
            gap: 4,
            width: "100%",
          }}
        >
          <StatCardUI
            icon={<BarChartIcon sx={{ color: "#6B8A47", fontSize: 28 }} />}
            label={t("totalIssues") || "Total Issues"}
            value={totalIssues}
          />
          <StatCardUI
            icon={<PeopleIcon sx={{ color: "#6B8A47", fontSize: 28 }} />}
            label={t("totalDepartments") || "Total Departments"}
            value={totalDepartments}
          />
          <StatCardUI
            icon={<GroupIcon sx={{ color: "#6B8A47", fontSize: 28 }} />}
            label={t("totalStaff") || "Total Staff"}
            value={totalStaff}
          />
          <StatCardUI
            icon={<AssignmentIcon sx={{ color: "#6B8A47", fontSize: 28 }} />}
            label={t("verified") || "Verified Issues"}
            value={verifiedIssues}
          />
          <StatCardUI
            icon={<AutorenewIcon sx={{ color: "#6B8A47", fontSize: 28 }} />}
            label={t("inProgress") || "In Progress"}
            value={inProgress}
          />
          <StatCardUI
            icon={<CheckCircleIcon sx={{ color: "#6B8A47", fontSize: 28 }} />}
            label={t("resolved") || "Resolved"}
            value={resolved}
          />
        </Box>

        <Grid
          container
          spacing={6}
          direction="row"
          alignItems="stretch"
          justifyContent="center"
          sx={{ width: "100%", flexGrow: 1 }}
        >
          <Grid item xs={12} md={6} sx={{ height: { xs: 340, md: 520 }, px: 3 }}>
            <Card
              className="dash-chart-card"
              sx={{
                bgcolor: "#fff",
                borderRadius: 6,
                boxShadow: "0 2px 16px #79a06419",
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  className="dash-chart-title"
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    color: "#3b5d3a",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 28,
                  }}
                >
                  <BarChartIcon sx={{ mr: 2, color: "#6B8A47", fontSize: 32 }} />
                  {t("topCategories") || "Top Categories"}
                </Typography>
                <Box
                  sx={{
                    height: { xs: 220, md: 380 },
                    width: "100%",
                  }}
                >
                  <Bar
                    data={barData}
                    options={barOptions}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} sx={{ height: { xs: 340, md: 520 }, px: 3 }}>
            <Card
              className="dash-chart-card"
              sx={{
                bgcolor: "#fff",
                borderRadius: 6,
                boxShadow: "0 2px 16px #79a06419",
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  className="dash-chart-title"
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    color: "#3b5d3a",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 28,
                  }}
                >
                  <PieChartIcon sx={{ mr: 2, color: "#6B8A47", fontSize: 32 }} />
                  {t("resolutionPerformance") || "Resolution Performance"}
                </Typography>
                <Box
                  sx={{
                    height: { xs: 220, md: 380 },
                    width: "100%",
                  }}
                >
                  <Pie
                    data={pieData}
                    options={pieOptions}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
