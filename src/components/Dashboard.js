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
        labels: { font: { size: 15 } },
      },
      tooltip: { enabled: true },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

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
        backgroundColor: ["#FFA726", "#FFB300", "#388E3C"],
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
        labels: { font: { size: 15 } },
      },
      tooltip: { enabled: true },
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
        transition: "transform 0.3s",
        "&:hover": {
          transform: "scale(1.07)",
        },
      }}
      elevation={0}
    >
      <CardContent sx={{ p: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {icon}
          <Box>
            <Typography variant="subtitle2" sx={{ color, fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: secondary || "#333", fontWeight: 800, mt: 0.5 }}
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
     
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            mb: 3,
            gap: 3,
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
            icon={<AutorenewIcon sx={{ color: "#FFB300", fontSize: 28 }} />}
            label={t("inProgress") || "In Progress"}
            value={inProgress}
          />
          <StatCardUI
            icon={<CheckCircleIcon sx={{ color: "#388E3C", fontSize: 28 }} />}
            label={t("resolved") || "Resolved"}
            value={resolved}
          />
        </Box>

        <Grid container spacing={2} direction="column" alignItems="center">
          <Grid item xs={12} sx={{ width: "100%", maxWidth: 600 }}>
            <Card
              sx={{
                bgcolor: "#fff",
                borderRadius: 5,
                boxShadow: "0 2px 12px #79a06419",
                width: "100%",
                maxWidth: 550,
                mx: "auto",
                p: { xs: 1, md: 2 },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    color: "#3b5d3a",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <BarChartIcon sx={{ mr: 1, color: "#6B8A47" }} />
                  {t("topCategories") || "Top Categories"}
                </Typography>
                <Box
                  sx={{
                    overflow: "hidden",
                    height: { xs: 100, sm: 140, md: 160 },
                    width: "100%",
                    mx: "auto",
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

          <Grid item xs={12} sx={{ width: "100%", maxWidth: 600, mt: 4 }}>
            <Card
              sx={{
                bgcolor: "#fff",
                borderRadius: 5,
                boxShadow: "0 2px 12px #79a06419",
                width: "100%",
                maxWidth: 550,
                mx: "auto",
                p: { xs: 1, md: 2 },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    color: "#3b5d3a",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <PieChartIcon sx={{ mr: 1, color: "#6B8A47" }} />
                  {t("resolutionPerformance") || "Resolution Performance"}
                </Typography>
                <Box
                  sx={{
                    overflow: "hidden",
                    height: { xs: 100, sm: 140, md: 160 },
                    width: "100%",
                    mx: "auto",
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
