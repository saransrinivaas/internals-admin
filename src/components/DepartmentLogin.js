// src/components/DepartmentLogin.js
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

export default function DepartmentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const q = query(collection(db, "departments"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Department not found");
        return;
      }

      const deptDoc = querySnapshot.docs[0];
      const deptData = deptDoc.data();

      if (deptData.password === password) {
        // ✅ Save login info in localStorage
        localStorage.setItem(
          "department",
          JSON.stringify({ id: deptDoc.id, ...deptData })
        );

        // ✅ Redirect to dashboard
        navigate("/dept-dashboard");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Paper sx={{ padding: 4, width: 400, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Department Login
        </Typography>
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" color="success" fullWidth onClick={handleLogin}>
          Login
        </Button>
      </Paper>
    </Box>
  );
}