import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { signOut as firebaseSignOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

import {
  ChartBarIcon,
  BuildingOfficeIcon,
  UserIcon,
  DocumentIcon,
  CogIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

import Dashboard from "./Dashboard";
import Departments from "./Departments";
import Users from "./Users";
import Reports from "./Reports";
import Heatmap from "./Heatmap";
import CategoryPage from "./Category";
import StaffSection from "./StaffSection";

import { auth, db } from "../firebase";
import logo from "./logo.jpg"; // Adjust path if needed

// Updated color palette
const PALETTE = {
  oliveDark: "#3b5b27",      // Sidebar, header
  olive: "#486c2c",          // Accent, hover
  oliveLight: "#6b8e47",     // Button, highlight
  beige: "#f5f7f5",          // Background
  textLight: "#ffffff",
};

const SB_ICONS = {
  dashboard: ChartBarIcon,
  departments: BuildingOfficeIcon,
  heatmap: BuildingOfficeIcon,
  category: ChartBarIcon,
  users: UserIcon,
  reports: DocumentIcon,
  settings: CogIcon,
  staff: UserIcon,
};

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "departments", label: "Departments" },
  { key: "heatmap", label: "Heatmap" },
  { key: "category", label: "Category" },
  { key: "staff", label: "Staff" },
  { key: "users", label: "Users" },
  { key: "reports", label: "Reports" },
];

function generateDeptHeadAndEmail(deptName) {
  if (!deptName) return { departmentHead: "", email: "" };
  let base = "";
  if (/environment/i.test(deptName)) {
    base = "Environment";
  } else {
    let name = deptName.replace(/department of\s*/i, "").trim();
    if (name.includes("&")) {
      base = name.split("&")[0].trim().split(" ")[0];
    } else {
      base = name.split(" ")[0];
    }
    base = base ? base.charAt(0).toUpperCase() + base.slice(1).toLowerCase() : deptName;
  }
  const departmentHead = `${base}DeptHead`;
  const email = `${base.toLowerCase()}depthead@city.gov`;
  return { departmentHead, email };
}

