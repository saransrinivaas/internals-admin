import React, { useState } from "react";
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

const OliveButton = styled(Button)({
  backgroundColor: "#6B8A47",
  color: "white",
  "&:hover": {
    backgroundColor: "#556B2F",
  },
  marginTop: 2,
});

export default function Users({ users=[], inviteUser }) {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("staff");

  const handleInvite = () => {
    inviteUser(newUserEmail, newUserRole);
    setNewUserEmail("");
    setNewUserRole("staff");
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: 2, padding: 3, boxShadow: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Users
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", marginBottom: 3 }}>
        <TextField
          label="Invite Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
        />
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Role</InputLabel>
          <Select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} label="Role">
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="dept_head">Department Head</MenuItem>
            <MenuItem value="super_admin">Super Admin</MenuItem>
          </Select>
        </FormControl>
        <OliveButton onClick={handleInvite}>Invite User</OliveButton>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name || "N/A"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.department || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
