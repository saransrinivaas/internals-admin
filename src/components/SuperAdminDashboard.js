import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
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
  BuildingOfficeIcon, // ✅ replaced BuildingIcon with BuildingOfficeIcon
  UserIcon,
  DocumentIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

import Dashboard from "./Dashboard";
import Departments from "./Departments";
import Users from "./Users";
import Reports from "./Reports";
import Heatmap from "./Heatmap";
import CategoryPage from "./Category";
import StaffSection from "./StaffSection";

import { auth, db } from "../firebase";

const C = {
  olive: "#3b5b27",
  oliveDark: "#2e4720",
  oliveLight: "#486c2c",
  textLight: "#ffffff",
  bg: "#f5f7f5",
  accent: "#6b8e47",
};

const SB_ICONS = {
  dashboard: ChartBarIcon,
  departments: BuildingOfficeIcon, // ✅ fixed
  heatmap: BuildingOfficeIcon,     // ✅ fixed
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
  { key: "settings", label: "Settings" },
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

  const COLORS = ["#FFBB28", "#008FE", "#00C"];

  return (
    <ErrorBoundary>
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: C.bg }}>
        <Box sx={{ backgroundColor: C.olive, color: C.textLight, px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" fontWeight={600}>{t("superAdmin")}</Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              onClick={toggleLanguage}
              sx={{ bgcolor: C.accent, color: C.textLight, borderRadius: 1, px: 3, fontWeight: 500, fontSize: 14, "&:hover": { bgcolor: C.oliveDark } }}
            >
              {i18n.language === "en" ? "हिन्दी" : "English"}
            </Button>
            <Button
              onClick={handleLogout}
              sx={{ bgcolor: C.accent, color: C.textLight, borderRadius: 1, px: 3, fontWeight: 500, fontSize: 14, "&:hover": { bgcolor: C.oliveDark } }}
            >
              {t("logout")}
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexGrow: 1, height: "calc(100vh - 64px)", overflow: "hidden" }}>
          <nav style={{ background: C.olive, minWidth: 220, color: C.textLight, height: "100%", overflowY: "auto", userSelect: "none" }}>
            <Box sx={{ fontWeight: 800, p: "22px 32px", letterSpacing: ".7px", fontSize: 22, borderBottom: `2px solid ${C.oliveDark}` }}>
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
                      background: active ? C.oliveDark : "transparent",
                      fontWeight: active ? 700 : 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      borderLeft: active ? `5px solid ${C.accent}` : "5px solid transparent",
                      transition: "background-color 0.2s ease",
                      userSelect: "none",
                    }}
                    onMouseEnter={e => !active && (e.currentTarget.style.background = C.oliveLight)}
                    onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon style={{ width: 22, height: 22, opacity: active ? 1 : 0.85 }} />
                    {t(label.toLowerCase())}
                  </li>
                );
              })}
            </ul>
          </nav>
          <Box sx={{ flex: 1, p: 4, overflowY: "auto" }}>
            {tab === "dashboard" && <Dashboard issues={issues} />}
            {tab === "departments" && (
              <Departments
                departments={departments}
                addDepartment={handleAddDepartment}
                deleteDepartment={handleDeleteDepartment}
              />
            )}
            {tab === "staff" && <StaffSection departments={departments} staff={staff} setStaff={setStaff} />}
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
            {tab === "settings" && (
              <Box>
                <Typography variant="h5" color={C.olive}>
                  Settings (Coming Soon)
                </Typography>
              </Box>
            )}
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
