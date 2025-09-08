// import React, { useState } from "react";
// import { styled } from "@mui/material/styles";
// import DeleteIcon from "@mui/icons-material/Delete";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Tooltip,
//   IconButton,
// } from "@mui/material";

// const OliveButton = styled(Button)({
//   backgroundColor: "#6B8A47",
//   color: "white",
//   "&:hover": {
//     backgroundColor: "#556B2F",
//   },
//   marginTop: 16,
//   padding: "10px 24px",
//   fontWeight: 600,
//   textTransform: "none",
//   borderRadius: 8,
// });

// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   fontWeight: "bold",
//   color: "#375a27",
//   borderBottom: `1px solid ${theme.palette.divider}`,
//   verticalAlign: "middle",
//   fontSize: 14,
// }));

// const StyledTableRow = styled(TableRow)({
//   transition: "background-color 0.2s ease",
//   "&:hover": {
//     backgroundColor: "#eaf2d4",
//   },
// });

// function generateDeptHeadAndEmail(deptName) {
//   if (!deptName) return { departmentHead: "", email: "" };

//   let base = "";

//   if (/environment/i.test(deptName)) {
//     base = "Environment";
//   } else {
//     let nameWithoutDept = deptName.replace(/department of\s*/i, "").trim();
//     if (nameWithoutDept.includes("&")) {
//       base = nameWithoutDept.split("&")[0].trim().split(" ")[0];
//     } else {
//       const words = nameWithoutDept.split(" ").filter(Boolean);
//       base = words[0] || deptName;
//     }
//     base = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
//   }

//   const departmentHead = `${base}DeptHead`;
//   const email = `${base.toLowerCase()}depthead@city.gov.in`;

//   return { departmentHead, email };
// }

// export default function Departments({ departments = [], addDepartment, deleteDepartment }) {
//   const [newDeptName, setNewDeptName] = useState("");
//   const [newDeptPassword, setNewDeptPassword] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   const handleAdd = () => {
//     if (!newDeptName.trim()) {
//       alert("Please enter a department name.");
//       return;
//     }
//     if (!newDeptPassword) {
//       alert("Please enter a password.");
//       return;
//     }
//     const { departmentHead, email } = generateDeptHeadAndEmail(newDeptName.trim());
//     addDepartment(newDeptName.trim(), null, newDeptPassword, departmentHead, email, "DEPT_HEAD");
//     setNewDeptName("");
//     setNewDeptPassword("");
//   };

//   const filteredDepartments = departments.filter((dept) =>
//     dept.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <Box
//       sx={{
//         backgroundColor: "#f5f2e8",
//         borderRadius: 3,
//         padding: 4,
//         boxShadow: "0 8px 20px rgba(57,83,26,0.1)",
//         maxWidth: 900,
//         margin: "auto",
//         minHeight: 520,
//       }}
//     >
//       <Typography sx={{ color: "#375a27", fontWeight: "bold", letterSpacing: 1, mb: 3 }} variant="h5">
//         Departments
//       </Typography>

//       <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4, alignItems: "flex-end" }}>
//         <TextField
//           label="Department Name"
//           value={newDeptName}
//           onChange={(e) => setNewDeptName(e.target.value)}
//           sx={{ flexGrow: 1, minWidth: 220 }}
//           size="small"
//         />
//         <TextField
//           label="Password"
//           type="password"
//           value={newDeptPassword}
//           onChange={(e) => setNewDeptPassword(e.target.value)}
//           sx={{ flexGrow: 1, minWidth: 220 }}
//           size="small"
//           autoComplete="new-password"
//         />
//         <OliveButton onClick={handleAdd}>Add Department</OliveButton>
//       </Box>

//       <Box sx={{ mb: 3 }}>
//         <TextField
//           label="Search Departments"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           size="small"
//           fullWidth
//         />
//       </Box>

//       <TableContainer sx={{ boxShadow: "0 8px 24px rgba(57,83,26,0.12)" }} component={Paper}>
//         <Table stickyHeader>
//           <TableHead>
//             <TableRow sx={{ backgroundColor: "#cdd9aa" }}>
//               <StyledTableCell>Name</StyledTableCell>
//               <StyledTableCell>Department Head</StyledTableCell>
//               <StyledTableCell>Email</StyledTableCell>
//               <StyledTableCell align="center">Actions</StyledTableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {filteredDepartments.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={4} sx={{ color: "#758f4e", fontStyle: "italic", py: 4 }} align="center">
//                   No departments found.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredDepartments.map((dept) => (
//                 <StyledTableRow key={dept.id}>
//                   <StyledTableCell>{dept.name}</StyledTableCell>
//                   <StyledTableCell>{dept.departmentHead || "—"}</StyledTableCell>
//                   <StyledTableCell>{dept.email || "—"}</StyledTableCell>
//                   <StyledTableCell align="center">
//                     <Tooltip title="Delete Department">
//                       <IconButton size="small" color="error" onClick={() => deleteDepartment(dept.id)}>
//                         <DeleteIcon fontSize="small" />
//                       </IconButton>
//                     </Tooltip>
//                   </StyledTableCell>
//                 </StyledTableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// }
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
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

