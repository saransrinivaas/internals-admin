import React, { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const roleOptions = [
  { value: "all", label: "All" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "STAFF", label: "Staff" },
  { value: "DEPT_HEAD", label: "Department Head" },
  { value: "END_USER", label: "End User" },
];

export default function Users({ users = [] }) {
  const [roleFilter, setRoleFilter] = useState("all");

  // Filter users based on role filter selection
  const filteredUsers = users.filter((user) => {
    if (roleFilter === "all") return true;
    // Accept either lower/upper case in backend storage for role
    return (
      (user.role && user.role.toUpperCase()) === roleFilter.toUpperCase()
    );
  });

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: 2, padding: 3, boxShadow: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Users
      </Typography>

      {/* Role search filter */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="role-filter-label">Role Filter</InputLabel>
          <Select
            labelId="role-filter-label"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Role Filter"
          >
            {roleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <TableRow key={user.id || user.email || idx}>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role === "SUPER_ADMIN"
                      ? "Super Admin"
                      : user.role === "DEPT_HEAD"
                      ? "Department Head"
                      : user.role === "STAFF"
                      ? "Staff"
                      : user.role === "END_USER" || user.role === "end_user"
                      ? "End User"
                      : user.role || "N/A"}
                  </TableCell>
                  <TableCell>{user.department || "N/A"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
