// DepartmentDashboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import DepartmentStaff from "./DepartmentStaff";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { seedHealthcareIssues } from "../utils/seedIssues";

const C = {
  olive: "#3b5d3a",
  oliveDark: "#2e472d",
  oliveLight: "#486a3e",
  textLight: "#ffffff",
  bg: "#f5f7f5",
  accent: "#6B8A47",
};

const texts = {
  en: {
    issueSuffix: "Issues",
    reports: "Reports",
    issues: "Issues",
    settings: "Settings",
    staff: "Staff",
    total: "Total",
    resolved: "Resolved",
    inProgress: "In Progress",
    verified: "Verified",
    completed: "Completed",
    highPriority: "High Priority",
    logout: "LOGOUT",
    category: "Category",
    description: "Description",
    status: "Status",
    priority: "Priority",
    location: "Location",
    actions: "Actions",
    assignedTo: "Assigned To",
    issuesByStatus: "Issues by Status",
    hindi: "हिन्दी",
    english: "ENGLISH",
  },
  hi: {
    issueSuffix: "मुद्दे",
    reports: "रिपोर्ट",
    issues: "मुद्दे",
    settings: "सेटिंग्स",
    staff: "स्टाफ",
    total: "कुल",
    resolved: "समाधान हो गया",
    inProgress: "प्रगति पर",
    verified: "सत्यापित",
    completed: "पूर्ण",
    highPriority: "उच्च प्राथमिकता",
    logout: "लॉग आउट",
    category: "श्रेणी",
    description: "विवरण",
    status: "स्थिति",
    priority: "प्राथमिकता",
    location: "स्थान",
    actions: "कार्य",
    assignedTo: "नियुक्त",
    issuesByStatus: "स्थिति के अनुसार मुद्दे",
    hindi: "हिन्दी",
    english: "ENGLISH",
  },
};

