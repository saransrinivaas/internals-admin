import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  Paper,
} from "@mui/material";

import EnhancedEncryptionIcon from "@mui/icons-material/EnhancedEncryption"; // sanitation and hygiene
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"; // medical
import SchoolIcon from "@mui/icons-material/School"; // school and college
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus"; // public transport
import OpacityIcon from "@mui/icons-material/Opacity"; // water
import FlashOnIcon from "@mui/icons-material/FlashOn"; // power supply
import LightbulbIcon from "@mui/icons-material/Lightbulb"; // street light
import DeleteIcon from "@mui/icons-material/Delete"; // solid waste
import RecyclingIcon from "@mui/icons-material/Recycling"; // recycling
import PetsIcon from "@mui/icons-material/Pets"; // street dogs
import SecurityIcon from "@mui/icons-material/Security"; // building safety
import WavesIcon from "@mui/icons-material/Waves"; // pollution
import NatureIcon from "@mui/icons-material/Nature"; // tree and green cover
import WcIcon from "@mui/icons-material/Wc"; // public toilet

// Creative icons for the requested categories
import BugReportIcon from "@mui/icons-material/BugReport"; // mosquito maintenance
import DomainIcon from "@mui/icons-material/Domain"; // infrastructure and maintenance
import AltRouteIcon from "@mui/icons-material/AltRoute"; // roads & traffic
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects"; // others
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"; // pothole

import ChatIcon from "@mui/icons-material/Chat";

