import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function PublicWorkDepartment() {
  const publicDeptId = "6LUHlHzG0QpCxiYcOomV";
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [allocateDeptId, setAllocateDeptId] = useState("");

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fafbfd",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        py: 4,
      }}
    >
      <Paper
        sx={{
          maxWidth: 900, mx: "auto", width: 1, p: 4, borderRadius: 4,
          boxShadow: 5, mt: 2, background: "#eef5df"
        }}
      >
        <Typography variant="h3" sx={{
          color: "#44631b", textAlign: "center", fontWeight: 700, mb: 4, letterSpacing: 1
        }}>
          Public Works Department Dashboard
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#60842b", mb: 2 }}>
          Assigned Issues
        </Typography>
        {visibleIssues.length === 0 ? (
          <Typography sx={{ color: "#8fa18b", fontStyle: "italic", textAlign: "center" }}>
            No issues assigned to Public Works.
          </Typography>
        ) : (
          visibleIssues.map(issue => (
            <Paper key={issue.id} sx={{
              p: 2.5, my: 2, borderRadius: 3,
              background: "#f9fbe6", boxShadow: 2, transition: ".2s",
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
              {issue.imageUrl &&
                <Box sx={{ mt: 2, mb: 1, textAlign: "center" }}>
                  <img
                    src={issue.imageUrl}
                    alt="Issue"
                    style={{ maxWidth: 280, borderRadius: 7, boxShadow: "0 2px 12px #c2d1a3" }}
                  />
                </Box>
              }
            </Paper>
          ))
        )}
      </Paper>
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
          <Button onClick={() => setSelectedIssue(null)}>Cancel</Button>
          <Button
            disabled={!allocateDeptId}
            variant="contained"
            onClick={handleAllocate}
          >
            Allocate
          </Button>
        </DialogActions>
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
  );
}
