import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import logo from "./logo.jpg";

// Color palette
const C = {
  olive: "#3b5d3a",
  oliveDark: "#2e472d",
  oliveLight: "#486a3e",
  textLight: "#ffffff",
  bg: "#f5f7f5",
  accent: "#6B8A47",
};
const PIE_COLORS = ["#6B8E47", "#3b5d3a", "#b7d7a8", "#a2c785", "#486a3e"];

// Helper to get readable location
const getReadableLocation = (issue) => {
  if (issue.address) return issue.address;
  if (issue.locationName) return issue.locationName;
  if (issue.location && issue.location.lat && issue.location.lng)
    return `Lat: ${issue.location.lat}, Lng: ${issue.location.lng}`;
  return "-";
};

const texts = {
  en: {
    dashboard: "Dashboard",
    issues: "Issues",
    completed: "Completed Issues",
    reports: "Report",
    total: "Total",
    resolved: "Resolved",
    inProgress: "In Progress",
    verified: "Verified",
    completedLabel: "Completed",
    highPriority: "High Priority",
    logout: "LOGOUT",
    category: "Category",
    description: "Description",
    status: "Status",
    priority: "Priority",
    location: "Location",
    assignedTo: "Assigned To",
    issuesByStatus: "Issues by Status",
    hindi: "हिन्दी",
    english: "ENGLISH",
    staff: "Staff",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    issues: "मुद्दे",
    completed: "पूर्ण मुद्दे",
    reports: "रिपोर्ट",
    total: "कुल",
    resolved: "समाधान हो गया",
    inProgress: "प्रगति पर",
    verified: "सत्यापित",
    completedLabel: "पूर्ण",
    highPriority: "उच्च प्राथमिकता",
    logout: "लॉग आउट",
    category: "श्रेणी",
    description: "विवरण",
    status: "स्थिति",
    priority: "प्राथमिकता",
    location: "स्थान",
    assignedTo: "नियुक्त",
    issuesByStatus: "स्थिति के अनुसार मुद्दे",
    hindi: "हिन्दी",
    english: "ENGLISH",
    staff: "स्टाफ",
  },
};

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [locale, setLocale] = useState("en");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [search, setSearch] = useState("");
  const [completedSearch, setCompletedSearch] = useState("");

  // Load staff from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("staff");
    if (!raw) {
      navigate("/login");
      return;
    }
    try {
      const s = JSON.parse(raw);
      setStaff(s);
    } catch {
      localStorage.removeItem("staff");
      navigate("/login");
    }
  }, [navigate]);

  // Listen for issues assigned to this staff (by email)
  useEffect(() => {
    if (!staff?.email) return;
    const q = query(
      collection(db, "issues"),
      where("assignedTo", "==", staff.email)
    );
    const unsub = onSnapshot(q, (snap) => {
      setAssignedIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [staff?.email]);

  // Update issue status
  const handleSetStatus = async (issueId, status) => {
    try {
      await updateDoc(doc(db, "issues", issueId), { status });
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status: " + err.message);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("staff");
    navigate("/login");
  };

  const handleViewImage = (url) => {
    setImageUrl(url);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setImageUrl("");
  };

  if (!staff) return null;

  // Stats for dashboard
  const total = assignedIssues.length;
  const resolved = assignedIssues.filter(
    (i) => i.status === "Resolved" || i.status === "Completed"
  ).length;
  const inProgress = assignedIssues.filter((i) => i.status === "In Progress").length;
  const pending = assignedIssues.filter((i) => i.status === "Verified").length;
  const highPriority = assignedIssues.filter((i) => i.priority === "High").length;

  const pieData = [
    { name: texts[locale].verified, value: pending },
    { name: texts[locale].inProgress, value: inProgress },
    { name: texts[locale].completedLabel, value: resolved },
  ];

  // Filtered issues for "Verified" and "In Progress"
  const filteredIssues = assignedIssues.filter(
    (i) =>
      (i.status === "Verified" || i.status === "In Progress") &&
      (
        i.category?.toLowerCase().includes(search.toLowerCase()) ||
        i.description?.toLowerCase().includes(search.toLowerCase()) ||
        i.priority?.toLowerCase().includes(search.toLowerCase()) ||
        getReadableLocation(i).toLowerCase().includes(search.toLowerCase())
      )
  );

  // Completed issues for "Completed" or "Resolved"
  const completedIssues = assignedIssues.filter(
    (i) =>
      (i.status === "Completed" || i.status === "Resolved") &&
      (
        i.category?.toLowerCase().includes(completedSearch.toLowerCase()) ||
        i.description?.toLowerCase().includes(completedSearch.toLowerCase()) ||
        i.priority?.toLowerCase().includes(completedSearch.toLowerCase()) ||
        getReadableLocation(i).toLowerCase().includes(completedSearch.toLowerCase())
      )
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
              {staff.departmentName || staff.department} Staff Dashboard
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
                text: texts[locale].dashboard,
                icon: <ChartPieIcon style={{ width: 22 }} />,
              },
              {
                key: "issues",
                text: texts[locale].issues,
                icon: <ClipboardDocumentListIcon style={{ width: 22 }} />,
              },
              {
                key: "completed",
                text: texts[locale].completed,
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
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>View Image</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>Actions</TableCell>
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
                            <Chip
                              label={issue.status || "Verified"}
                              color={
                                issue.status === "In Progress"
                                  ? "info"
                                  : issue.status === "Completed"
                                  ? "success"
                                  : "default"
                              }
                              size="small"
                              sx={{ fontWeight: 700, minWidth: 90 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={issue.priority || "Medium"}
                              color={
                                issue.priority === "High"
                                  ? "error"
                                  : issue.priority === "Low"
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                              sx={{ fontWeight: 700, minWidth: 70 }}
                            />
                          </TableCell>
                          <TableCell>{getReadableLocation(issue)}</TableCell>
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
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleSetStatus(issue.id, "In Progress")}
                              sx={{
                                mr: 1,
                                textTransform: "none",
                                fontWeight: 600,
                                borderColor:
                                  issue.status === "In Progress"
                                    ? "#a3b18a"
                                    : "#556b2f",
                                color:
                                  issue.status === "In Progress"
                                    ? "#a3b18a"
                                    : "#556b2f",
                                "&:hover": {
                                  bgcolor:
                                    issue.status === "In Progress"
                                      ? "#d7e3b0"
                                      : "#778c4a",
                                  borderColor:
                                    issue.status === "In Progress"
                                      ? "#a3b18a"
                                      : "#556b2f",
                                  color: "#fff",
                                },
                              }}
                              disabled={issue.status === "In Progress"}
                            >
                              In Progress
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleSetStatus(issue.id, "Completed")}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                bgcolor: "#556b2f",
                                "&:hover": {
                                  bgcolor: "#3e5920",
                                  boxShadow: "0 4px 15px rgba(62,89,32,0.6)",
                                },
                              }}
                              disabled={issue.status === "Completed"}
                            >
                              Completed
                            </Button>
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
                            border: `2px solid ${C.oliveLight}`, // solid line for all cards
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
    </Box>
  );
}