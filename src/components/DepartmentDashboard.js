import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
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
  Grid,
} from "@mui/material";
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
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

export default function DepartmentDashboard() {
  const [issues, setIssues] = useState([]);
  const [dept, setDept] = useState(null);
  const [tab, setTab] = useState("issues");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("department");
    if (!stored) {
      navigate("/dept-login");
      return;
    }
    const deptData = JSON.parse(stored);
    setDept(deptData);

    const fetchIssues = async () => {
      try {
        const q = query(
          collection(db, "issues"),
          where("departmentId", "==", deptData.id)
        );
        const querySnapshot = await getDocs(q);
        const deptIssues = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (deptIssues.length === 0) {
          await seedHealthcareIssues(db, deptData.id);
          const seededSnapshot = await getDocs(q);
          setIssues(
            seededSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        } else {
          setIssues(deptIssues);
        }
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    };

    fetchIssues();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("department");
    navigate("/dept-login");
  };

  if (!dept) return null;

  // -------- Reports Data ------------
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const pending = issues.filter((i) => i.status === "Verified").length;
  const highPriority = issues.filter((i) => i.priority === "High").length;

  const pieData = [
    { name: "Verified", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Resolved", value: resolved },
  ];
  const COLORS = ["#FFBB28", "#0088FE", "#00C49F"];

  return (
    <Box sx={{ height: "100vh", display: "flex", bgcolor: C.bg }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          background: C.olive,
          minWidth: 220,
          color: C.textLight,
          height: "100%",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            fontWeight: 800,
            p: "22px 32px",
            fontSize: 20,
            borderBottom: `2px solid ${C.oliveDark}`,
          }}
        >
          {dept.name}
        </Box>
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
          <Box
            component="li"
            onClick={() => setTab("issues")}
            sx={{
              p: "13px 32px",
              cursor: "pointer",
              bgcolor: tab === "issues" ? C.oliveDark : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              "&:hover": { bgcolor: C.oliveLight },
            }}
          >
            <ClipboardDocumentListIcon style={{ width: 20 }} /> Issues
          </Box>
          <Box
            component="li"
            onClick={() => setTab("reports")}
            sx={{
              p: "13px 32px",
              cursor: "pointer",
              bgcolor: tab === "reports" ? C.oliveDark : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              "&:hover": { bgcolor: C.oliveLight },
            }}
          >
            <ChartPieIcon style={{ width: 20 }} /> Reports
          </Box>
          <Box
            component="li"
            onClick={() => setTab("settings")}
            sx={{
              p: "13px 32px",
              cursor: "pointer",
              bgcolor: tab === "settings" ? C.oliveDark : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              "&:hover": { bgcolor: C.oliveLight },
            }}
          >
            <Cog6ToothIcon style={{ width: 20 }} /> Settings
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: 4, overflowY: "auto" }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">
            {dept.name} {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Typography>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        {/* Sort button */}
        {tab === "issues" && (
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              sx={{ bgcolor: C.accent, "&:hover": { bgcolor: C.oliveDark } }}
              onClick={() => {
                const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                setIssues((prev) =>
                  [...prev].sort(
                    (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
                  )
                );
              }}
            >
              Sort by Priority
            </Button>
          </Box>
        )}

        {/* ISSUES TAB */}
        {tab === "issues" && (
          <Paper>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: C.oliveLight }}>
                  <TableCell sx={{ color: "white" }}>Issue ID</TableCell>
                  <TableCell sx={{ color: "white" }}>Category</TableCell>
                  <TableCell sx={{ color: "white" }}>Description</TableCell>
                  <TableCell sx={{ color: "white" }}>Status</TableCell>
                  <TableCell sx={{ color: "white" }}>Priority</TableCell>
                  <TableCell sx={{ color: "white" }}>Location</TableCell>
                  <TableCell sx={{ color: "white" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issues.length > 0 ? (
                  issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>{issue.id}</TableCell>
                      <TableCell>{issue.category}</TableCell>
                      <TableCell>{issue.description}</TableCell>
                      <TableCell>{issue.status}</TableCell>
                      <TableCell>{issue.priority}</TableCell>
                      <TableCell>
                        Lat: {issue.location?.lat}, Lng: {issue.location?.lng}
                      </TableCell>
                      <TableCell>
                        <select
                          value={issue.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await updateDoc(doc(db, "issues", issue.id), {
                                status: newStatus,
                              });
                              setIssues((prev) =>
                                prev.map((i) =>
                                  i.id === issue.id ? { ...i, status: newStatus } : i
                                )
                              );
                            } catch (err) {
                              console.error("Error updating status:", err);
                            }
                          }}
                        >
                          <option value="Verified">Verified</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
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

        {/* REPORTS TAB */}
        {tab === "reports" && (
          <Box>
            <Grid container spacing={2} mb={4}>
              {[
                { label: "Total", value: total },
                { label: "Resolved", value: resolved },
                { label: "In Progress", value: inProgress },
                { label: "Verified", value: pending },
                { label: "High Priority", value: highPriority },
              ].map((stat, i) => (
                <Grid item xs={12} sm={6} md={2} key={i}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: i % 2 === 0 ? C.oliveLight : "white",
                      color: i % 2 === 0 ? "white" : "black",
                    }}
                  >
                    <Typography variant="h6">{stat.label}</Typography>
                    <Typography variant="h5">{stat.value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Issues by Status
              </Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
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

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6">Settings Placeholder</Typography>
            <Typography variant="body2">
              Department-level settings can go here (e.g., change password).
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
