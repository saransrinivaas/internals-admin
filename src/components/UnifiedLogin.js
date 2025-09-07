
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

export default function UnifiedLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Check in users collection (Super Admin)
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", email),
        where("password", "==", password)
      );
      const userSnap = await getDocs(userQuery);

      if (!userSnap.empty) {
        const user = { id: userSnap.docs[0].id, ...userSnap.docs[0].data() };

        // SUPER ADMIN
        if (user.role === "SUPER_ADMIN") {
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/dashboard");
          return;
        }

        // STAFF stored in users
        if (user.role === "STAFF") {
          localStorage.setItem("staff", JSON.stringify(user));
          navigate("/staff-dashboard");
          return;
        }
      }

      // 2. Check in departments collection (Dept Heads)
      const deptQuery = query(
        collection(db, "departments"),
        where("email", "==", email),
        where("password", "==", password)
      );
      const deptSnap = await getDocs(deptQuery);

      if (!deptSnap.empty) {
        const dept = { id: deptSnap.docs[0].id, ...deptSnap.docs[0].data() };
        localStorage.setItem("department", JSON.stringify(dept));
        navigate("/dept-dashboard");
        return;
      }

      // 3. Extra check in staff collection (if staff not found in users)
      const staffQuery = query(
        collection(db, "staff"),
        where("email", "==", email),
        where("password", "==", password)
      );
      const staffSnap = await getDocs(staffQuery);

      if (!staffSnap.empty) {
        const staff = { id: staffSnap.docs[0].id, ...staffSnap.docs[0].data() };
        localStorage.setItem("staff", JSON.stringify(staff));
        navigate("/staff-dashboard");
        return;
      }

      // If no match
      setError("Invalid email or password");

    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper sx={{ p: 5, width: 380 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Unified Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          />

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#3b5d3a",
              "&:hover": { bgcolor: "#2e472d" },
              fontWeight: 600,
            }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
}