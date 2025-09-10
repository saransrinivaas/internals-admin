import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

export default function DepartmentStaff({ departments = [], dept = {} }) {
  const [staff, setStaff] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    deptId: dept.id || "",
  });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStaff = async () => {
      if (!dept?.id) return;
      try {
        const q = query(collection(db, "staff"), where("departmentId", "==", dept.id));
        const snapshot = await getDocs(q);
        setStaff(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Failed to load staff.");
      }
    };
    fetchStaff();
  }, [dept?.id]);

  const handleInputChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddStaff = async () => {
    setError("");
    if (!form.name || !form.email || !form.password || !form.deptId) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      const department = departments.find((d) => d.id === form.deptId);
      const deptName = department ? department.name : "";

      const staffObj = {
        name: form.name,
        email: form.email,
        phone: form.phone || "",
        password: form.password,
        department: deptName,
        departmentId: form.deptId,
        role: "STAFF",
      };

      const staffDocRef = await addDoc(collection(db, "staff"), staffObj);
      await setDoc(doc(db, "users", form.email), {
        name: form.name,
        email: form.email,
        phone: form.phone || "",
        password: form.password,
        department: deptName,
        role: "STAFF",
      });

      setStaff((prev) => [
        ...prev,
        { id: staffDocRef.id, ...staffObj },
      ]);

      setForm({ name: "", email: "", phone: "", password: "", deptId: form.deptId });
      setOpen(false);
    } catch (err) {
      setError("Failed to add staff: " + err.message);
    }
  };

  const handleDeleteStaff = async (id, email) => {
    if (!window.confirm("Confirm deletion?")) return;
    try {
      await deleteDoc(doc(db, "staff", id));
      await deleteDoc(doc(db, "users", email));
      setStaff((prev) => prev.filter((s) => s.id !== id));
      alert("Staff deleted successfully");
    } catch (err) {
      alert("Failed to delete staff: " + err.message);
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        bgcolor: "#f0f5e6",
        p: 3,
        borderRadius: 3,
        fontFamily: "'Roboto', sans-serif",
        color: "#3c5123",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "700", mb: 2, color: "#527029" }}>
        Staff Members - {dept.name}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <TextField
          label="Search Staff by Name or Email"
          size="small"
          sx={{ width: "70%" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ sx: { borderRadius: 1 } }}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#527029",
            "&:hover": { backgroundColor: "#466316" },
            fontWeight: "700",
            letterSpacing: 0.5,
          }}
          onClick={() => setOpen(true)}
        >
          + Add Staff
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2, fontWeight: "600" }}>
          {error}
        </Typography>
      )}

      {filteredStaff.length === 0 ? (
        <Typography sx={{ fontStyle: "italic", mt: 5, color: "#78954c", textAlign: "center" }}>
          No staff found.
        </Typography>
      ) : (
        <Paper sx={{ borderRadius: 3, boxShadow: 3, overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: "#c9dbb4" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "700", color: "#3c5123" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "700", color: "#3c5123" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "700", color: "#3c5123" }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: "700", color: "#3c5123" }}>Role</TableCell>
                <TableCell sx={{ fontWeight: "700", color: "#3c5123" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.map((s) => (
                <TableRow
                  key={s.id}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#edf4ce" },
                    "&:hover": { backgroundColor: "#d4e798", cursor: "pointer" },
                  }}
                >
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone || "-"}</TableCell>
                  <TableCell>{s.role || "STAFF"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete Staff">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteStaff(s.id, s.email)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Add Staff Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Staff</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={handleInputChange("name")} fullWidth />
            <TextField label="Email" value={form.email} onChange={handleInputChange("email")} fullWidth />
            <TextField label="Phone" value={form.phone} onChange={handleInputChange("phone")} fullWidth />
            <TextField label="Password" type="password" value={form.password} onChange={handleInputChange("password")} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select value={form.deptId} onChange={handleInputChange("deptId")}>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddStaff}
            disabled={!form.name || !form.email || !form.password || !form.deptId}
            variant="contained"
            sx={{ backgroundColor: "#527029", "&:hover": { backgroundColor: "#466316" } }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
