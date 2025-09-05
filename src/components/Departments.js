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
  color: "#3b5d3a",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTableRow = styled(TableRow)({
  "&:hover": {
    backgroundColor: "#f0f7f0",
  },
});

export default function Departments({ departments = [], addDepartment, deleteDepartment }) {
  const [newDeptName, setNewDeptName] = useState("");
  const [newRoutingRule, setNewRoutingRule] = useState("");

  const handleAdd = () => {
    if (newDeptName.trim() === "") return; // basic validation
    addDepartment(newDeptName.trim(), newRoutingRule.trim());
    setNewDeptName("");
    setNewRoutingRule("");
  };

  return (
    <Box 
      sx={{
        backgroundColor: "#fff",
        borderRadius: 3,
        padding: 4,
        boxShadow: "0 5px 15px rgba(60,79,47,0.15)",
        maxWidth: 900,
        margin: "auto",
      }}
    >
      <Typography 
        variant="h5" 
        fontWeight="bold" 
        color="#3b5d3a" 
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
          alignItems: "center"
        }}
      >
        <TextField
          label="Department Name"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 240 }}
          size="small"
        />
        <TextField
          label="Routing Rule (Category)"
          value={newRoutingRule}
          onChange={(e) => setNewRoutingRule(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 240 }}
          size="small"
        />
        <OliveButton onClick={handleAdd}>Add Department</OliveButton>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: "0 4px 12px rgba(60,79,47,0.12)" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e6f4ea" }}>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Routing Rules</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ fontStyle: "italic", color: "#6b7280" }}>
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
