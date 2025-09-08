// // StaffDashboard.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Box,
//   Typography,
//   Paper,
//   Button,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
// } from "@mui/material";
// import { db } from "../firebase";
// import {
//   collection,
//   query,
//   where,
//   onSnapshot,
//   updateDoc,
//   doc,
// } from "firebase/firestore";

// export default function StaffDashboard() {
//   const navigate = useNavigate();
//   const [staff, setStaff] = useState(null);
//   const [assignedIssues, setAssignedIssues] = useState([]);

//   // ✅ load staff from localStorage
//   useEffect(() => {
//     const raw = localStorage.getItem("staff");
//     if (!raw) {
//       navigate("/login");
//       return;
//     }
//     try {
//       const s = JSON.parse(raw);
//       setStaff(s);
//     } catch {
//       localStorage.removeItem("staff");
//       navigate("/login");
//     }
//   }, [navigate]);

//   // ✅ listen for issues assigned to this staff (by email)
//   useEffect(() => {
//     if (!staff?.email) return;
//     const q = query(
//       collection(db, "issues"),
//       where("assignedTo", "==", staff.email)
//     );
//     const unsub = onSnapshot(q, (snap) => {
//       setAssignedIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
//     });
//     return () => unsub();
//   }, [staff?.email]);

//   // ✅ update issue status
//   const handleSetStatus = async (issueId, status) => {
//     try {
//       await updateDoc(doc(db, "issues", issueId), { status });
//       // onSnapshot will refresh automatically
//     } catch (err) {
//       console.error("Failed to update status:", err);
//       alert("Failed to update status: " + err.message);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("staff");
//     navigate("/login");
//   };

//   if (!staff) return null;

//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7f5", p: 2 }}>
//       <Paper
//         sx={{ p: 3, maxWidth: 1000, mx: "auto", mt: 3, borderRadius: 3 }}
//       >
//         {/* Header */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <Box>
//             <Typography variant="h5" fontWeight={700}>
//               Welcome, {staff.name || staff.email}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Department: {staff.departmentName || staff.department}
//             </Typography>
//           </Box>
//           <Button variant="contained" color="error" onClick={handleLogout}>
//             Logout
//           </Button>
//         </Box>

//         {/* Assigned Issues */}
//         <Typography sx={{ mt: 3, mb: 2 }}>Issues assigned to you:</Typography>

//         <Paper>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Category</TableCell>
//                 <TableCell>Description</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell>Priority</TableCell>
//                 <TableCell>Location</TableCell>
//                 <TableCell>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {assignedIssues.length ? (
//                 assignedIssues.map((issue) => (
//                   <TableRow key={issue.id}>
//                     <TableCell>{issue.category}</TableCell>
//                     <TableCell>{issue.description}</TableCell>
//                     <TableCell>{issue.status || "Verified"}</TableCell>
//                     <TableCell>{issue.priority}</TableCell>
//                     <TableCell>
//                       Lat: {issue.location?.lat || "-"}, Lng:{" "}
//                       {issue.location?.lng || "-"}
//                     </TableCell>
//                     <TableCell>
//                       <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={() => handleSetStatus(issue.id, "In Progress")}
//                         sx={{ mr: 1 }}
//                         disabled={issue.status === "In Progress"}
//                       >
//                         In Progress
//                       </Button>
//                       <Button
//                         variant="contained"
//                         size="small"
//                         onClick={() => handleSetStatus(issue.id, "Completed")}
//                         disabled={issue.status === "Completed"}
//                       >
//                         Completed
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     align="center"
//                     sx={{ fontStyle: "italic" }}
//                   >
//                     No assigned issues.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </Paper>
//       </Paper>
//     </Box>
//   );
// }

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
  Chip,
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
      // onSnapshot refreshes automatically
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

  if (!staff) return null;

  // Status color mapping for Chips
  const statusColors = {
    Verified: "default",
    "In Progress": "info",
    Completed: "success",
  };

  // Priority color mapping for Chips
  const priorityColors = {
    Low: "success",
    Medium: "warning",
    High: "error",
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#556b2f", // olive green background
        p: { xs: 2, md: 4 },
      }}
    >
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          maxWidth: 1100,
          mx: "auto",
          mt: 4,
          borderRadius: 4,
          bgcolor: "#fff", // white paper background
          boxShadow:
            "rgba(0, 0, 0, 0.15) 0px 10px 20px, rgba(0, 0, 0, 0.1) 0px 6px 6px",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#2e4c2f", // dark olive header text
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                mb: 0.5,
              }}
            >
              Welcome, {staff.name || staff.email}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Department: {staff.departmentName || staff.department}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{
              px: 3,
              py: 1.2,
              fontWeight: 600,
              fontSize: 16,
              boxShadow: "0px 4px 10px rgba(255, 0, 0, 0.3)",
              "&:hover": {
                boxShadow: "0px 6px 16px rgba(255, 0, 0, 0.5)",
                bgcolor: "#cc0000",
              },
              borderRadius: 3,
              textTransform: "none",
            }}
          >
            Logout
          </Button>
        </Box>

        {/* Assigned Issues Title */}
        <Typography
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: 20,
            color: "#3e5920",
            borderBottom: "3px solid #a3b18a",
            display: "inline-block",
            pb: 0.5,
          }}
        >
          Issues Assigned To You:
        </Typography>

        {/* Issue Table */}
        <Paper
          sx={{
            borderRadius: 3,
            boxShadow: " rgba(0, 0, 0, 0.1) 0px 4px 12px",
            overflowX: "auto",
          }}
        >
          <Table
            sx={{
              minWidth: 700,
              "& th": {
                bgcolor: "#8a9a5b",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
              },
              "& td": {
                fontSize: 14,
                color: "#2e4c2f",
              },
              "& tbody tr:hover": {
                bgcolor: "#f0f5e6",
              },
            }}
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedIssues.length ? (
                assignedIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {issue.category}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250, whiteSpace: "normal" }}>
                      {issue.description}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={issue.status || "Verified"}
                        color={statusColors[issue.status || "Verified"]}
                        size="small"
                        sx={{ fontWeight: 700, minWidth: 90 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={issue.priority || "Medium"}
                        color={priorityColors[issue.priority] || "warning"}
                        size="small"
                        sx={{ fontWeight: 700, minWidth: 70 }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      Lat: {issue.location?.lat?.toFixed(4) || "-"}, Lng:{" "}
                      {issue.location?.lng?.toFixed(4) || "-"}
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          handleSetStatus(issue.id, "In Progress")
                        }
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
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      fontStyle: "italic",
                      color: "#6b7a35",
                      fontWeight: 600,
                      py: 4,
                    }}
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