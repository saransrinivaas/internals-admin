// DepartmentDashboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import GlobalChat from "./GlobalChat";
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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import CloseIcon from "@mui/icons-material/Close";
import { seedHealthcareIssues } from "../utils/seedIssues";
import logo from "./logo.jpg";
import SearchIcon from "@mui/icons-material/Search";

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

// Pie chart colors matching green palette
const PIE_COLORS = ["#6B8E47", "#3b5d3a", "#b7d7a8", "#a2c785", "#486a3e"];

// Helper to get readable location (replace with your actual geocoding logic/API if available)
const getReadableLocation = (issue) => {
  if (issue.address) return issue.address;
  if (issue.locationName) return issue.locationName;
  if (issue.location && issue.location.lat && issue.location.lng)
    return `Lat: ${issue.location.lat}, Lng: ${issue.location.lng}`;
  return "-";
};

// Helper to get date string (YYYY-MM-DD) from Firestore Timestamp or string
function getDateString(createdAt) {
  if (!createdAt) return null;
  if (typeof createdAt === "string") {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  }
  if (createdAt && createdAt.seconds) {
    const d = new Date(createdAt.seconds * 1000);
    return d.toISOString().slice(0, 10);
  }
  if (createdAt instanceof Date) {
    return createdAt.toISOString().slice(0, 10);
  }
  return null;
}

// Build heatmap data for last 90 days
const today = new Date();
const days = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() - (89 - i));
  return d.toISOString().slice(0, 10);
});


// Color scale (light to dark green)
function getColor(count) {
  if (count === 0) return "#eaf4e6";
  if (count === 1) return "#b7d7a8";
  if (count <= 3) return "#6B8E47";
  if (count <= 6) return "#486a3e";
  return "#3b5d3a";
}

