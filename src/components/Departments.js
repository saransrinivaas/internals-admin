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
import VisibilityIcon from "@mui/icons-material/Visibility";
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
  backgroundColor: "#3b5b27", // Updated color
  color: "#fff",
  fontWeight: 700,
  padding: "10px 24px",
  borderRadius: 8,
  fontSize: "1rem",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#2e471e",
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
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [reassignDept, setReassignDept] = useState(null);
  const [showAssignedDialog, setShowAssignedDialog] = useState(false);

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

  const openReassignDialog = (dept) => {
    setReassignDept(dept);
    setReassignMap((prev) => ({
      ...prev,
      [dept.id]: getAssignedCategories(dept.id).map((c) => c.id),
    }));
    setReassignDialogOpen(true);
  };

  const closeReassignDialog = () => {
    setReassignDialogOpen(false);
    setReassignDept(null);
  };

  // Add this function to handle showing the dialog
  const handleShowAssignedDialog = () => {
    if (selectedCategories.length === 0) {
      alert("Please assign at least one category.");
      return;
    }
    setShowAssignedDialog(true);
  };

  const handleAddDepartment = async () => {
    setShowAssignedDialog(false);
    await handleCreateDepartment();
  };

  return (
    <Box
      className="departments-page"
      sx={{
        height: "100vh",
        width: "100%",
        bgcolor: "#f6f7f1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        px: { xs: 1, md: 2 },
        py: { xs: 2, md: 4 },
      }}
    >
      <Paper
        className="dept-create"
        sx={{
          p: 4,
          mb: 6, // Increased margin-bottom for more space between containers
          borderRadius: 4,
          bgcolor: "#f7faf7",
          boxShadow: 4,
          width: "100%",
          maxWidth: 600, // Reduced maxWidth for a smaller creation container
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#486025" ,textAlign: "center", letterSpacing: 1}}>
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
          {/* Add button below dropdown */}
          <Button
            variant="contained"
            disabled={isSaving}
            onClick={handleShowAssignedDialog}
            fullWidth
            sx={{ fontWeight: "bold", bgcolor: "#3b5b27", color: "#fff", mt: 2, "&:hover": { bgcolor: "#2e471e" } }}
          >
            {isSaving ? "Creating..." : "Add"}
          </Button>
        </FormControl>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setSelectedCategories([])}
            sx={{ fontWeight: "bold", bgcolor: "#fffde7", color: "#3b5b27", borderColor: "#3b5b27", "&:hover": { bgcolor: "#f7faf7", borderColor: "#2e471e", color: "#2e471e" } }}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      <Paper
        className="dept-table"
        sx={{
          p: 2,
          borderRadius: 4,
          bgcolor: "#f7faf7",
          boxShadow: 3,
          width: "100%",
          maxWidth: "100%",
          mx: "auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "#5c713e",
            mb: 2,
            textAlign: "center", // Center the text
            letterSpacing: 1,
          }}
        >
          EXISTING DEPARTMENTS
        </Typography>
        <Table
          sx={{
            width: "100%",
            minWidth: 1500, // Increased minWidth for more columns
            "& th, & td": {
              padding: "8px 10px", // Reduce cell padding
              fontSize: "0.97rem", // Slightly smaller font
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: "#d0e8c1" }}>
              <TableCell sx={{ fontWeight: "bold", color: "#0c0a0aff" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#020202ff" }}>Department Head</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#0e0b0bff" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#050404ff" }}>Assigned Categories</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "#110606ff" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ fontStyle: "italic", color: "#758f4e", py: 4 }}>
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell sx={{ fontWeight: 700 }}>{dept.name}</TableCell>
                  <TableCell>{dept.departmentHead || "—"}</TableCell>
                  <TableCell>{dept.email || "—"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#eaf2d4",
                        color: "#3b5b27",
                        borderRadius: 2,
                        ml: 1,
                        mt: 1,
                        borderColor: "#3b5b27",
                        "&:hover": { bgcolor: "#d4ddb0", color: "#2e471e", borderColor: "#2e471e" },
                      }}
                      onClick={() => openReassignDialog(dept)}
                    >
                      View & Assign
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete Department">
                      <IconButton
                        sx={{ color: "#3b5b27" }}
                        onClick={() => openDeleteDialog(dept)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: "#3b5b27" }}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteDepartment} sx={{ bgcolor: "#3b5b27", color: "#fff", "&:hover": { bgcolor: "#2e471e" } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Re-assign categories dialog */}
      <Dialog
        open={reassignDialogOpen}
        onClose={closeReassignDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Assigned Categories for {reassignDept?.name}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="reassign-categories-label">Categories</InputLabel>
            <Select
              labelId="reassign-categories-label"
              multiple
              value={reassignDept ? reassignMap[reassignDept.id] || [] : []}
              onChange={(e) => {
                const vals = typeof e.target.value === "string"
                  ? e.target.value.split(",")
                  : e.target.value;
                handleAssignChange(reassignDept.id, vals);
              }}
              input={<OutlinedInput label="Categories" />}
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
              {reassignDept &&
                getReassignOptions(reassignDept.id).map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <Checkbox checked={reassignMap[reassignDept.id]?.includes(cat.id)} />
                    <Typography>{cat.CategoryName || cat.name || "Unnamed"}</Typography>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReassignDialog} sx={{ color: "#3b5b27" }}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleSaveReassign(reassignDept.id);
              closeReassignDialog();
            }}
            disabled={!reassignDept}
            sx={{ bgcolor: "#3b5b27", color: "#fff", "&:hover": { bgcolor: "#2e471e" } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assigned Categories Dialog */}
      <Dialog open={showAssignedDialog} onClose={() => setShowAssignedDialog(false)}>
        <DialogTitle>Assigned Categories</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {selectedCategories.map((id) => {
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
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowAssignedDialog(false)}
            sx={{ color: "#3b5b27" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDepartment}
            sx={{ bgcolor: "#3b5b27", color: "#fff", "&:hover": { bgcolor: "#2e471e" } }}
          >
            Confirm & Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