import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const toKey = (s) =>
  (s || "")
    .replace(/[\s&]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

const visualMap = {
  pothole: { icon: <DirectionsCarIcon />, bg: "#fcf3c8" },
  pollution: { icon: <WavesIcon />, bg: "#fdf3c5" },
  powersupply: { icon: <FlashOnIcon />, bg: "#f6efbc" },
  streetlight: { icon: <LightbulbIcon />, bg: "#fee2f0" },
  sanitationandhygiene: { icon: <EnhancedEncryptionIcon />, bg: "#d2f2d6" },
  solidwaste: { icon: <DeleteIcon />, bg: "#e9eef2" },
  streetdogs: { icon: <PetsIcon />, bg: "#f7e2cc" },
  mosquitomaintenance: { icon: <BugReportIcon />, bg: "#f6dfb9" },
  publictoilet: { icon: <WcIcon />, bg: "#eadcf4" },
  waterstagnation: { icon: <OpacityIcon />, bg: "#e8e1fa" },
  treefallen: { icon: <NatureIcon />, bg: "#e4e7e7" },
  stormwaterdrains: { icon: <DomainIcon />, bg: "#d7f2ee" },
  brokenbin: { icon: <DeleteIcon />, bg: "#e9eef2" },
  others: { icon: <EmojiObjectsIcon />, bg: "#e3e7e7" },
  recycling: { icon: <RecyclingIcon />, bg: "#f1d3f2" },
  medical: { icon: <LocalHospitalIcon />, bg: "#e0f7fa" },
  schoolandcollege: { icon: <SchoolIcon />, bg: "#fdebd0" },
  buildingsafety: { icon: <SecurityIcon />, bg: "#e8f5e9" },
  publictransport: { icon: <DirectionsBusIcon />, bg: "#d6e6fa" },
};

const getVisual = (name) => {
  const k = toKey(name);
  return visualMap[k] || { icon: <ChatIcon />, bg: "#ececec" };
};

const getUniqueCategories = (arr) => {
  const seen = new Set();
  return arr.filter((cat) => {
    const k = toKey(cat.name);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [allocDept, setAllocDept] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "category"));
      let cats = snap.docs.map((doc) => ({
        name: (doc.data().CategoryName || "").replace(/"/g, "").trim(),
        department: (doc.data().Department || "").replace(/"/g, "").trim(),
      }));
      cats = getUniqueCategories(cats);
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchIssues = async () => {
      const snap = await getDocs(collection(db, "issues"));
      setIssues(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchIssues();

    const fetchDepartments = async () => {
      const snap = await getDocs(collection(db, "departments"));
      setDepartments(snap.docs.map((doc) => doc.data().name));
    };
    fetchDepartments();
  }, []);

  const getCount = (catName) => {
    const key = toKey(catName);
    return issues.filter((issue) => toKey(issue.category) === key).length;
  };

  const handleCategoryClick = (catObj) => {
    setSelectedIssue(null);
    setAllocDept("");
    if (toKey(catObj.name) === "others") {
      setDialogType("others");
      setOpenDialog(true);
    } else {
      setDialogType("details");
      setCategoryDetails(catObj);
      setOpenDialog(true);
    }
  };

  const handleAllocate = async (issueId) => {
    if (!allocDept) return;
    await updateDoc(doc(db, "issues", issueId), { department: allocDept });
    alert("Department Assigned!");
    setAllocDept("");
    setSelectedIssue(null);
    setOpenDialog(false);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, minHeight: "100vh", bgcolor: "#f7f7fa" }}>
      <Box
        sx={{
          maxWidth: 1150,
          mx: "auto",
          my: 3,
          borderRadius: 5,
          p: { xs: 2, md: 5 },
          bgcolor: "#fff",
        }}
      >
        <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 5 }}>
          Grievance Categories
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {categories.map((cat) => {
            const { icon, bg } = getVisual(cat.name);
            return (
              <Grid
                item
                key={cat.name}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Card
                  onClick={() => handleCategoryClick(cat)}
                  sx={{
                    width: 170,
                    height: 190,
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    px: 1,
                    bgcolor: "#fafdff",
                    boxShadow: "0 4px 12px #dde4dc44",
                    transition: "transform 0.17s, box-shadow 0.19s",
                    "&:hover": { boxShadow: 8, transform: "scale(1.055)" },
                  }}
                >
                  <Box
                    sx={{
                      background: bg,
                      borderRadius: "50%",
                      width: 60,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      boxShadow: "0 4px 12px #eaece7",
                    }}
                  >
                    {React.cloneElement(icon, {
                      sx: { fontSize: 32, color: "#35787e" },
                    })}
                  </Box>
                  <CardContent sx={{ p: 0, textAlign: "center" }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        fontSize: 17,
                        textTransform: "lowercase",
                        mb: 0.2,
                        color: "#232b36",
                      }}
                    >
                      {cat.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {`Issues: ${getCount(cat.name)}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        {dialogType === "details" && (
          <>
            <DialogTitle>{categoryDetails?.name} Details</DialogTitle>
            <DialogContent>
              <Typography sx={{ my: 2 }}>
                <strong>Department:</strong> {categoryDetails?.department || "-"}
              </Typography>
              <Typography>
                <strong>Total Issues:</strong> {getCount(categoryDetails?.name)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} variant="contained" sx={{ bgcolor: "#6B8A47", color: "#fff" }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}

        {dialogType === "others" && (
          <>
            <DialogTitle>Unassigned "Others" Issues</DialogTitle>
            <DialogContent>
              {issues.filter((i) => toKey(i.category) === "others").length === 0 && <Typography>No 'Others' issues found.</Typography>}
              {issues.filter((i) => toKey(i.category) === "others").map((issue) => (
                <Paper key={issue.id} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#f4faf1", borderRadius: 4 }}>
                  <Typography>
                    <strong>Description:</strong> {issue.description || <i>No description</i>}
                  </Typography>
                  <Typography>
                    <strong>Status:</strong> {issue.status || "-"}
                  </Typography>
                  <Typography>
                    <strong>Department:</strong> {issue.department || "Not Assigned"}
                  </Typography>
                  <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                    <Select
                      size="small"
                      sx={{ minWidth: 200 }}
                      value={selectedIssue?.id === issue.id ? allocDept : ""}
                      onChange={(e) => {
                        setAllocDept(e.target.value);
                        setSelectedIssue(issue);
                      }}
                    >
                      <MenuItem value="">
                        <em>Assign Department</em>
                      </MenuItem>
                      {departments.map((dep) => (
                        <MenuItem value={dep} key={dep}>
                          {dep}
                        </MenuItem>
                      ))}
                    </Select>
                    <Button variant="contained" sx={{ bgcolor: "#6B8A47", color: "#fff" }} onClick={() => handleAllocate(issue.id)}>
                      Allocate
                    </Button>
                  </Box>
                </Paper>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} variant="contained" sx={{ bgcolor: "#6B8A47", color: "#fff" }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
