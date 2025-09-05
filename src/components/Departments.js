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
    backgroundColor: "#55672f",
  },
  marginTop: 16,
  padding: "10px 24px",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: 8,
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 700,
  color: "#37572a",
  borderBottom: `1px solid ${theme.palette.divider}`,
  verticalAlign: "middle",
  fontSize: 14,
}));

const StyledTableRow = styled(TableRow)({
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: "#eaf4d3",
  },
});

export default function Departments({ departments = [], addDepartment, deleteDepartment }) {
  const [newDeptName, setNewDeptName] = useState("");
  const [newRoutingRule, setNewRoutingRule] = useState("");
  const [newDeptPassword, setNewDeptPassword] = useState("");

  // Generate department head/email
  const generateDeptHeadAndEmail = (name) => {
    const normalized = name.toLowerCase().replace(/\s+/g, "");
    const departmentHead = `${normalized}depthead`;
    const email = `${departmentHead}@city.gov.in`;
    return { departmentHead, email };
  };

  const handleAdd = () => {
    if (!newDeptName.trim()) {
      alert("Please enter department name");
      return;
    }
    const { departmentHead, email } = generateDeptHeadAndEmail(newDeptName);
    addDepartment(newDeptName.trim(), newRoutingRule.trim(), newDeptPassword, departmentHead, email);
    setNewDeptName("");
    setNewRoutingRule("");
    setNewDeptPassword("");
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fafdf6",
        borderRadius: 3,
        padding: 4,
        boxShadow: "0 8px 20px rgba(57,83,26,0.1)",
        maxWidth: 900,
        margin: "auto",
        minHeight: 520,
      }}
    >
      <Typography variant="h5" sx={{ color: "#37572a", fontWeight: 700, letterSpacing: 1, mb: 3 }}>
        Departments
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 4,
          alignItems: "flex-end",
        }}
      >
        <TextField
          label="Department Name"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 220 }}
          size="small"
        />

        <TextField
          label="Routing Rule"
          value={newRoutingRule}
          onChange={(e) => setNewRoutingRule(e.target.value)}
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

      <TableContainer component={Paper} sx={{ boxShadow: "0 8px 24px rgba(57,83,26,0.12)" }}>
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: "#d1dfb0" }}>
            <TableRow>
              <StyledTableCell sx={{ width: "35%" }}>Name</StyledTableCell>
              <StyledTableCell sx={{ width: "45%" }}>Routing Rules</StyledTableCell>
              <StyledTableCell sx={{ width: "15%" }}>Department Head</StyledTableCell>
              <StyledTableCell sx={{ width: "35%" }}>Email</StyledTableCell>
              <StyledTableCell sx={{ width: "10%" }} align="center">
                Actions
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ fontStyle: "italic", color: "#7a8b60", py: 4 }}>
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <StyledTableRow key={dept.id}>
                  <TableCell sx={{ fontWeight: 700, color: "#37572a" }}>{dept.name}</TableCell>
                  <TableCell>{dept.routing_rules?.map((r) => r.category).join(", ") || "—"}</TableCell>
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
