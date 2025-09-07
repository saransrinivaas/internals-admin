// StaffDashboard.jsx
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
} from "@mui/material";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [assignedIssues, setAssignedIssues] = useState([]);

  // ✅ load staff from localStorage
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

  // ✅ listen for issues assigned to this staff (by email)
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

  // ✅ update issue status
  const handleSetStatus = async (issueId, status) => {
    try {
      await updateDoc(doc(db, "issues", issueId), { status });
      // onSnapshot will refresh automatically
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("staff");
    navigate("/login");
  };

  if (!staff) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7f5", p: 2 }}>
      <Paper
        sx={{ p: 3, maxWidth: 1000, mx: "auto", mt: 3, borderRadius: 3 }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Welcome, {staff.name || staff.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Department: {staff.departmentName || staff.department}
            </Typography>
          </Box>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        {/* Assigned Issues */}
        <Typography sx={{ mt: 3, mb: 2 }}>Issues assigned to you:</Typography>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedIssues.length ? (
                assignedIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>{issue.category}</TableCell>
                    <TableCell>{issue.description}</TableCell>
                    <TableCell>{issue.status || "Verified"}</TableCell>
                    <TableCell>{issue.priority}</TableCell>
                    <TableCell>
                      Lat: {issue.location?.lat || "-"}, Lng:{" "}
                      {issue.location?.lng || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSetStatus(issue.id, "In Progress")}
                        sx={{ mr: 1 }}
                        disabled={issue.status === "In Progress"}
                      >
                        In Progress
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSetStatus(issue.id, "Completed")}
                        disabled={issue.status === "Completed"}
                      >
                        Completed
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ fontStyle: "italic" }}
                  >
                    No assigned issues.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Paper>
    </Box>
  );
}