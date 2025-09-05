import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import { signOut as firebaseSignOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Dashboard from "./Dashboard";
import Departments from "./Departments";
import Users from "./Users";
import Reports from "./Reports";
import Heatmap from "./Heatmap";
import CategoryPage from "./Category";

import { auth, db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import {
  ChartBarIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const C = {
  olive: "#3b5d3a",
  oliveDark: "#2e472d",
  oliveLight: "#486a3e",
  textLight: "#ffffff",
  bg: "#f5f7f5",
  accent: "#6B8A47",
};

const SB_ICONS = {
  dashboard: ChartBarIcon,
  departments: BuildingOffice2Icon,
  users: UserGroupIcon,
  reports: DocumentArrowDownIcon,
  settings: Cog6ToothIcon,
  heatmap: BuildingOffice2Icon,  // can replace icon as needed
  category: ChartBarIcon,
};

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "departments", label: "Departments" },
  { key: "heatmap", label: "Heatmap" },
  { key: "category", label: "Category" },
  { key: "users", label: "Users" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
];

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ padding: 3, color: "red" }}>
          <Typography variant="h5" gutterBottom>
            Something went wrong.
          </Typography>
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default function SuperAdminDashboard() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("dashboard");
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const issuesSnap = await getDocs(collection(db, "issues"));
        const usersSnap = await getDocs(collection(db, "users"));
        const deptsSnap = await getDocs(collection(db, "departments"));
        setIssues(issuesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setUsers(usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setDepartments(deptsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/");
        return;
      }
      fetchData();
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleAddDepartment = async (name, routingRule, password) => {
    try {
      const deptId = `dept_${Date.now()}`;
      const routing_rules = routingRule ? [{ category: routingRule, auto_assign: true }] : [];
      await setDoc(doc(db, "departments", deptId), {
        name,
        routing_rules,
        password,
      });
      setDepartments((prev) => [...prev, { id: deptId, name, routing_rules, password }]);
    } catch (err) {
      alert("Error adding department: " + err.message);
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await deleteDoc(doc(db, "departments", id));
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Error deleting department: " + err.message);
    }
  };

  const handleInviteUser = async (email, role) => {
    try {
      await setDoc(doc(db, "users", email), { email, role, department: null });
      alert(`Invited user: ${email}`);
    } catch (err) {
      alert("Error inviting user: " + err.message);
    }
  };

  const generatePDF = () => alert("Generate PDF called");
  const generateCSV = () => alert("Generate CSV called");
  const generateExcel = () => alert("Generate Excel called");
  const handleLogout = () => {
    firebaseSignOut(auth);
    navigate("/");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(newLang);
  };

  // Sidebar render with tab state (no navigation for heatmap/category)
  return (
    <ErrorBoundary>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: C.bg,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            backgroundColor: C.olive,
            color: C.textLight,
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {t("superAdmin")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              onClick={toggleLanguage}
              sx={{
                backgroundColor: C.accent,
                color: C.textLight,
                borderRadius: 1,
                px: 3,
                fontWeight: 500,
                fontSize: 14,
                "&:hover": { backgroundColor: C.oliveDark },
              }}
            >
              {i18n.language === "en" ? "हिन्दी" : "English"}
            </Button>
            <Button
              onClick={handleLogout}
              sx={{
                backgroundColor: "#6B8A47",
                color: "white",
                borderRadius: 1,
                px: 3,
                fontWeight: 500,
                fontSize: 14,
                "&:hover": { backgroundColor: "#556B2F" },
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
            height: "calc(100vh - 64px)",
            overflow: "hidden",
          }}
        >
          {/* Sidebar */}
          <nav
            style={{
              background: C.olive,
              minWidth: 220,
              color: C.textLight,
              height: "100%",
              overflowY: "auto",
              userSelect: "none",
            }}
          >
            <Box
              sx={{
                fontWeight: 800,
                padding: "22px 32px",
                letterSpacing: ".7px",
                fontSize: 22,
                borderBottom: `2px solid ${C.oliveDark}`,
              }}
            >
              {t("civicPortal")}
            </Box>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {menuItems.map(({ key, label }) => {
                const Icon = SB_ICONS[key];
                const active = tab === key;
                return (
                  <li
                    key={key}
                    onClick={() => setTab(key)}  // Always set tab, no navigate
                    style={{
                      padding: "13px 32px",
                      cursor: "pointer",
                      background: active ? C.oliveDark : "transparent",
                      fontWeight: active ? 700 : 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      borderLeft: active ? `5px solid ${C.accent}` : "5px solid transparent",
                      transition: "background-color 0.2s ease",
                      userSelect: "none",
                    }}
                    onMouseOver={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = C.oliveLight;
                    }}
                    onMouseOut={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Icon style={{ width: 22, height: 22, opacity: active ? 1 : 0.85 }} />
                    {t(label.toLowerCase())}
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* Content */}
          <Box
            sx={{
              flex: 1,
              padding: 4,
              overflowY: "auto",
              height: "100%",
              boxSizing: "border-box",
              backgroundColor: C.bg,
            }}
          >
            {tab === "dashboard" && <Dashboard issues={issues} />}
            {tab === "departments" && (
              <Departments
                departments={departments}
                addDepartment={handleAddDepartment}
                deleteDepartment={handleDeleteDepartment}
              />
            )}
            {tab === "heatmap" && <Heatmap />}
            {tab === "category" && <CategoryPage />}
            {tab === "users" && <Users users={users} inviteUser={handleInviteUser} />}
            {tab === "reports" && (
              <Reports generatePDF={generatePDF} generateCSV={generateCSV} generateExcel={generateExcel} />
            )}
            {tab === "settings" && (
              <Box sx={{ p: 4 }}>
                <Typography variant="h6">{t("settingsContent")}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ErrorBoundary>
  );
}
