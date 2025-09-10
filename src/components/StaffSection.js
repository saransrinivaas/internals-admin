import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { collection, addDoc, setDoc, doc, deleteDoc, getDocs, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function StaffSection({ departments = [] }) {
  const [staff, setStaff] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", deptId: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const snapshot = await getDocs(collection(db, "staff"));
        const staffData = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          let deptName = data.department;
          if ((!deptName || deptName.trim() === "") && data.departmentId) {
            const deptDoc = await getDoc(doc(db, "departments", data.departmentId));
            deptName = deptDoc.exists() ? deptDoc.data().name : "Unknown";
          }
          staffData.push({
            id: docSnap.id,
            ...data,
            department: deptName,
            role: data.role ? data.role.toUpperCase() : "STAFF",
          });
        }
        setStaff(staffData);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
  }, []);

  const handleAddStaff = async () => {
    if (!form.name || !form.email || !form.password || !form.deptId) {
      alert("Please fill all required fields.");
      return;
    }
    const departmentName = departments.find(d => d.id === form.deptId)?.name || "";

    try {
      // Add to staff collection with password
      const staffDocRef = await addDoc(collection(db, "staff"), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        department: departmentName,
        departmentId: form.deptId,
        role: "STAFF",
      });

      // Add to users collection with password
      await setDoc(doc(db, "users", form.email), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        department: departmentName,
        role: "STAFF",
      });

      setStaff(prev => [
        ...prev,
        {
          id: staffDocRef.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          department: departmentName,
          role: "STAFF",
        },
      ]);
      setForm({ name: "", email: "", phone: "", password: "", deptId: "" });
      setOpen(false);
    } catch (error) {
      alert("Failed to add staff: " + error.message);
    }
  };

  const handleDeleteStaff = async (id, email) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await deleteDoc(doc(db, "staff", id));
      await deleteDoc(doc(db, "users", email));
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      alert("Failed to delete staff: " + error.message);
    }
  };

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", bgcolor: "#f5f8f2", p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Staff Members</Typography>
        <Button variant="contained" sx={{ backgroundColor: "#3b5b27" }} onClick={() => setOpen(true)}>
          + Add Staff
        </Button>
      </Box>

      <TextField
        label="Search Staff by Name or Email"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 3 }}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {open && (
        <Dialog open onClose={() => setOpen(false)}>
          <DialogTitle>Add New Staff</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <TextField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  value={form.deptId}
                  label="Department"
                  onChange={e => setForm({ ...form, deptId: e.target.value })}
                  required
                >
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              disabled={!form.name || !form.email || !form.password || !form.deptId}
              onClick={handleAddStaff}
              variant="contained"
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Paper>
        <Table>
          <TableHead sx={{ backgroundColor: "#d0e8c1" }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.length ? (
              filteredStaff.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone || "-"}</TableCell>
                  <TableCell>{s.department || "-"}</TableCell>
                  <TableCell>{s.role || "STAFF"}</TableCell>
                  <TableCell>
                    <Tooltip title="Delete Staff">
                      <IconButton color="error" onClick={() => handleDeleteStaff(s.id, s.email)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ fontStyle: "italic" }}>
                  No staff found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
