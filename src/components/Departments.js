import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
} from "@mui/material";

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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  color: "#375a27",
  borderBottom: `1px solid ${theme.palette.divider}`,
  verticalAlign: "middle",
  fontSize: 14,
}));

const StyledTableRow = styled(TableRow)({
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: "#eaf2d4",
  },
});

function generateDeptHeadAndEmail(deptName) {
  if (!deptName) return { departmentHead: "", email: "" };

  let base = "";

  if (/environment/i.test(deptName)) {
    base = "Environment";
  } else {
    let nameWithoutDept = deptName.replace(/department of\s*/i, "").trim();
    if (nameWithoutDept.includes("&")) {
      base = nameWithoutDept.split("&")[0].trim().split(" ")[0];
    } else {
      const words = nameWithoutDept.split(" ").filter(Boolean);
      base = words[0] || deptName;
    }
    base = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
  }

  const departmentHead = `${base}DeptHead`;
  const email = `${base.toLowerCase()}depthead@city.gov.in`;

  return { departmentHead, email };
}

export default function Departments({ departments = [], addDepartment, deleteDepartment }) {
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptPassword, setNewDeptPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAdd = () => {
    if (!newDeptName.trim()) {
      alert("Please enter a department name.");
      return;
    }
    if (!newDeptPassword) {
      alert("Please enter a password.");
      return;
    }
    const { departmentHead, email } = generateDeptHeadAndEmail(newDeptName.trim());
    addDepartment(newDeptName.trim(), null, newDeptPassword, departmentHead, email, "DEPT_HEAD");
    setNewDeptName("");
    setNewDeptPassword("");
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        backgroundColor: "#f5f2e8",
        borderRadius: 3,
        padding: 4,
        boxShadow: "0 8px 20px rgba(57,83,26,0.1)",
        maxWidth: 900,
        margin: "auto",
        minHeight: 520,
      }}
    >
      <Typography sx={{ color: "#375a27", fontWeight: "bold", letterSpacing: 1, mb: 3 }} variant="h5">
        Departments
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4, alignItems: "flex-end" }}>
        <TextField
          label="Department Name"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 220 }}
          size="small"
        />
        <TextField
          label="Password"
          type="password"
          value={newDeptPassword}
          onChange={(e) => setNewDeptPassword(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 220 }}
          size="small"
          autoComplete="new-password"
        />
        <OliveButton onClick={handleAdd}>Add Department</OliveButton>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search Departments"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
        />
      </Box>

      <TableContainer sx={{ boxShadow: "0 8px 24px rgba(57,83,26,0.12)" }} component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#cdd9aa" }}>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Department Head</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ color: "#758f4e", fontStyle: "italic", py: 4 }} align="center">
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept) => (
                <StyledTableRow key={dept.id}>
                  <StyledTableCell>{dept.name}</StyledTableCell>
                  <StyledTableCell>{dept.departmentHead || "—"}</StyledTableCell>
                  <StyledTableCell>{dept.email || "—"}</StyledTableCell>
                  <StyledTableCell align="center">
                    <Tooltip title="Delete Department">
                      <IconButton size="small" color="error" onClick={() => deleteDepartment(dept.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
