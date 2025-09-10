// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { db } from "../firebase";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import {
//   Box,
//   Button,
//   TextField,
//   Typography,
//   Paper,
//   Divider,
// } from "@mui/material";
// import logo from "./logo.jpg"; // <-- Adjust path if needed

// const PALETTE = {
//   oliveDark: "#3b5d3a",
//   olive: "#486a3e",
//   oliveLight: "#6B8A47",
//   accent: "#a3b18a",
//   bg: "#f5f7f5",
//   textLight: "#ffffff",
// };

// export default function UnifiedLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       // 1. Check in users collection (Super Admin)
//       const userQuery = query(
//         collection(db, "users"),
//         where("email", "==", email),
//         where("password", "==", password)
//       );
//       const userSnap = await getDocs(userQuery);
//       if (!userSnap.empty) {
//         const user = { id: userSnap.docs[0].id, ...userSnap.docs[0].data() };
//         // SUPER ADMIN
//         if (user.role === "SUPER_ADMIN") {
//           localStorage.setItem("user", JSON.stringify(user));
//           navigate("/dashboard");
//           return;
//         }
//         // STAFF stored in users
//         if (user.role === "STAFF") {
//           localStorage.setItem("staff", JSON.stringify(user));
//           navigate("/staff-dashboard");
//           return;
//         }
//         if (user.role === "PUBLIC_WORKS") {
//           localStorage.setItem("publicworks", JSON.stringify(user));
//           navigate("/publicwork");
//           return;
//         }
//       }

//       // 2. Check in departments collection (Dept Heads)
//       const deptQuery = query(
//         collection(db, "departments"),
//         where("email", "==", email),
//         where("password", "==", password)
//       );
//       const deptSnap = await getDocs(deptQuery);
//       if (!deptSnap.empty) {
//         const dept = { id: deptSnap.docs[0].id, ...deptSnap.docs[0].data() };
//         localStorage.setItem("department", JSON.stringify(dept));
//         navigate(`/dept-dashboard/${dept.id}`);
//         return;
//       }

//       // 3. Extra check in staff collection (if staff not found in users)
//       const staffQuery = query(
//         collection(db, "staff"),
//         where("email", "==", email),
//         where("password", "==", password)
//       );
//       const staffSnap = await getDocs(staffQuery);
//       if (!staffSnap.empty) {
//         const staff = { id: staffSnap.docs[0].id, ...staffSnap.docs[0].data() };
//         localStorage.setItem("staff", JSON.stringify(staff));
//         navigate("/staff-dashboard");
//         return;
//       }

//       // If no match
//       setError("Invalid email or password");
//     } catch (err) {
//       console.error("Login error:", err);
//       setError("Something went wrong. Try again.");
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         bgcolor: PALETTE.oliveDark,
//         background: `linear-gradient(135deg, ${PALETTE.oliveDark} 0%, ${PALETTE.oliveLight} 100%)`,
//         p: 3,
//       }}
//     >
//       <Paper
//         elevation={10}
//         sx={{
//           p: 6, // increased padding
//           width: { xs: 360, sm: 440, md: 480 }, // increased width and responsive
//           minHeight: 480, // make it a bit taller
//           borderRadius: 4,
//           boxShadow: "0 8px 32px 0 rgba(59,93,58,0.18)",
//           background: "rgba(255,255,255,0.97)",
//           border: `1.5px solid ${PALETTE.accent}`,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         {/* Logo */}
//         <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
//           <img
//             src={logo}
//             alt="Logo"
//             style={{
//               height: 80,
//               maxWidth: "100%",
//               objectFit: "contain", // keeps aspect ratio, no compression
//               borderRadius: 16,
//               boxShadow: "0 2px 12px #0002",
//               background: "#fff0",
//               display: "block",
//             }}
//           />
//         </Box>

//         <Typography
//           variant="h4"
//           sx={{
//             mb: 2,
//             fontWeight: 700,
//             color: PALETTE.olive,
//             textAlign: "center",
//             fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//             textShadow: "1px 1px 2px rgba(107,138,71,0.10)",
//             letterSpacing: "1px",
//             width: "100%",
//           }}
//         >
//           Unified Login
//         </Typography>

//         <Divider sx={{ mb: 3, bgcolor: PALETTE.oliveLight, width: "100%" }} />

