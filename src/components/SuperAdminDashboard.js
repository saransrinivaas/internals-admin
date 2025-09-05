import React, { useState, useEffect } from "react";
import { Box , Typography } from "@mui/material";
import { signOut as firebaseSignOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Import your section components here (or inline as needed)
import Dashboard from "./Dashboard";
import Departments from "./Departments";
import Users from "./Users";
import Reports from "./Reports";

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
};

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "departments", label: "Departments" },
  { key: "users", label: "Users" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
];

// Inline ErrorBoundary component
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
          <Typography variant="h5" gutterBottom>Something went wrong.</Typography>
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default function SuperAdminDashboard() {
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

  // Your existing handlers here ...
  const handleAddDepartment = async (name, routingRule) => { /*...*/ };
  const handleDeleteDepartment = async (id) => { /*...*/ };
  const handleInviteUser = async (email, role) => { /*...*/ };
  const generatePDF = () => alert("Generate PDF called");
  const generateCSV = () => alert("Generate CSV called");
  const generateExcel = () => alert("Generate Excel called");
  const handleLogout = () => {
    firebaseSignOut(auth);
    navigate("/");
  };

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
            Super Admin Dashboard
          </Typography>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#6B8A47",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#556B2F")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6B8A47")}
          >
            Logout
          </button>
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
              Civic Admin Portal
            </Box>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {menuItems.map(({ key, label }) => {
                const Icon = SB_ICONS[key];
                const active = tab === key;
                return (
                  <li
                    key={key}
                    onClick={() => setTab(key)}
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
                    {label}
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
            {tab === "users" && <Users users={users} inviteUser={handleInviteUser} />}
            {tab === "reports" && (
              <Reports
                generatePDF={generatePDF}
                generateCSV={generateCSV}
                generateExcel={generateExcel}
              />
            )}
            {tab === "settings" && <div>Settings content here</div>}
          </Box>
        </Box>
      </Box>
    </ErrorBoundary>
  );
}