const OliveButton = styled(Button)({
  backgroundColor: "#6B8A47",
  color: "white",
  "&:hover": {
    backgroundColor: "#556B2F",
  },
  marginTop: 16,
  padding: "10px 24px",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: 8,
});

function getUsernameWord(str) {
  if (!str) return "dept";
  const words = str.split(/[\s,]+/).filter((w) => /^[a-zA-Z]+$/.test(w));
  if (words.length >= 3) return words[2];
  return words[0] || "dept";
}

function capitalize(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : str;
}

function generateDeptHeadAndEmail(deptName) {
  const usernameWord = getUsernameWord(deptName);
  const departmentHead = `${capitalize(usernameWord)}DeptHead`;
  const email = `${usernameWord.toLowerCase()}depthead@city.gov.in`;
  return { departmentHead, email };
}

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptPassword, setNewDeptPassword] = useState("");
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [reassignMap, setReassignMap] = useState({});

  useEffect(() => {
    fetchDepartments();
    fetchCategories();
  }, []);

  const fetchDepartments = async () => {
    const snap = await getDocs(collection(db, "departments"));
    setDepartments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "category"));
    setCategories(
      snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (cat) =>
            (cat.CategoryName || cat.name || "").toLowerCase() !== "others"
        )
    );
  };

  const handleCreateDepartment = async () => {
    if (!newDeptName || !newDeptPassword || selectedCategories.length === 0) {
      alert(
        "Please provide department name, password, and assign at least one category."
      );
      return;
    }
    const { departmentHead, email } = generateDeptHeadAndEmail(
      newDeptName.trim()
    );
    try {
      const deptRef = await addDoc(collection(db, "departments"), {
        name: newDeptName,
        password: newDeptPassword,
        departmentHead,
        email,
      });
      const deptId = deptRef.id;
      await addDoc(collection(db, "users"), {
        name: departmentHead,
        email: email,
        password: newDeptPassword,
        departmentId: deptId,
        departmentName: newDeptName,
        role: "DEPT_HEAD",
      });
      await Promise.all(
        selectedCategories.map((catId) =>
          updateDoc(doc(db, "category", catId), {
            department: newDeptName,
            departmentId: deptId,
            departmentEmail: email,
          })
        )
      );
      alert(
        "Department created, department head user added, and categories assigned!"
      );
      setNewDeptName("");
      setNewDeptPassword("");
      setSelectedCategories([]);
      fetchDepartments();
      fetchCategories();
    } catch (err) {
      alert("Failed to create and assign categories: " + err.message);
    }
  };

  const handleReassignCategories = async (deptId, deptName, deptEmail, newCatIds) => {
    try {
      const previouslyAssigned = categories.filter(
        (cat) => cat.departmentId === deptId && !newCatIds.includes(cat.id)
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
      await Promise.all(
        newCatIds.map((catId) =>
          updateDoc(doc(db, "category", catId), {
            department: deptName,
            departmentId: deptId,
            departmentEmail: deptEmail,
          })
        )
      );
      alert("Categories re-assigned!");
      setReassignMap((prev) => ({ ...prev, [deptId]: undefined }));
      fetchCategories();
    } catch (err) {
      alert("Failed to re-assign: " + err.message);
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
      fetchDepartments();
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    } catch (err) {
      alert("Failed to delete department: " + err.message);
    }
  };

  return (
    <Box sx={{ width: "100%", px: { xs: 1, sm: 3, md: 4 }, py: 4 }}>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          bgcolor: "#f7faf5",
          borderRadius: 4,
          boxShadow: "0 4px 32px rgba(107,138,71,0.09)",
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700, color: "#556B2F" }}>
          Create Department
        </Typography>
        <TextField
          label="Department Name"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" sx={{ mb: 1 }}>
          Department Head: <strong>{generateDeptHeadAndEmail(newDeptName).departmentHead}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Email: <strong>{generateDeptHeadAndEmail(newDeptName).email}</strong>
        </Typography>
        <TextField
          label="Password"
          type="password"
          value={newDeptPassword}
          onChange={(e) => setNewDeptPassword(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="assign-category-label">Assign Categories</InputLabel>
          <Select
            labelId="assign-category-label"
            multiple
            value={selectedCategories}
            onChange={(e) =>
              setSelectedCategories(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)
            }
            input={<OutlinedInput label="Assign Categories" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((catId) => {
                  const cat = categories.find((c) => c.id === catId);
                  return (
                    <Chip
                      key={catId}
                      label={cat?.CategoryName || cat?.name || "Unnamed"}
                      sx={{
                        bgcolor: "#cdd9aa",
                        color: "#375a27",
                        fontWeight: 700,
                        borderRadius: 2,
                        fontSize: "0.95rem",
                        mr: 0.5,
                        mb: 0.5,
                        border: "1px solid #d4ddb0",
                      }}
                    />
                  );
                })}
              </Box>
            )}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                <Checkbox checked={selectedCategories.indexOf(cat.id) > -1} />
                <Typography>{cat.CategoryName || cat.name || "Unnamed"}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <OliveButton onClick={handleCreateDepartment} fullWidth>
          CREATE DEPARTMENT & ASSIGN CATEGORY
        </OliveButton>
      </Paper>

      <Paper
        sx={{
          p: 3,
          bgcolor: "#f7faf5",
          borderRadius: 4,
          boxShadow: "0 4px 32px rgba(107,138,71,0.09)",
          overflowX: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, color: "#556B2F", mb: 2 }}>
          Existing Departments
        </Typography>
        <Box sx={{ minWidth: 960 }}>
          <Table
            stickyHeader
            sx={{
              width: "100%",
              "& th": {
                bgcolor: "#cdd9aa",
                color: "#375a27",
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "0.5px",
              },
              "& td": {
                fontSize: "1rem",
                color: "#375a27",
                border: "none",
              },
              "& tbody tr": {
                transition: "box-shadow .2s",
              },
              "& tbody tr:nth-of-type(even)": {
                bgcolor: "#f8fbf4",
              },
              "& tbody tr:hover": {
                bgcolor: "#eef7e2",
                boxShadow: "0 2px 22px rgba(107,138,71,0.09)",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Department Head</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Assigned Categories</TableCell>
                <TableCell align="center">Re-assign Categories</TableCell>
                <TableCell align="center">Actions</TableCell>
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
                  const assignedCats = getAssignedCategories(dept.id);
                  const reassignValue = reassignMap[dept.id] ?? assignedCats.map((cat) => cat.id);
                  return (
                    <TableRow key={dept.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{dept.name}</TableCell>
                      <TableCell>{dept.departmentHead || "—"}</TableCell>
                      <TableCell>{dept.email || "—"}</TableCell>
                      <TableCell>
                        {assignedCats.length === 0 ? (
                          <em>None</em>
                        ) : (
                          assignedCats.map((cat) => (
                            <Chip
                              size="small"
                              key={cat.id}
                              label={cat.CategoryName || cat.name}
                              sx={{
                                bgcolor: "#cdd9aa",
                                color: "#375a27",
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
                            value={reassignValue}
                            size="small"
                            onChange={(e) =>
                              setReassignMap((prev) => ({
                                ...prev,
                                [dept.id]:
                                  typeof e.target.value === "string"
                                    ? e.target.value.split(",")
                                    : e.target.value,
                              }))
                            }
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
                                          color: "#375a27",
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
                            {categories.map((cat) => (
                              <MenuItem key={cat.id} value={cat.id}>
                                <Checkbox checked={reassignValue.indexOf(cat.id) > -1} />
                                <Typography>{cat.CategoryName || cat.name || "Unnamed"}</Typography>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          sx={{
                            mt: 1,
                            bgcolor: "#6B8A47",
                            color: "#fff",
                            fontWeight: 700,
                            px: 2.2,
                            py: 0.8,
                            borderRadius: 3,
                            boxShadow: "0px 2px 6px rgba(107,138,71,0.1)",
                            "&:hover": {
                              bgcolor: "#375a27",
                              boxShadow: "0px 5px 12px rgba(85,107,47,0.13)",
                            },
                          }}
                          size="small"
                          variant="contained"
                          onClick={() =>
                            handleReassignCategories(
                              dept.id,
                              dept.name,
                              dept.email,
                              reassignValue
                            )
                          }
                        >
                          SAVE
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Delete Department">
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: "#ffeaea",
                              color: "#cc2222",
                              borderRadius: 3,
                              "&:hover": {
                                bgcolor: "#e99595",
                                color: "#fff",
                              },
                            }}
                            onClick={() => openDeleteDialog(dept)}
                          >
                            <DeleteIcon fontSize="small" />
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete department “{departmentToDelete?.name}”? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteDepartment}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
