import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import DeleteIcon from '@mui/icons-material/Delete';
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
  color: "#3b5a40",
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

  const handleAdd = () => {
    if (!newDeptName.trim()) return;
    addDepartment(newDeptName.trim(), newRoutingRule.trim(), newDeptPassword);
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
        boxShadow: "0 5px 15px rgba(86,119,69,0.3)",
        maxWidth: 1000,
        margin: "auto",
        minHeight: 500,
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        color="#3b5a40"
        gutterBottom
        sx={{ letterSpacing: 1 }}
      >
        Departments
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          marginBottom: 3,
          alignItems: "center",
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
          label="Routing Rule (Category)"
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

      <TableContainer component={Paper} sx={{ boxShadow: "0 6px 18px rgba(86,119,69,0.3)" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#cad7b3" }}>
            <TableRow>
              <StyledTableCell sx={{ width: "35%" }}>Name</StyledTableCell>
              <StyledTableCell sx={{ width: "50%" }}>Routing Rules</StyledTableCell>
              <StyledTableCell sx={{ width: "15%" }} align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ fontStyle: "italic", color: "#7a8a65" }}>
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <StyledTableRow key={dept.id}>
                  <TableCell sx={{ fontWeight: 600, color: "#3b5a40" }}>{dept.name}</TableCell>
                  <TableCell>
                    {dept.routing_rules?.map((r) => r.category).join(", ") || "—"}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete Department">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteDepartment(dept.id)}
                      >
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
