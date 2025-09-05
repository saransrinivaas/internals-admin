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
  marginTop: 12,
  textTransform: "none",
  fontWeight: 600,
  padding: "10px 18px",
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: "#3b5d3a",
  borderBottom: `1px solid ${theme.palette.divider}`,
  verticalAlign: "middle",
}));

const StyledTableRow = styled(TableRow)({
  "&:hover": {
    backgroundColor: "#f0f7f0",
  },
});

export default function Departments({ departments = [], addDepartment, deleteDepartment }) {
  const [newDeptName, setNewDeptName] = useState("");
  const [newRoutingRule, setNewRoutingRule] = useState("");
  const [newDeptPassword, setNewDeptPassword] = useState("");

  // Generate department head and email based on department name
  const generateDeptHeadAndEmail = (name) => {
    const normalized = name.toLowerCase().replace(/\s+/g, "");
    const departmentHead = `${normalized}depthead`;
    const email = `${departmentHead}@city.gov.in`;
    return { departmentHead, email };
  };

  const handleAdd = () => {
    if (newDeptName.trim() === "") return;
    const { departmentHead, email } = generateDeptHeadAndEmail(newDeptName);
    // Pass all info including auto-generated fields to the handler
    addDepartment(newDeptName.trim(), newRoutingRule.trim(), newDeptPassword, departmentHead, email);
    setNewDeptName("");
    setNewRoutingRule("");
    setNewDeptPassword("");
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: 3,
        padding: 4,
        boxShadow: "0 5px 15px rgba(60,79,47,0.15)",
        maxWidth: 1000,
        margin: "auto",
      }}
    >
      <Typography variant="h5" fontWeight="bold" color="#3b5d3a" gutterBottom sx={{ letterSpacing: 1 }}>
        Departments
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3, alignItems: "center" }}>
        <TextField
          label="Department Name"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 180 }}
          size="small"
        />
        <TextField
          label="Routing Rule (Category)"
          value={newRoutingRule}
          onChange={(e) => setNewRoutingRule(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 180 }}
          size="small"
        />
        <TextField
          label="Password"
          type="password"
          value={newDeptPassword}
          onChange={(e) => setNewDeptPassword(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 180 }}
          size="small"
          autoComplete="new-password"
        />
        <OliveButton onClick={handleAdd}>Add Department</OliveButton>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: "0 4px 12px rgba(60,79,47,0.12)" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e6f4ea" }}>
            <TableRow>
              <StyledTableCell sx={{ width: "25%" }}>Name</StyledTableCell>
              <StyledTableCell sx={{ width: "25%" }}>Routing Rules</StyledTableCell>
              <StyledTableCell sx={{ width: "20%" }}>Department Head</StyledTableCell>
              <StyledTableCell sx={{ width: "25%" }}>Email</StyledTableCell>
              <StyledTableCell sx={{ width: "5%" }} align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ fontStyle: "italic", color: "#6b7280" }}>
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <StyledTableRow key={dept.id}>
                  <TableCell sx={{ fontWeight: 700, color: "#3b5d3a" }}>{dept.name}</TableCell>
                  <TableCell>
                    {dept.routing_rules?.map((r) => r.category).join(", ") || "—"}
                  </TableCell>
                  <TableCell>{dept.departmentHead || "—"}</TableCell>
                  <TableCell>{dept.email || "—"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete Department">
                      <IconButton size="small" color="error" onClick={() => deleteDepartment(dept.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
