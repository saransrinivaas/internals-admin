import React, { useEffect, useState } from "react";
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
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function DepartmentStaff({ dept }) {
  const [staff, setStaff] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    const fetchStaff = async () => {
      if (!dept?.id) return;
      try {
        const q = query(collection(db, "staff"), where("departmentId", "==", dept.id));
        const snapshot = await getDocs(q);
        setStaff(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };
    fetchStaff();
  }, [dept?.id]);

  const handleAddStaff = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("Please fill all required fields");
      return;
    }
    try {
      const staffDocRef = await addDoc(collection(db, "staff"), {
        departmentId: dept.id,
        departmentName: dept.name,
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password, // <-- ensure this is included
        role: "STAFF",
      });

      await setDoc(doc(db, "users", form.email), {
        email: form.email,
        name: form.name,
        phone: form.phone,
        password: form.password, // <-- ensure this is included
        department: dept.name,
        role: "STAFF",
      });

      setStaff((prev) => [
        ...prev,
        {
          id: staffDocRef.id,
          departmentId: dept.id,
          departmentName: dept.name,
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: "STAFF",
        },
      ]);
      setForm({ name: "", email: "", phone: "", password: "" });
      setOpen(false);
    } catch (err) {
      alert("Failed to add staff: " + err.message);
    }
  };

  const handleDeleteStaff = async (id, email) => {
    if (!window.confirm("Confirm delete?")) return;
    try {
      await deleteDoc(doc(db, "staff", id));
      await deleteDoc(doc(db, "users", email));
      setStaff((prev) => prev.filter((s) => s.id !== id));
      alert("Staff deleted successfully");
    } catch (err) {
      alert("Failed to delete staff: " + err.message);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Staff Members</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          + Add Staff
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {staff.length ? (
              staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone || "-"}</TableCell>
                  <TableCell>{s.role || "STAFF"}</TableCell>
                  <TableCell>
                    <Tooltip title="Delete Staff">
                      <IconButton onClick={() => handleDeleteStaff(s.id, s.email)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ fontStyle: "italic" }}>
                  No staff found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Staff</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddStaff}
            disabled={!form.name || !form.email || !form.password}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
