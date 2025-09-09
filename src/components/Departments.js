import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Checkbox
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const OliveButton = styled(Button)({
  backgroundColor: "#6B8B2F",
  color: "#fff",
  fontWeight: 700,
  padding: "10px 24px",
  borderRadius: 8,
  fontSize: "1rem",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#557023",
  },
});

function getUsernameWord(str) {
  if (!str) return "dept";
  const words = str.split(/[\s,]+/).filter((w) => /^[a-zA-Z]+$/.test(w));
  if (words.length >= 3) return words[2];
  return words[0] || "dept";
}

function capitalize(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}

function generateDeptHeadEmail(deptName) {
  const username = getUsernameWord(deptName.trim());
  return {
    departmentHead: `${capitalize(username)}DeptHead`,
    email: `${username.toLowerCase()}depthead@city.gov.in`,
  };
}

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptPassword, setNewDeptPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [reassignMap, setReassignMap] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchCategories();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, "departments"));
      setDepartments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError("Failed to load departments.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, "category"));
      setCategories(
        snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((cat) => (cat.CategoryName || cat.name || "").toLowerCase() !== "others")
      );
    } catch (err) {
      setError("Failed to load categories.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Only unassigned categories for new department creation
  const unassignedCategories = categories.filter(
    (cat) => !cat.departmentId
  );

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) {
      alert("Please enter a department name.");
      return;
    }
    if (!newDeptPassword.trim()) {
      alert("Please enter a password.");
      return;
    }
    if (selectedCategories.length === 0) {
      alert("Please assign at least one category.");
      return;
    }
    setIsSaving(true);
    try {
      const { departmentHead, email } = generateDeptHeadEmail(newDeptName);
      const deptDoc = await addDoc(collection(db, "departments"), {
        name: newDeptName.trim(),
        password: newDeptPassword,
        departmentHead,
        email,
      });

      await addDoc(collection(db, "users"), {
        name: departmentHead,
        email,
        password: newDeptPassword,
        departmentId: deptDoc.id,
        departmentName: newDeptName,
        role: "DEPT_HEAD",
      });

      await Promise.all(
        selectedCategories.map((catId) =>
          updateDoc(doc(db, "category", catId), {
            department: newDeptName,
            departmentId: deptDoc.id,
            departmentEmail: email,
          })
        )
      );

      alert("Department created and categories assigned!");
      setNewDeptName("");
      setNewDeptPassword("");
      setSelectedCategories([]);
      fetchDepartments();
      fetchCategories();
    } catch (err) {
      alert("Error creating department: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignChange = (deptId, newCategories) => {
    setReassignMap((prev) => ({
      ...prev,
      [deptId]: newCategories,
    }));
  };

  // Only unassigned or categories already assigned to this department can be moved
  const getReassignOptions = (deptId) =>
    categories.filter(cat => !cat.departmentId || cat.departmentId === deptId);

  const handleSaveReassign = async (deptId) => {
    if (!reassignMap[deptId]) return;
    try {
      // Remove categories no longer assigned
      const previouslyAssigned = categories.filter(
        (cat) => cat.departmentId === deptId && !reassignMap[deptId].includes(cat.id)
      );
      await Promise.all(
        previouslyAssigned.map((cat) =>
          updateDoc(doc(db, "category", cat.id), {
            department: "",
            departmentId: "",
            departmentEmail: "",
          })
        )
      );
      // Add/update categories newly/re-assigned
      await Promise.all(
        reassignMap[deptId].map((catId) =>
          updateDoc(doc(db, "category", catId), {
            department: departments.find(d => d.id === deptId).name,
            departmentId: deptId,
            departmentEmail: departments.find(d => d.id === deptId).email,
          })
        )
      );
      alert("Categories reassigned successfully.");
      setReassignMap((prev) => ({ ...prev, [deptId]: undefined }));
      fetchCategories();
    } catch (err) {
      alert("Error reassigning categories: " + err.message);
    }
  };

  const getAssignedCategories = (deptId) =>
    categories.filter((cat) => cat.departmentId === deptId);

  const openDeleteDialog = (dept) => {
    setDepartmentToDelete(dept);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;
    try {
      await deleteDoc(doc(db, "departments", departmentToDelete.id));
      alert("Department deleted.");
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      fetchDepartments();
      fetchCategories();
    } catch (err) {
      alert("Error deleting department: " + err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 950, mx: "auto", my: 4, px: 2 }}>
      <Paper sx={{ p: 4, mb: 5, borderRadius: 4, bgcolor: "#f7faf7", boxShadow: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#486025" }}>
          Create Department
        </Typography>
        <TextField
          label="Department Name"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" sx={{ mb: 1 }}>
          Department Head: <strong>{generateDeptHeadEmail(newDeptName).departmentHead}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Email: <strong>{generateDeptHeadEmail(newDeptName).email}</strong>
        </Typography>
        <TextField
          label="Password"
          type="password"
          value={newDeptPassword}
          onChange={(e) => setNewDeptPassword(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 3 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="categories-label">Assign Categories</InputLabel>
          <Select
            labelId="categories-label"
            multiple
            value={selectedCategories}
            onChange={(e) =>
              setSelectedCategories(
                typeof e.target.value === "string"
                  ? e.target.value.split(",")
                  : e.target.value
              )
            }
            input={<OutlinedInput label="Assign Categories" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((id) => {
                  const cat = categories.find((c) => c.id === id);
                  return (
                    <Chip
                      key={id}
                      label={cat?.CategoryName || cat?.name || "Unnamed"}
                      sx={{
                        bgcolor: "#e4ecce",
                        color: "#395d2d",
                        fontWeight: 600,
                        borderRadius: 4,
                        fontSize: "0.97rem",
                        mr: 0.6,
                        mb: 0.5,
                        border: "1px solid #d4ddb0",
                      }}
                    />
                  );
                })}
              </Box>
            )}
          >
            {unassignedCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                <Checkbox checked={selectedCategories.indexOf(cat.id) > -1} />
                <Typography>{cat.CategoryName || cat.name || "Unnamed"}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            disabled={isSaving}
            onClick={handleCreateDepartment}
            fullWidth
            sx={{ fontWeight: "bold" }}
          >
            {isSaving ? "Creating..." : "Create Department"}
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={() => setSelectedCategories([])}
            sx={{ fontWeight: "bold", bgcolor: "#fffde7" }}
          >
            Clear
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setNewDeptName("");
              setNewDeptPassword("");
              setSelectedCategories([]);
            }}
            sx={{ fontWeight: "bold" }}
          >
            Close
          </Button>
        </Box>
      </Paper>

      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: "#f7faf7",
          boxShadow: 3,
          maxWidth: 1100,
          mx: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#5c713e", mb: 2 }}>
          Existing Departments
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#e5eedc" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Department Head</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Assigned Categories</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", minWidth: 220 }}>
                  Re-assign Categories
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ fontStyle: "italic", color: "#758f4e", py: 4 }}>
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => {
                  const assigned = getAssignedCategories(dept.id);
                  const selected = reassignMap[dept.id] ?? assigned.map((c) => c.id);
                  const reassignMenuOptions = getReassignOptions(dept.id);
                  return (
                    <TableRow key={dept.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{dept.name}</TableCell>
                      <TableCell>{dept.departmentHead || "—"}</TableCell>
                      <TableCell>{dept.email || "—"}</TableCell>
                      <TableCell>
                        {assigned.length === 0 ? (
                          <em>None</em>
                        ) : (
                          assigned.map((cat) => (
                            <Chip
                              size="small"
                              key={cat.id}
                              label={cat.CategoryName || cat.name}
                              sx={{
                                bgcolor: "#e5f5cb",
                                color: "#466b1a",
                                fontWeight: 700,
                                mr: 0.7,
                                mb: 0.5,
                                borderRadius: 3,
                                fontSize: ".95rem",
                                border: "1px solid #d4ddb0",
                              }}
                            />
                          ))
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <FormControl sx={{ minWidth: 180 }}>
                          <Select
                            multiple
                            value={selected}
                            size="small"
                            onChange={(e) => {
                              const vals = typeof e.target.value === "string"
                                ? e.target.value.split(",")
                                : e.target.value;
                              handleAssignChange(dept.id, vals);
                            }}
                            input={<OutlinedInput />}
                            renderValue={(selected) => (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {selected.length === 0 ? (
                                  <Chip
                                    label="None"
                                    sx={{ bgcolor: "#eaf2d4", fontWeight: 600, color: "#758f4e" }}
                                  />
                                ) : (
                                  selected.map((catId) => {
                                    const cat = categories.find((c) => c.id === catId);
                                    return (
                                      <Chip
                                        key={catId}
                                        label={cat?.CategoryName || cat?.name || "Unnamed"}
                                        sx={{
                                          bgcolor: "#eaf2d4",
                                          color: "#395c2e",
                                          fontWeight: 600,
                                          mr: 0.5,
                                          mb: 0.5,
                                          borderRadius: 2,
                                          fontSize: ".95rem",
                                          border: "1px solid #d4ddb0",
                                        }}
                                      />
                                    );
                                  })
                                )}
                              </Box>
                            )}
                          >
                            {reassignMenuOptions.map((cat) => (
                              <MenuItem key={cat.id} value={cat.id}>
                                <Checkbox checked={selected.includes(cat.id)} />
                                <Typography>{cat.CategoryName || cat.name || "Unnamed"}</Typography>
                              </MenuItem>
                            ))}
                          </Select>
                          <Button
                            sx={{
                              mt: 1,
                              bgcolor: "#6B8A47",
                              color: "#fff",
                              fontWeight: 700,
                              px: 2.2,
                              py: 0.8,
                              borderRadius: 3,
                              "&:hover": {
                                bgcolor: "#395c2e",
                                boxShadow: "0px 5px 12px rgba(85,107,47,0.13)",
                              },
                            }}
                            size="small"
                            variant="contained"
                            onClick={() => handleSaveReassign(dept.id)}
                          >
                            Save
                          </Button>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Delete Department">
                          <IconButton
                            color="error"
                            onClick={() => openDeleteDialog(dept)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Delete confirmation modal */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete department <strong>{departmentToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteDepartment}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