export default function SuperAdminDashboard() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("dashboard");
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [issuesSnap, usersSnap, deptsSnap] = await Promise.all([
          getDocs(collection(db, "issues")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "departments")),
        ]);
        setIssues(issuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setDepartments(deptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    }
    fetchInitialData();

    const unsubscribe = onSnapshot(
      collection(db, "staff"),
      snapshot => {
        setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      error => {
        console.error("Staff onSnapshot error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddDepartment = async (name, routingRule, password, departmentHead, email, role = "DEPT_HEAD") => {
    try {
      const deptId = `dept_${Date.now()}`;
      const routing_rules = routingRule ? [{ category: routingRule, auto_assign: true }] : [];
      await setDoc(doc(db, "departments", deptId), {
        name,
        routing_rules,
        password,
        departmentHead,
        email,
      });
      await setDoc(doc(db, "users", email.split("@")[0]), {
        email,
        role,
        department: name,
        name: "Department Head",
        password,
      });
      setDepartments(prev => [...prev, { id: deptId, name, routing_rules, password, departmentHead, email }]);
      alert("Department and Department Head created successfully.");
    } catch (error) {
      alert(`Failed to create department: ${error.message}`);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    try {
      const deptDoc = await doc(db, "departments", deptId);
      const deptSnapshot = await getDoc(deptDoc);
      if (!deptSnapshot.exists()) throw new Error("Department not found");

      const deptData = deptSnapshot.data();
      await deleteDoc(doc(db, "departments", deptId));
      if (deptData.email) {
        const userId = deptData.email.split("@")[0];
        await deleteDoc(doc(db, "users", userId));
        setUsers(prev => prev.filter(u => u.email !== deptData.email));
      }
      setDepartments(prev => prev.filter(d => d.id !== deptId));
      alert("Department deleted successfully.");
    } catch (error) {
      alert(`Failed to delete department: ${error.message}`);
    }
  };

  const handleInviteUser = async (email, role) => {
    try {
      await setDoc(doc(db, "users", email), { email, role, department: null });
      setUsers(prev => [...prev, { email, role, department: null }]);
      alert("User invited successfully.");
    } catch (error) {
      alert(`Failed to invite user: ${error.message}`);
    }
  };

  const handleLogout = () => {
    firebaseSignOut(auth).then(() => navigate("/"));
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");
  };

  // Example stats
  const total = issues.length;
  const resolved = issues.filter(i => i.status === t("resolved")).length;
  const inProgress = issues.filter(i => i.status === t("inProgress")).length;
  const pending = issues.filter(i => i.status === t("verified")).length;
  const highPriority = issues.filter(i => i.priority === "High").length;

  const pieData = [
    { name: t("verified"), value: pending },
    { name: t("inProgress"), value: inProgress },
    { name: t("resolved"), value: resolved },
  ];

  const COLORS = ["#FFBB28", "#0088FE", "#00C49F"];

  // Build status distribution for local chart
  const statusPieData = [
    { name: t("verified"), value: pending, color: "#FFBB28" },
    { name: t("inProgress"), value: inProgress, color: "#29B6F6" },
    { name: t("resolved"), value: resolved, color: "#66BB6A" },
  ];

  function monthKeyFromDate(date) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  // Create last 6 month buckets
  const now = new Date();
  const monthKeys = Array.from({ length: 6 })
    .map((_, idx) => new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1))
    .map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);

  const monthlyCountsMap = monthKeys.reduce((acc, key) => {
    acc[key] = { total: 0, resolved: 0, inProgress: 0 };
    return acc;
  }, {});

  issues.forEach(issue => {
    const keyFromCreated = issue?.createdAt || issue?.created_at || issue?.timestamp || issue?.date;
    const key = typeof keyFromCreated === "number"
      ? monthKeyFromDate(keyFromCreated)
      : monthKeyFromDate(keyFromCreated);
    const bucketKey = monthKeys.includes(key) ? key : null;
    if (bucketKey) {
      monthlyCountsMap[bucketKey].total += 1;
      if (issue.status === t("resolved")) monthlyCountsMap[bucketKey].resolved += 1;
      if (issue.status === t("inProgress")) monthlyCountsMap[bucketKey].inProgress += 1;
    }
  });

  // If no timestamps exist, synthesize a simple series
  const hasAnyBucket = Object.values(monthlyCountsMap).some(v => v.total > 0);
  if (!hasAnyBucket && total > 0) {
    const base = Math.max(1, Math.floor(total / 6));
    monthKeys.forEach((k, i) => {
      monthlyCountsMap[k].total = base + (i % 3);
      monthlyCountsMap[k].resolved = Math.max(0, Math.floor(monthlyCountsMap[k].total * 0.5));
      monthlyCountsMap[k].inProgress = Math.max(0, monthlyCountsMap[k].total - monthlyCountsMap[k].resolved);
    });
  }

  const monthlySeries = monthKeys.map(k => {
    const [y, m] = k.split("-");
    const label = `${m}/${y.slice(2)}`;
    return { name: label, ...monthlyCountsMap[k] };
  });

  // Recent activity table
  const recentRows = issues.slice(0, 8).map((it, idx) => ({
    id: it.id || idx,
    title: it.title || it.subject || it.category || "Issue",
    department: it.department || it.dept || "-",
    status: it.status || "-",
    priority: it.priority || "-",
  }));

  const recentColumns = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 160 },
    { field: "department", headerName: "Department", width: 160 },
    { field: "status", headerName: "Status", width: 140 },
    { field: "priority", headerName: "Priority", width: 120 },
  ];

  return (
    <ErrorBoundary>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: PALETTE.beige,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            backgroundColor: PALETTE.oliveDark,
            color: PALETTE.textLight,
            px: { xs: 2, md: 4 },
            py: { xs: 2, md: 2.5 },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 8px 0 rgba(59,91,39,0.08)",
            position: "relative",
          }}
        >
          {/* Centered logo and name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                height: 120, // Increased size
                width: 120,
                borderRadius: 18, // Less rounded, not a circle
                objectFit: "contain", // Prevents compression/stretching
                boxShadow: "0 2px 12px #0002",
                marginRight: 24,
                background: "#fff0", // Transparent background
              }}
            />
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{
                letterSpacing: ".5px",
                fontSize: { xs: "2.3rem", md: "3rem" },
                display: "flex",
                alignItems: "center",
              }}
            >
              {t("superAdmin")}
            </Typography>
          </Box>
          {/* Notification Icon at top right */}
          <Box
            sx={{
              position: "absolute",
              right: { xs: 16, md: 32 },
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <BellIcon style={{ width: 34, height: 34, color: PALETTE.textLight, cursor: "pointer" }} />
            <Button
              onClick={toggleLanguage}
              sx={{
                bgcolor: PALETTE.oliveLight,
                color: PALETTE.textLight,
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                fontSize: 15,
                boxShadow: "none",
                textTransform: "none",
                "&:hover": {
                  bgcolor: PALETTE.olive,
                  color: PALETTE.textLight,
                },
                "&.Mui-disabled": {
                  bgcolor: PALETTE.olive,
                  color: PALETTE.textLight,
                },
              }}
            >
              {i18n.language === "en" ? "हिन्दी" : "English"}
            </Button>
            <Button
              onClick={handleLogout}
              sx={{
                bgcolor: PALETTE.oliveLight,
                color: PALETTE.textLight,
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                fontSize: 15,
                boxShadow: "none",
                textTransform: "none",
                "&:hover": {
                  bgcolor: PALETTE.olive,
                  color: PALETTE.textLight,
                },
                "&.Mui-disabled": {
                  bgcolor: PALETTE.olive,
                  color: PALETTE.textLight,
                },
              }}
            >
              {t("logout")}
            </Button>
          </Box>
        </Box>
        {/* Main Layout */}
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            height: "calc(100vh - 72px)",
            overflow: "hidden",
            // Remove border, borderRadius, and boxShadow for flush layout
            border: "none",
            borderRadius: 0,
            boxShadow: "none",
            background: PALETTE.bg,
            minHeight: 0,
          }}
        >
          {/* Sidebar Navigation */}
          <nav
            style={{
              background: PALETTE.oliveDark,
              minWidth: 220,
              color: PALETTE.textLight,
              height: "100%",
              overflowY: "auto",
              userSelect: "none",
              boxShadow: "2px 0 16px 0 rgba(59,91,39,0.07)",
            }}
          >
            <Box
              sx={{
                fontWeight: 800,
                p: "22px 32px",
                letterSpacing: ".7px",
                fontSize: 22,
                borderBottom: `2px solid ${PALETTE.olive}`,
                bgcolor: PALETTE.oliveDark,
                color: PALETTE.textLight,
                textAlign: "left",
              }}
            >
              {t("civicPortal")}
            </Box>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {menuItems.map(({ key, label }) => {
                const Icon = SB_ICONS[key];
                const active = key === tab;
                return (
                  <li
                    key={key}
                    onClick={() => setTab(key)}
                    style={{
                      padding: "13px 32px",
                      cursor: "pointer",
                      background: active ? PALETTE.olive : "transparent",
                      fontWeight: active ? 700 : 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      borderLeft: active
                        ? `5px solid ${PALETTE.oliveLight}`
                        : "5px solid transparent",
                      color: PALETTE.textLight,
                      transition: "background-color 0.2s, color 0.2s",
                      userSelect: "none",
                      fontSize: "1.08rem",
                      borderRadius: "0 24px 24px 0",
                    }}
                    onMouseEnter={e =>
                      !active &&
                      (e.currentTarget.style.background = PALETTE.olive)
                    }
                    onMouseLeave={e =>
                      !active &&
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Icon style={{ width: 22, height: 22, opacity: active ? 1 : 0.85 }} />
                    {t(label.toLowerCase())}
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* Main Content */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, md: 4 },
              overflowY: "auto",
              background: PALETTE.bg,
              // Remove borderRadius and boxShadow for a flush look
              minHeight: 0,
            }}
          >
            {tab === "dashboard" && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                  Analytics Overview
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card sx={{ height: 360 }}>
                      <CardContent sx={{ height: "100%" }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                          Issues Trend (6 months)
                        </Typography>
                        <Box sx={{ height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#42A5F5" stopOpacity={0.35} />
                                  <stop offset="95%" stopColor="#42A5F5" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" />
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip />
                              <Legend />
                              <Area type="monotone" dataKey="total" stroke="#42A5F5" fillOpacity={1} fill="url(#colorTotal)" name="Total" />
                              <Line type="monotone" dataKey="resolved" stroke="#66BB6A" dot={false} name="Resolved" />
                              <Line type="monotone" dataKey="inProgress" stroke="#FFB300" dot={false} name="In Progress" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: 360 }}>
                      <CardContent sx={{ height: "100%" }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                          Status Distribution
                        </Typography>
                        <Box sx={{ height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                                {statusPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Legend />
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {tab === "dashboard" && <Dashboard issues={issues} />}
            {tab === "dashboard" && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                <div style={{ width: "100%" }}>
                  <DataGrid
                    autoHeight
                    rows={recentRows}
                    columns={recentColumns}
                    pageSizeOptions={[5, 10]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                    sx={{
                      border: `1px solid rgba(0,0,0,0.06)`,
                      borderRadius: 8,
                      "& .MuiDataGrid-columnHeaders": { backgroundColor: "#F5F7FA" },
                    }}
                  />
                </div>
              </Box>
            )}
            {tab === "departments" && (
              <Departments
                departments={departments}
                addDepartment={handleAddDepartment}
                deleteDepartment={handleDeleteDepartment}
              />
            )}
            {tab === "staff" && (
              <StaffSection
                departments={departments}
                staff={staff}
                setStaff={setStaff}
              />
            )}
            {tab === "users" && <Users users={users} />}
            {tab === "reports" && (
              <Reports
                total={total}
                resolved={resolved}
                inProgress={inProgress}
                pending={pending}
                highPriority={highPriority}
                pieData={pieData}
                COLORS={COLORS}
              />
            )}
            {tab === "heatmap" && <Heatmap />}
            {tab === "category" && <CategoryPage />}
          </Box>
        </Box>
      </Box>
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ padding: 3, color: "red" }}>
          <Typography variant="h5" gutterBottom>
            Something went wrong.
          </Typography>
          <pre>{this.state.error?.toString()}</pre>
        </Box>
      );
    }
    return this.props.children;
  }
}