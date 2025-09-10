import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
// ...rest of your code...
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import logo from "./logo.jpg";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";
import LanguageIcon from "@mui/icons-material/Language";
import { useNavigate } from "react-router-dom";

const C = {
  olive: "#3b5d3a",
  oliveDark: "#2e472d",
  oliveLight: "#486a3e",
  textLight: "#ffffff",
  bg: "#f5f7f5",
  accent: "#6B8A47",
};

const PIE_COLORS = ["#6B8E47", "#3b5d3a", "#b7d7a8", "#a2c785", "#486a3e"];

const getReadableLocation = (issue) => {
  if (issue.address) return issue.address;
  if (issue.locationName) return issue.locationName;
  if (issue.location && issue.location.lat && issue.location.lng)
    return `Lat: ${issue.location.lat}, Lng: ${issue.location.lng}`;
  return "-";
};

export default function PublicWorkDepartment() {
  const publicDeptId = "6LUHlHzG0QpCxiYcOomV";
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [allocateDeptId, setAllocateDeptId] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [completedSearch, setCompletedSearch] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [locale, setLocale] = useState("en");
  const navigate = useNavigate();

  // Real-time data for issues and departments
  useEffect(() => {
    const unsubIssues = onSnapshot(
      collection(db, "issues"),
      (snap) => setIssues(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      () => setSnackbar({ open: true, message: "Failed to load issues", severity: "error" })
    );
    const unsubDepartments = onSnapshot(
      collection(db, "departments"),
      (snap) => setDepartments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      () => setSnackbar({ open: true, message: "Failed to load departments", severity: "error" })
    );
    return () => {
      unsubIssues();
      unsubDepartments();
    };
  }, []);

  // All issues where departmentId is publicDeptId
  const visibleIssues = issues.filter(issue => issue.departmentId === publicDeptId);

  // Stats for dashboard
  const total = visibleIssues.length;
  const resolved = visibleIssues.filter(
    (i) => i.status === "Resolved" || i.status === "Completed"
  ).length;
  const inProgress = visibleIssues.filter((i) => i.status === "In Progress").length;
  const pending = visibleIssues.filter((i) => i.status === "Verified").length;
  const highPriority = visibleIssues.filter((i) => i.priority === "High").length;

  const pieData = [
    { name: "Verified", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Completed", value: resolved },
  ];

  // Filtered issues for "Verified" and "In Progress"
  const filteredIssues = visibleIssues.filter(
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
  const completedIssues = visibleIssues.filter(
    (i) =>
      (i.status === "Completed" || i.status === "Resolved") &&
      (
        i.category?.toLowerCase().includes(completedSearch.toLowerCase()) ||
        i.description?.toLowerCase().includes(completedSearch.toLowerCase()) ||
        i.priority?.toLowerCase().includes(completedSearch.toLowerCase()) ||
        getReadableLocation(i).toLowerCase().includes(completedSearch.toLowerCase())
      )
  );

  // Handle allocation to another department (will remove from this dashboard)
  const handleAllocate = async () => {
    if (!selectedIssue || !allocateDeptId) return;
    const dept = departments.find(d => d.id === allocateDeptId);
    if (!dept) {
      setSnackbar({ open: true, message: "Invalid department", severity: "error" });
      return;
    }
    try {
      await updateDoc(doc(db, "issues", selectedIssue.id), {
        departmentId: dept.id,
        departmentEmail: dept.email,
        departmentName: dept.name,
        isAllocated: true
      });
      setSnackbar({ open: true, message: "Allocated to selected department", severity: "success" });
      setSelectedIssue(null);
      setAllocateDeptId("");
    } catch {
      setSnackbar({ open: true, message: "Failed to allocate", severity: "error" });
    }
  };

  const handleViewImage = (url) => {
    setImageUrl(url);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setImageUrl("");
  };

  const handleLogout = () => {
    // Add your logout logic here (e.g., clear localStorage, sign out, etc.)
    navigate("/");
  };

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
              Public Works Department Dashboard
            </Typography>
          </Box>
        </Box>

        {/* Top Bar Buttons (match DepartmentDashboard) */}
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
            startIcon={<LanguageIcon />}
          >
            {locale === "en" ? "हिन्दी" : "ENGLISH"}
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
            startIcon={<LogoutIcon />}
          >
            LOGOUT
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
              { key: "dashboard", text: "Dashboard" },
              { key: "issues", text: "Issues" },
              { key: "completed", text: "Completed Issues" },
            ].map(({ key, text }) => (
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
                {text}
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
                  {[
                    { label: "Total", value: total },
                    { label: "Resolved", value: resolved },
                    { label: "In Progress", value: inProgress },
                    { label: "Verified", value: pending },
                    { label: "High Priority", value: highPriority },
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
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Issues by Status</Typography>
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

            {/* Issues Section */}
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
                {filteredIssues.length === 0 ? (
                  <Typography sx={{ color: "#8fa18b", fontStyle: "italic", textAlign: "center" }}>
                    No issues assigned to Public Works.
                  </Typography>
                ) : (
                  filteredIssues.map(issue => (
                    <Paper key={issue.id} sx={{
                      p: 2.5, my: 2, borderRadius: 3,
                      background: "#f9fbe6", boxShadow: 2, transition: ".2s",
                      border: `2px solid ${C.oliveLight}`,
                      "&:hover": { boxShadow: 7, background: "#ebf2ca" },
                      cursor: "pointer"
                    }}
                      onClick={() => { setSelectedIssue(issue); setAllocateDeptId(""); }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#436f10" }}>
                        {issue.title || "Untitled Issue"}
                      </Typography>
                      <Typography sx={{ color: "#6b7b39", mb: 0.5 }}>
                        {issue.description || "No description."}
                      </Typography>
                      <Typography sx={{
                        fontSize: ".95rem", color: "#aaa", fontStyle: "italic"
                      }}>
                        Category: {issue.category}
                      </Typography>
                      <Typography sx={{ color: "#888", fontSize: 15 }}>
                        Location: {getReadableLocation(issue)}
                      </Typography>
                      {issue.imageUrl &&
                        <Box sx={{ mt: 2, mb: 1, textAlign: "center" }}>
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
                            onClick={e => {
                              e.stopPropagation();
                              handleViewImage(issue.imageUrl);
                            }}
                          >
                            View Image
                          </Button>
                        </Box>
                      }
                    </Paper>
                  ))
                )}
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
                            border: `2px solid ${C.oliveLight}`,
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

            {/* Dialog for allocation */}
            <Dialog
              open={!!selectedIssue}
              onClose={() => setSelectedIssue(null)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Issue Details & Allocation</DialogTitle>
              <DialogContent dividers>
                <Typography sx={{ mb: 2, fontWeight: 700 }}>
                  {selectedIssue?.title}
                </Typography>
                <Typography sx={{ mb: 2 }}>{selectedIssue?.description}</Typography>
                {selectedIssue?.imageUrl &&
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <img src={selectedIssue?.imageUrl} alt="Issue" style={{ maxWidth: "90%", borderRadius: 6 }} />
                  </Box>
                }
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel id="allocate-dept-label">Allocate To Department</InputLabel>
                  <Select
                    labelId="allocate-dept-label"
                    value={allocateDeptId}
                    label="Allocate To Department"
                    onChange={e => setAllocateDeptId(e.target.value)}
                  >
                    {departments
                      .filter(dept => dept.id !== publicDeptId)
                      .map(dept => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setSelectedIssue(null)}
                  sx={{
                    bgcolor: "#fff",
                    color: C.olive,
                    border: `1px solid ${C.oliveLight}`,
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#f5f7f5" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!allocateDeptId}
                  variant="contained"
                  sx={{
                    bgcolor: C.olive,
                    color: "#fff",
                    fontWeight: 600,
                    "&:hover": { bgcolor: C.accent },
                  }}
                  onClick={handleAllocate}
                >
                  Allocate
                </Button>
              </DialogActions>
            </Dialog>

            {/* Image Dialog */}
            <Dialog open={imageDialogOpen} onClose={handleCloseImageDialog} maxWidth="sm" fullWidth>
              <DialogTitle>
                Issue Image
                <Button
                  aria-label="close"
                  onClick={handleCloseImageDialog}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: C.olive,
                    minWidth: 0,
                  }}
                >
                  ×
                </Button>
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

            <Snackbar
              open={snackbar.open}
              autoHideDuration={3500}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}