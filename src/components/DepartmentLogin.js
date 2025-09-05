import React, { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

// Same palette as SuperAdminDashboard
const C = {
  olive: "#3b5d3a",
  oliveDark: "#2e472d",
  oliveLight: "#486a3e",
  textLight: "#ffffff",
  bg: "#f5f7f5",
  accent: "#6B8A47",
};

// Styled button for visual consistency
const OliveButton = styled(Button)({
  backgroundColor: C.accent,
  color: C.textLight,
  fontWeight: 600,
  padding: "12px",
  borderRadius: 8,
  fontSize: 16,
  boxShadow: "0 1px 7px #b1c4a533",
  "&:hover": {
    backgroundColor: C.oliveDark,
  },
});

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
        localStorage.setItem(
          "department",
          JSON.stringify({ id: deptDoc.id, ...deptData })
        );
        navigate("/dept-dashboard");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: C.olive, // Full screen olive green background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 5,
          borderRadius: 4,
          boxShadow: "0 2px 16px #6b8a4726",
          width: 380,
          maxWidth: "90vw",
          textAlign: "center",
          bgcolor: "#fff", // White background for login box
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 2,
            color: C.olive,
            letterSpacing: ".5px",
          }}
        >
          Department Login
        </Typography>
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <OliveButton variant="contained" fullWidth onClick={handleLogin}>
          Login
        </OliveButton>
      </Paper>
    </Box>
  );
}