export default function DepartmentDashboard() {
  const [issues, setIssues] = useState([]);
  const [dept, setDept] = useState(null);
  const [tab, setTab] = useState("issues");
  const [locale, setLocale] = useState("en");
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();
  const { deptId } = useParams(); // ✅ route param

  
  useEffect(() => {
  let unsubIssues = () => {};
  let unsubStaff = () => {};

  const init = async () => {
    try {
      if (!deptId) {
        navigate("/login");
        return;
      }

      const deptRef = doc(db, "departments", deptId);
      const deptSnap = await getDoc(deptRef);

      if (!deptSnap.exists()) {
        navigate("/login");
        return;
      }

      const deptData = { id: deptSnap.id, ...deptSnap.data() };
      setDept(deptData);

      // Seed issues if empty
      const qCheck = query(
        collection(db, "issues"),
        where("departmentId", "==", deptData.id)
      );
      const snapshotCheck = await getDocs(qCheck);
      if (snapshotCheck.empty) {
        await seedHealthcareIssues(db, deptData.id);
      }

      // Real-time listener for issues
      const qIssues = query(
        collection(db, "issues"),
        where("departmentId", "==", deptData.id)
      );
      unsubIssues = onSnapshot(qIssues, (snap) => {
        setIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });

      // Real-time listener for staff
      const qStaff = query(
        collection(db, "staff"),
        where("departmentId", "==", deptData.id)
      );
      unsubStaff = onSnapshot(qStaff, (snap) => {
        setStaffList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    } catch (err) {
      console.error("Error initializing dashboard:", err);
      // Optionally handle error with state for user feedback
    }
  };

  init();

  return () => {
    try {
      unsubIssues();
      unsubStaff();
    } catch {}
  };
}, [deptId, navigate]); // depend on deptId, navigate
// ✅ depend on deptId

  const handleLogout = () => {
    localStorage.removeItem("department");
    navigate("/");
  };

 if (!dept) {
  return (
    <div style={{ textAlign: "center", marginTop: "60px", fontSize: "1.2rem" }}>
      Loading department dashboard...
    </div>
  );
}


  // Reports logic
  const total = issues.length;
  const resolved = issues.filter(
    (i) => i.status === "Resolved" || i.status === "Completed"
  ).length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const pending = issues.filter((i) => i.status === "Verified").length;
  const highPriority = issues.filter((i) => i.priority === "High").length;

  const pieData = [
    { name: texts[locale].verified, value: pending },
    { name: texts[locale].inProgress, value: inProgress },
    { name: texts[locale].completed, value: resolved },
  ];
  const COLORS = ["#FFBB28", "#0088FE", "#00C49F"];

  // ✅ Assign staff using email + name
  const handleAssign = async (issueId, staffEmail) => {
    try {
      const staff = staffList.find((s) => s.email === staffEmail) || null;
      const payload = {
        assignedTo: staff ? staff.email : null,
        assignedToName: staff ? staff.name : null,
        status: staff ? "Assigned" : "Verified",
      };
      await updateDoc(doc(db, "issues", issueId), payload);
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, ...payload } : i))
      );
    } catch (err) {
      console.error("Failed to assign issue:", err);
      alert("Failed to assign issue: " + err.message);
    }
  };

  const handleStatusChangeByHead = async (issueId, newStatus) => {
    try {
      await updateDoc(doc(db, "issues", issueId), { status: newStatus });
      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          background: C.olive,
          minWidth: 280,
          color: C.textLight,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
          {[
            { key: "reports", text: texts[locale].reports, icon: <ChartPieIcon style={{ width: 22 }} /> },
            { key: "issues", text: texts[locale].issues, icon: <ClipboardDocumentListIcon style={{ width: 22 }} /> },
            { key: "staff", text: texts[locale].staff, icon: <UsersIcon style={{ width: 22 }} /> },
            { key: "settings", text: texts[locale].settings, icon: <Cog6ToothIcon style={{ width: 22 }} /> },
          ].map(({ key, text, icon }) => (
            <Box
              key={key}
              component="li"
              onClick={() => setTab(key)}
              sx={{
                p: "13px 32px",
                cursor: "pointer",
                bgcolor: tab === key ? C.oliveDark : "transparent",
                display: "flex",
                alignItems: "center",
                gap: 2,
                fontSize: 19,
                "&:hover": { bgcolor: C.oliveLight },
              }}
            >
              {icon} {text}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main */}
      <Box sx={{ flex: 1, minHeight: "100vh", bgcolor: C.bg }}>
        {/* Top Bar */}
        <Box
          sx={{
            width: "100%",
            bgcolor: C.olive,
            color: "#fff",
            height: "68px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 5,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {dept.name} Department {tab === "issues" && texts[locale].issueSuffix}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              sx={{ bgcolor: C.oliveLight, "&:hover": { bgcolor: C.accent } }}
              onClick={() => setLocale(locale === "en" ? "hi" : "en")}
            >
              {locale === "en" ? texts.en.hindi : texts.hi.english}
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: C.oliveLight, "&:hover": { bgcolor: C.accent } }}
              onClick={handleLogout}
            >
              {texts[locale].logout}
            </Button>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4, overflowY: "auto" }}>
          {tab === "issues" && (
            <Paper>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: C.oliveLight }}>
                    <TableCell sx={{ color: "white" }}>{texts[locale].category}</TableCell>
                    <TableCell sx={{ color: "white" }}>{texts[locale].description}</TableCell>
                    <TableCell sx={{ color: "white" }}>{texts[locale].status}</TableCell>
                    <TableCell sx={{ color: "white" }}>{texts[locale].priority}</TableCell>
                    <TableCell sx={{ color: "white" }}>{texts[locale].location}</TableCell>
                    <TableCell sx={{ color: "white" }}>{texts[locale].assignedTo}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.length ? (
                    issues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>{issue.category}</TableCell>
                        <TableCell>{issue.description}</TableCell>
                        <TableCell>
                          <select
                            value={issue.status || "Verified"}
                            onChange={(e) =>
                              handleStatusChangeByHead(issue.id, e.target.value)
                            }
                          >
                            <option value="Verified">{texts[locale].verified}</option>
                            <option value="In Progress">{texts[locale].inProgress}</option>
                            <option value="Completed">{texts[locale].completed}</option>
                          </select>
                        </TableCell>
                        <TableCell>{issue.priority}</TableCell>
                        <TableCell>
                          Lat: {issue.location?.lat || "-"}, Lng: {issue.location?.lng || "-"}
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Assign</InputLabel>
                            <Select
                              value={issue.assignedTo || ""}
                              onChange={(e) => handleAssign(issue.id, e.target.value)}
                            >
                              <MenuItem value="">
                                <em>Unassigned</em>
                              </MenuItem>
                              {staffList.map((s) => (
                                <MenuItem key={s.id} value={s.email}>
                                  {s.name} ({s.email})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {issue.assignedToName && (
                            <Typography variant="caption">
                              {issue.assignedToName}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No issues found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          )}

          {tab === "staff" && <DepartmentStaff dept={dept} />}

          {tab === "reports" && (
            <Box>
              <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                {[
                  { label: texts[locale].total, value: total },
                  { label: texts[locale].resolved, value: resolved },
                  { label: texts[locale].inProgress, value: inProgress },
                  { label: texts[locale].verified, value: pending },
                  { label: texts[locale].highPriority, value: highPriority },
                ].map((s, i) => (
                  <Paper
                    key={i}
                    sx={{
                      width: 150,
                      height: 100,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      bgcolor: C.oliveLight,
                      color: "white",
                    }}
                  >
                    <Typography variant="subtitle1">{s.label}</Typography>
                    <Typography variant="h6">{s.value}</Typography>
                  </Paper>
                ))}
              </Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6">{texts[locale].issuesByStatus}</Typography>
                <PieChart width={400} height={300}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </Paper>
            </Box>
          )}

          {tab === "settings" && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6">{texts[locale].settings}</Typography>
              <Typography variant="body2">Add settings content here</Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}