export default function DepartmentDashboard() {
  const [issues, setIssues] = useState([]);
  const [dept, setDept] = useState(null);
  const [tab, setTab] = useState("dashboard"); // Default to dashboard
  const [locale, setLocale] = useState("en");
  const [staffList, setStaffList] = useState([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [statusEdit, setStatusEdit] = useState({}); // { [issueId]: newStatus }
  const [search, setSearch] = useState(""); // For search filter
  const [reportLoading, setReportLoading] = useState(false);
  const [completedSearch, setCompletedSearch] = useState(""); // For completed issues search
  const navigate = useNavigate();
  const { deptId } = useParams();

  const departmentReportHeaders = [
    "Category",
    "Description",
    "Status",
    "Priority",
    "Location",
    "User Name",
    "User Email",
    "Staff Name",
    "Staff Email",
  ];
  const dayCounts = {};
days.forEach(day => { dayCounts[day] = 0; });
issues.forEach(issue => {
  const day = getDateString(issue.createdAt);
  if (day && dayCounts[day] !== undefined) {
    dayCounts[day]++;
  }
});

  const departmentReportData = issues.map((item) => ({
    Category: item.category || "",
    Description: item.description || "",
    Status: item.status || "",
    Priority: item.priority || "",
    Location: item.location
      ? `Lat: ${item.location.lat}, Lng: ${item.location.lng}`
      : "",
    UserName: item.userName || item.userDisplayName || "N/A",
    UserEmail: item.userEmail || "N/A",
    StaffName: item.assignedToName || "N/A",
    StaffEmail: item.assignedTo || "N/A",
  }));

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
      }
    };

    init();

    return () => {
      try {
        unsubIssues();
        unsubStaff();
      } catch {}
    };
  }, [deptId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("department");
    navigate("/");
  };

  const handleViewImage = (url) => {
    setImageUrl(url);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setImageUrl("");
  };

  const handleStatusEdit = (issueId, newStatus) => {
    setStatusEdit((prev) => ({ ...prev, [issueId]: newStatus }));
  };

  const handleStatusConfirm = async (issueId) => {
    await handleStatusChangeByHead(issueId, statusEdit[issueId]);
    setStatusEdit((prev) => {
      const copy = { ...prev };
      delete copy[issueId];
      return copy;
    });
  };

  const handleStatusCancel = (issueId) => {
    setStatusEdit((prev) => {
      const copy = { ...prev };
      delete copy[issueId];
      return copy;
    });
  };

  const downloadDepartmentPDF = async () => {
    setReportLoading(true);
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${dept.name} Department Issues Report`, 10, 14);
    doc.setFontSize(10);

    const tableRows = departmentReportData.map((row) => [
      row.Category,
      row.Description,
      row.Status,
      row.Priority,
      row.Location,
      row.UserName,
      row.UserEmail,
      row.StaffName,
      row.StaffEmail,
    ]);

    autoTable(doc, {
      startY: 20,
      head: [departmentReportHeaders],
      body: tableRows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [107, 142, 71] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 10, left: 10, right: 10, bottom: 10 },
    });

    doc.save(`${dept.name}_issues_report.pdf`);
    setReportLoading(false);
  };

  const downloadDepartmentCSV = () => {
    if (departmentReportData.length === 0) return;
    const csvHeaders = departmentReportHeaders.join(",");
    const csvRows = departmentReportData
      .map((row) =>
        departmentReportHeaders
          .map((h) => `"${String(row[h] || "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const csvContent = `${csvHeaders}\n${csvRows}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${dept.name}_issues_report.csv`);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadDepartmentExcel = async () => {
    setReportLoading(true);
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(departmentReportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issues Report");
    XLSX.writeFile(workbook, `${dept.name}_issues_report.xlsx`);
    setReportLoading(false);
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

  // Filtered issues for "Verified" and "In Progress"
  const filteredIssues = issues.filter(
    (i) =>
      (i.status === "Pending" || i.status === "In Progress") &&
      (i.category?.toLowerCase().includes(search.toLowerCase()) ||
        i.description?.toLowerCase().includes(search.toLowerCase()) ||
        i.priority?.toLowerCase().includes(search.toLowerCase()) ||
        getReadableLocation(i).toLowerCase().includes(search.toLowerCase()) ||
        i.assignedToName?.toLowerCase().includes(search.toLowerCase()))
  );

  // Completed issues for "Completed" or "Resolved"
  const completedIssues = issues.filter(
    (i) =>
      (i.status === "Completed" || i.status === "Resolved") &&
      (i.category?.toLowerCase().includes(completedSearch.toLowerCase()) ||
        i.description?.toLowerCase().includes(completedSearch.toLowerCase()) ||
        i.priority?.toLowerCase().includes(completedSearch.toLowerCase()) ||
        getReadableLocation(i).toLowerCase().includes(completedSearch.toLowerCase()) ||
        i.assignedToName?.toLowerCase().includes(completedSearch.toLowerCase()))
  );

  return (
    <Box sx={{ height: "100vh", bgcolor: C.bg }}>
      {/* Top Bar */}
      <Box
        sx={{
          width: "100%",
          bgcolor: C.olive,
          color: "#fff",
          height: { xs: 120, md: 120 },
          display: "flex",
          alignItems: "center",
          px: { xs: 2, md: 5 },
          boxShadow: "0 2px 8px 0 rgba(59,91,39,0.08)",
          position: "relative",
          zIndex: 1200,
        }}
      >
        {/* Centered logo and name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flex: 1,
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: 110,
              width: 110,
              borderRadius: 18,
              objectFit: "contain",
              boxShadow: "0 2px 12px #0002",
              marginRight: 24,
              background: "#fff0",
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h3"
              fontWeight={700}
              noWrap
              sx={{
                letterSpacing: ".5px",
                fontSize: { xs: "2.3rem", md: "3rem" },
                mb: 0.5,
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {dept.name} Dashboard
            </Typography>
           
          </Box>
        </Box>
        {/* Top right controls with notification icon */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            position: "absolute",
            right: { xs: 16, md: 32 },
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <BellIcon style={{ width: 34, height: 34, color: "#fff", cursor: "pointer" }} />
          <Button
            variant="contained"
            sx={{
              bgcolor: C.oliveLight,
              color: "#fff",
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              fontSize: 15,
              boxShadow: "none",
              textTransform: "none",
              "&:hover": { bgcolor: C.accent },
            }}
            onClick={() => setLocale(locale === "en" ? "hi" : "en")}
          >
            {locale === "en" ? texts.en.hindi : texts.hi.english}
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: C.oliveLight,
              color: "#fff",
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              fontSize: 15,
              boxShadow: "none",
              textTransform: "none",
              "&:hover": { bgcolor: C.accent },
            }}
            onClick={handleLogout}
          >
            {texts[locale].logout}
          </Button>
        </Box>
      </Box>

      {/* Main Layout */}
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          height: { xs: "calc(100vh - 120px)", md: "calc(100vh - 120px)" },
          overflow: "hidden",
          border: "none",
          borderRadius: 0,
          boxShadow: "none",
          background: C.bg,
          minHeight: 0,
        }}
      >
        {/* Sidebar Navigation */}
        <nav
          style={{
            background: C.olive,
            minWidth: 220,
            color: C.textLight,
            height: "100%",
            overflowY: "auto",
            userSelect: "none",
            boxShadow: "2px 0 16px 0 rgba(59,91,39,0.07)",
          }}
        >
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
            {[
              {
                key: "dashboard",
                text: "Dashboard",
                icon: <ChartPieIcon style={{ width: 22 }} />,
              },
              {
                key: "issues",
                text: texts[locale].issues,
                icon: <ClipboardDocumentListIcon style={{ width: 22 }} />,
              },
              {
                key: "completed",
                text: "Completed Issues",
                icon: <ChartPieIcon style={{ width: 22 }} />,
              },
              {
                key: "staff",
                text: texts[locale].staff,
                icon: <UsersIcon style={{ width: 22 }} />,
              },
              {
                key: "report",
                text: "Report",
                icon: <ChartPieIcon style={{ width: 22 }} />,
              },
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
                  transition: "background 0.2s",
                }}
              >
                {icon} {text}
              </Box>
            ))}
          </Box>
        </nav>
        {/* Main Content */}
        <Box sx={{ flex: 1, minHeight: "100%", bgcolor: C.bg, overflowY: "auto" }}>
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Dashboard Section */}
            {tab === "dashboard" && (
              <Box>
                <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
                  {[{
                    label: texts[locale].total,
                    value: total,
                  },
                  {
                    label: texts[locale].resolved,
                    value: resolved,
                  },
                  {
                    label: texts[locale].inProgress,
                    value: inProgress,
                  },
                  {
                    label: texts[locale].verified,
                    value: pending,
                  },
                  {
                    label: texts[locale].highPriority,
                    value: highPriority,
                  },
                ].map((s, i) => (
                  <Paper
                    key={i}
                    sx={{
                      width: 180,
                      height: 120,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      bgcolor: C.oliveLight,
                      color: "white",
                      borderRadius: 4,
                      boxShadow: 3,
                      fontWeight: 700,
                      fontSize: 18,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        boxShadow: 6,
                        transform: "scale(1.04)",
                        bgcolor: C.accent,
                      },
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{s.label}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, fontSize: 28 }}>{s.value}</Typography>
                  </Paper>
                ))}
                </Box>
                <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{texts[locale].issuesByStatus}</Typography>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <PieChart width={400} height={300}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label
                        style={{ fontWeight: 600, fontSize: 16 }}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </Box>
                </Paper>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Issues Heatmap (last 90 days)
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {/* Render heatmap as 13 weeks x 7 days grid */}
                  {Array.from({ length: 13 }).map((_, weekIdx) => (
                    <Box key={weekIdx} sx={{ display: "flex", gap: 1 }}>
                      {Array.from({ length: 7 }).map((_, dayIdx) => {
                        const dayIndex = weekIdx * 7 + dayIdx;
                        const day = days[dayIndex];
                        const count = dayCounts[day] || 0;
                        return (
                          <Box
                            key={day}
                            title={`${day}: ${count} issue${count !== 1 ? "s" : ""}`}
                            sx={{
                              width: 22,
                              height: 22,
                              bgcolor: getColor(count),
                              borderRadius: 2,
                              border: "1px solid #d7e9d0",
                              display: "inline-block",
                              transition: "background 0.2s",
                              cursor: "pointer",
                            }}
                          />
                        );
                      })}
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 2, fontSize: 15, color: "#888" }}>
                  Darker squares mean more issues posted on that day.
                </Box>
              </Box>
            )}

            {/* Issue Section: Only Verified and In Progress */}
            {tab === "issues" && (
              <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <SearchIcon sx={{ color: C.olive, mr: 1 }} />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: `1px solid ${C.oliveLight}`,
                      fontSize: 16,
                      width: 260,
                      outline: "none",
                    }}
                  />
                </Box>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: C.oliveLight }}>
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>{texts[locale].category}</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>{texts[locale].description}</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>{texts[locale].status}</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>{texts[locale].priority}</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>{texts[locale].location}</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>{texts[locale].assignedTo}</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>View Image</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredIssues.length ? (
                      filteredIssues.map((issue) => (
                        <TableRow key={issue.id} hover sx={{ bgcolor: "#f7faf7" }}>
                          <TableCell>{issue.category}</TableCell>
                          <TableCell>
                            <Typography sx={{ maxWidth: 180, whiteSpace: "pre-line", wordBreak: "break-word" }}>
                              {issue.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <select
                                value={statusEdit[issue.id] ?? issue.status ?? "Verified"}
                                onChange={(e) => handleStatusEdit(issue.id, e.target.value)}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  border: `1px solid ${C.oliveLight}`,
                                  background: "#f5f7f5",
                                  fontWeight: 600,
                                  minWidth: 120,
                                  fontSize: 15,
                                  color: C.olive,
                                }}
                              >
                                <option value="Verified">{texts[locale].verified}</option>
                                <option value="In Progress">{texts[locale].inProgress}</option>
                                <option value="Completed">{texts[locale].completed}</option>
                              </select>
                              {statusEdit[issue.id] !== undefined && statusEdit[issue.id] !== (issue.status ?? "Verified") && (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    sx={{
                                      bgcolor: C.oliveLight,
                                      color: "#fff",
                                      borderRadius: 2,
                                      px: 1.5,
                                      fontWeight: 600,
                                      fontSize: 13,
                                      ml: 1,
                                      textTransform: "none",
                                      "&:hover": { bgcolor: C.accent },
                                    }}
                                    onClick={() => handleStatusConfirm(issue.id)}
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderColor: C.oliveLight,
                                      color: C.oliveLight,
                                      borderRadius: 2,
                                      px: 1.5,
                                      fontWeight: 600,
                                      fontSize: 13,
                                      ml: 1,
                                      textTransform: "none",
                                      "&:hover": { borderColor: C.accent, color: C.accent },
                                    }}
                                    onClick={() => handleStatusCancel(issue.id)}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{issue.priority}</TableCell>
                          <TableCell>
                            {getReadableLocation(issue)}
                          </TableCell>
                          <TableCell>
                            <FormControl
                              size="small"
                              fullWidth
                              sx={{
                                minWidth: 140,
                                bgcolor: "#f5f7f5",
                                borderRadius: 2,
                                "& .MuiInputLabel-root": { color: C.olive },
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": { borderColor: C.oliveLight },
                                  "&:hover fieldset": { borderColor: C.accent },
                                },
                              }}
                            >
                              <InputLabel sx={{ color: C.olive }}>Assign</InputLabel>
                              <Select
                                value={issue.assignedTo || ""}
                                label="Assign"
                                onChange={(e) => handleAssign(issue.id, e.target.value)}
                                sx={{
                                  color: C.olive,
                                  fontWeight: 600,
                                  bgcolor: "#f5f7f5",
                                  borderRadius: 2,
                                }}
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
                          <TableCell>
                            {issue.imageUrl ? (
                              <Button
                                variant="contained"
                                sx={{
                                  bgcolor: C.olive,
                                  color: "#fff",
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  px: 2,
                                  py: 0.5,
                                  fontSize: 14,
                                  textTransform: "none",
                                  "&:hover": { bgcolor: C.accent },
                                }}
                                onClick={() => handleViewImage(issue.imageUrl)}
                              >
                                View Image
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                No Image
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No issues found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            )}

            {/* Completed Issues Section */}
            {tab === "completed" && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <SearchIcon sx={{ color: C.olive, mr: 1 }} />
                  <input
                    type="text"
                    placeholder="Search completed issues..."
                    value={completedSearch}
                    onChange={e => setCompletedSearch(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: `1px solid ${C.oliveLight}`,
                      fontSize: 16,
                      width: 260,
                      outline: "none",
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {completedIssues.length ? (
                    completedIssues.map((issue) => {
                      const hasImage = !!issue.imageUrl;
                      return (
                        <Paper
                          key={issue.id}
                          sx={{
                            width: 420,
                            minHeight: 220,
                            p: 3,
                            borderRadius: 4,
                            boxShadow: 4,
                            bgcolor: hasImage ? "#eaf4e6" : "#f5f7f5",
                            color: hasImage ? C.oliveDark : "#888",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            cursor: "pointer",
                            transition: "box-shadow 0.2s, transform 0.2s",
                            border: hasImage ? `2px solid ${C.oliveLight}` : `2px dashed ${C.oliveLight}`,
                            "&:hover": {
                              boxShadow: 8,
                              transform: "scale(1.02)",
                              bgcolor: hasImage ? "#d7e9d0" : "#f0f0f0",
                            },
                          }}
                          onClick={() => {
                            if (hasImage) {
                              handleViewImage(issue.imageUrl);
                            } else {
                              setImageDialogOpen(true);
                              setImageUrl(""); // No image
                            }
                          }}
                        >
                          <Typography variant="h6" sx={{ color: C.olive, fontWeight: 700 }}>
                            {issue.category}
                          </Typography>
                          <Typography sx={{ fontWeight: 500, mb: 1 }}>{issue.description}</Typography>
                          <Typography variant="body2" sx={{ color: C.oliveDark }}>
                            Priority: {issue.priority}
                          </Typography>
                          <Typography variant="body2" sx={{ color: C.oliveDark }}>
                            Location: {getReadableLocation(issue)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: C.oliveDark }}>
                            Assigned To: {issue.assignedToName || "Unassigned"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: hasImage ? C.olive : "#bdbdbd",
                              mt: 1,
                              fontWeight: 600,
                            }}
                          >
                            {hasImage ? "Click card to view image" : "No image available"}
                          </Typography>
                        </Paper>
                      );
                    })
                  ) : (
                    <Typography sx={{ color: "#888", fontSize: 18, mt: 2 }}>
                      No completed issues found.
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* Staff Section */}
            {tab === "staff" && (
              <DepartmentStaff dept={dept} buttonColor={C.oliveLight} />
            )}

            {/* Department Report Section */}
            {tab === "report" && (
              <Box sx={{ maxWidth: 1050, marginX: "auto", marginTop: 2, paddingX: 2 }}>
                <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: "bold", textAlign: "center" }}>
                  {dept.name} Department Issues Report
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: 3 }}>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: C.oliveLight,
                      color: "#fff",
                      px: 3,
                      fontWeight: 600,
                      ml: 1,
                      "&:hover": { bgcolor: C.accent },
                    }}
                    onClick={downloadDepartmentPDF}
                    disabled={reportLoading}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: C.oliveLight,
                      color: "#fff",
                      px: 3,
                      fontWeight: 600,
                      ml: 1,
                      "&:hover": { bgcolor: C.accent },
                    }}
                    onClick={downloadDepartmentCSV}
                    disabled={reportLoading}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: C.oliveLight,
                      color: "#fff",
                      px: 3,
                      fontWeight: 600,
                      ml: 1,
                      "&:hover": { bgcolor: C.accent },
                    }}
                    onClick={downloadDepartmentExcel}
                    disabled={reportLoading}
                  >
                    Export Excel
                  </Button>
                </Box>
                <Paper sx={{ p: 2, borderRadius: 4, boxShadow: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: C.oliveLight }}>
                        {departmentReportHeaders.map((head) => (
                          <TableCell
                            key={head}
                            sx={{
                              backgroundColor: C.oliveLight,
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: 16,
                              textAlign: "center",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {head}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departmentReportData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={departmentReportHeaders.length} align="center">
                            No data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        departmentReportData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.Category}</TableCell>
                            <TableCell>{row.Description}</TableCell>
                            <TableCell>{row.Status}</TableCell>
                            <TableCell>{row.Priority}</TableCell>
                            <TableCell>{getReadableLocation(row)}</TableCell>
                            <TableCell>{row.UserName}</TableCell>
                            <TableCell sx={{ maxWidth: 190, wordWrap: "break-word" }}>{row.UserEmail}</TableCell>
                            <TableCell>{row.StaffName}</TableCell>
                            <TableCell sx={{ maxWidth: 190, wordWrap: "break-word" }}>{row.StaffEmail}</TableCell>
                          </TableRow>
                        ))
                     ) }
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {/* Image Dialog */}
            <Dialog open={imageDialogOpen} onClose={handleCloseImageDialog} maxWidth="sm" fullWidth>
              <DialogTitle>
                Issue Image
                <IconButton
                  aria-label="close"
                  onClick={handleCloseImageDialog}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: C.olive,
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f7faf7" }}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Issue"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      borderRadius: 12,
                      boxShadow: "0 2px 12px #0002",
                    }}
                  />
                ) : (
                  <Typography sx={{ color: C.olive, fontWeight: 600, fontSize: 18 }}>
                    No image available.
                  </Typography>
                )}
              </DialogContent>
            </Dialog>
          </Box>
        </Box>
      </Box>
      <GlobalChat user={{ id: dept.id, name: dept.name }} />
    </Box>
  );
}