//         <Box
//           component="form"
//           onSubmit={handleLogin}
//           sx={{
//             width: "100%",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <TextField
//             label="Email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             fullWidth
//             required
//             sx={{
//               mb: 3,
//               bgcolor: "#f9f9f9",
//               borderRadius: 1,
//               "& .MuiOutlinedInput-root": {
//                 "& fieldset": {
//                   borderColor: PALETTE.oliveLight,
//                 },
//                 "&:hover fieldset": {
//                   borderColor: PALETTE.olive,
//                 },
//                 "&.Mui-focused fieldset": {
//                   borderColor: PALETTE.oliveDark,
//                   boxShadow: `0 0 8px ${PALETTE.oliveLight}`,
//                 },
//               },
//             }}
//           />
//           <TextField
//             label="Password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             fullWidth
//             required
//             sx={{
//               mb: 3,
//               bgcolor: "#f9f9f9",
//               borderRadius: 1,
//               "& .MuiOutlinedInput-root": {
//                 "& fieldset": {
//                   borderColor: PALETTE.oliveLight,
//                 },
//                 "&:hover fieldset": {
//                   borderColor: PALETTE.olive,
//                 },
//                 "&.Mui-focused fieldset": {
//                   borderColor: PALETTE.oliveDark,
//                   boxShadow: `0 0 8px ${PALETTE.oliveLight}`,
//                 },
//               },
//             }}
//           />
//           {error && (
//             <Typography
//               color="error"
//               sx={{
//                 mb: 2,
//                 textAlign: "center",
//                 fontWeight: 600,
//                 width: "100%",
//               }}
//             >
//               {error}
//             </Typography>
//           )}

//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{
//               bgcolor: PALETTE.olive,
//               color: "#fff",
//               fontWeight: 700,
//               py: 1.5,
//               fontSize: 16,
//               borderRadius: 2,
//               textTransform: "none",
//               letterSpacing: "1px",
//               boxShadow: "0 4px 15px rgba(59,93,58,0.15)",
//               "&:hover": {
//                 bgcolor: PALETTE.oliveDark,
//                 boxShadow: "0 6px 18px rgba(59,93,58,0.22)",
//               },
//               mt: 1,
//             }}
//           >
//             Login
//           </Button>
//         </Box>
//       </Paper>
//     </Box>
//   );
// }
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
  Divider,
} from "@mui/material";
import logo from "./logo.jpg"; // <-- Adjust path if needed

const PALETTE = {
  oliveDark: "#3b5d3a",
  olive: "#486a3e",
  oliveLight: "#6B8A47",
  accent: "#a3b18a",
  bg: "#f5f7f5",
  textLight: "#ffffff",
};

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
        if (user.role === "PUBLIC_WORKS") {
          localStorage.setItem("publicworks", JSON.stringify(user));
          navigate("/publicwork");
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
        navigate(`/dept-dashboard/${dept.id}`);
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
        bgcolor: PALETTE.oliveDark,
        background: `linear-gradient(135deg, ${PALETTE.oliveDark} 0%, ${PALETTE.oliveLight} 100%)`,
        p: 3,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: { xs: 3, sm: 6 },
          width: { xs: 340, sm: 420, md: 480 },
          minHeight: 500,
          borderRadius: 4,
          boxShadow: "0 8px 32px 0 rgba(59,93,58,0.18)",
          background: "rgba(255,255,255,0.97)",
          border: `1.5px solid ${PALETTE.accent}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            mb: 2,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: 80,
              maxWidth: "100%",
              objectFit: "contain",
              borderRadius: 16,
              boxShadow: "0 2px 12px #0002",
              background: "#fff0",
              display: "block",
            }}
          />
        </Box>

        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: PALETTE.olive,
            textAlign: "center",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            textShadow: "1px 1px 2px rgba(107,138,71,0.10)",
            letterSpacing: "1px",
            width: "100%",
          }}
        >
          Unified Login
        </Typography>

        <Divider sx={{ mb: 3, bgcolor: PALETTE.oliveLight, width: "100%" }} />

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            sx={{
              mb: 3,
              bgcolor: "#f9f9f9",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: PALETTE.oliveLight,
                },
                "&:hover fieldset": {
                  borderColor: PALETTE.olive,
                },
                "&.Mui-focused fieldset": {
                  borderColor: PALETTE.oliveDark,
                  boxShadow: `0 0 8px ${PALETTE.oliveLight}`,
                },
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            sx={{
              mb: 3,
              bgcolor: "#f9f9f9",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: PALETTE.oliveLight,
                },
                "&:hover fieldset": {
                  borderColor: PALETTE.olive,
                },
                "&.Mui-focused fieldset": {
                  borderColor: PALETTE.oliveDark,
                  boxShadow: `0 0 8px ${PALETTE.oliveLight}`,
                },
              },
            }}
          />
          {error && (
            <Typography
              color="error"
              sx={{
                mb: 2,
                textAlign: "center",
                fontWeight: 600,
                width: "100%",
              }}
            >
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              bgcolor: PALETTE.olive,
              color: "#fff",
              fontWeight: 700,
              py: 1.5,
              fontSize: 16,
              borderRadius: 2,
              textTransform: "none",
              letterSpacing: "1px",
              boxShadow: "0 4px 15px rgba(59,93,58,0.15)",
              "&:hover": {
                bgcolor: PALETTE.oliveDark,
                boxShadow: "0 6px 18px rgba(59,93,58,0.22)",
              },
              mt: 1,
            }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}