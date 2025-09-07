import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button } from "@mui/material";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("staff");
    if (!raw) {
      navigate("/login");
      return;
    }
    try {
      setStaff(JSON.parse(raw));
    } catch {
      localStorage.removeItem("staff");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("staff");
    navigate("/login");
  };

  if (!staff) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7f5", p: 2 }}>
      <Paper sx={{ p: 3, maxWidth: 1000, mx: "auto", mt: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Welcome, {staff.name || staff.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Department: {staff.departmentName}
            </Typography>
          </Box>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        <Typography sx={{ mt: 3 }}>
          Staff dashboard is working ✅. Next we can add issue lists filtered by department.
        </Typography>
      </Paper>
    </Box>
  );
}
