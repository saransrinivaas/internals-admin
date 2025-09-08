
// import React, { useEffect, useState } from "react";
// import {
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   MenuItem,
//   Select,
//   Paper,
// } from "@mui/material";
// import EnhancedEncryptionIcon from "@mui/icons-material/EnhancedEncryption";
// import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
// import SchoolIcon from "@mui/icons-material/School";
// import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
// import OpacityIcon from "@mui/icons-material/Opacity";
// import FlashOnIcon from "@mui/icons-material/FlashOn";
// import LightbulbIcon from "@mui/icons-material/Lightbulb";
// import DeleteIcon from "@mui/icons-material/Delete";
// import RecyclingIcon from "@mui/icons-material/Recycling";
// import PetsIcon from "@mui/icons-material/Pets";
// import SecurityIcon from "@mui/icons-material/Security";
// import WavesIcon from "@mui/icons-material/Waves";
// import NatureIcon from "@mui/icons-material/Nature";
// import WcIcon from "@mui/icons-material/Wc";
// import BugReportIcon from "@mui/icons-material/BugReport";
// import DomainIcon from "@mui/icons-material/Domain";
// import AltRouteIcon from "@mui/icons-material/AltRoute";
// import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
// import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
// import ChatIcon from "@mui/icons-material/Chat";
// import { useNavigate } from "react-router-dom";
// import { db } from "../firebase";
// import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

// const toKey = (s) =>
//   (s || "")
//     .replace(/[\s&]/g, "")
//     .replace(/[^a-zA-Z0-9]/g, "")
//     .toLowerCase();

// const visualMap = {
//   pothole: { icon: <DirectionsCarIcon />, bg: "#fcf7de" },
//   pollution: { icon: <WavesIcon />, bg: "#d3f4f1" },
//   powersupply: { icon: <FlashOnIcon />, bg: "#fff1d0" },
//   streetlight: { icon: <LightbulbIcon />, bg: "#fdecef" },
//   sanitationandhygiene: { icon: <EnhancedEncryptionIcon />, bg: "#d6f1d9" },
//   solidwaste: { icon: <DeleteIcon />, bg: "#f6f6f6" },
//   recycling: { icon: <RecyclingIcon />, bg: "#dcdcf1" },
//   streetdogs: { icon: <PetsIcon />, bg: "#f8ebed" },
//   buildingsafety: { icon: <SecurityIcon />, bg: "#e9f5f3" },
//   infrastructureandmaintenance: { icon: <DomainIcon />, bg: "#d1eff0" },
//   roadsandtraffic: { icon: <AltRouteIcon />, bg: "#edf0f8" },
//   mosquitomaintenance: { icon: <BugReportIcon />, bg: "#e5f3fc" },
//   publictransport: { icon: <DirectionsBusIcon />, bg: "#dde2ff" },
//   water: { icon: <OpacityIcon />, bg: "#e6f2ff" },
//   medical: { icon: <LocalHospitalIcon />, bg: "#f0e6ff" },
//   schoolandcollege: { icon: <SchoolIcon />, bg: "#fff0e6" },
//   treeandgreencover: { icon: <NatureIcon />, bg: "#dff0d8" },
//   publictoilet: { icon: <WcIcon />, bg: "#e9f6f2" },
//   others: { icon: <EmojiObjectsIcon />, bg: "#f0f0f0" },
//   default: { icon: <ChatIcon />, bg: "#f5f5f5" },
// };

// const getVisual = (name) => {
//   const k = toKey(name);
//   return visualMap[k] || visualMap.default;
// };

// const getUnique = (arr) => {
//   const seen = new Set();
//   return arr.filter((item) => {
//     const k = toKey(item.name);
//     if (seen.has(k) || !k) return false;
//     seen.add(k);
//     return true;
//   });
// };

// export default function CategoryPage() {
//   const [categories, setCategories] = useState([]);
//   const [issues, setIssues] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [dialogType, setDialogType] = useState("");
//   const [categoryDetails, setCategoryDetails] = useState(null);
//   const [selectedIssue, setSelectedIssue] = useState(null);
//   const [allocDept, setAllocDept] = useState("");

//   const navigate = useNavigate();

//   useEffect(() => {
//     async function loadCategories() {
//       const snap = await getDocs(collection(db, "category"));
//       const cats = snap.docs.map((doc) => ({
//         id: doc.id,
//         name: doc.data().CategoryName || "",
//         departmentId: doc.data().departmentId || "",
//         departmentEmail: doc.data().departmentEmail || "",
//         department: doc.data().department || "", // for backward compatibility
//       }));
//       setCategories(getUnique(cats));
//     }
//     loadCategories();

//     async function loadIssues() {
//       const snap = await getDocs(collection(db, "issues"));
//       setIssues(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
//     }
//     loadIssues();

//     async function loadDepartments() {
//       const snap = await getDocs(collection(db, "departments"));
//       setDepartments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
//     }
//     loadDepartments();
//   }, []);

//   const getCount = (catName) => {
//     return issues.filter((issue) => toKey(issue.category) === toKey(catName)).length;
//   };

//   const handleClick = (cat) => {
//     setSelectedIssue(null);
//     setAllocDept("");
//     if (toKey(cat.name) === "others") {
//       setDialogType("others");
//       setOpenDialog(true);
//     } else {
//       setCategoryDetails(cat);
//       setDialogType("details");
//       setOpenDialog(true);
//     }
//   };

//   // Department dashboard navigation logic using departmentId if available, else fallback to email
//   const handleViewDeptDashboard = () => {
//     // 1. If departmentId is present in category, use it directly
//     if (categoryDetails?.departmentId) {
//       navigate(`/dept-dashboard/${categoryDetails.departmentId}`);
//       setOpenDialog(false);
//       return;
//     }
//     // 2. Fallback: Look up department by email in case of earlier data
//     if (categoryDetails?.departmentEmail) {
//       const found = departments.find(
//         (d) => (d.email || "").trim().toLowerCase() === categoryDetails.departmentEmail.trim().toLowerCase()
//       );
//       if (found) {
//         navigate(`/dept-dashboard/${found.id}`);
//         setOpenDialog(false);
//         return;
//       }
//     }
//     // 3. Final fallback: Try by department name, normalize + warn if nothing found
//     if (categoryDetails?.department) {
//       const found = departments.find(
//         (d) => (d.name || "").trim().toLowerCase() === categoryDetails.department.trim().toLowerCase()
//       );
//       if (found) {
//         navigate(`/dept-dashboard/${found.id}`);
//         setOpenDialog(false);
//         return;
//       }
//     }
//     alert("Department not found for this category. Please check data integrity.");
//   };

//   const handleAllocate = async (issueId) => {
//     if (!allocDept) return;
//     try {
//       await updateDoc(doc(db, "issues", issueId), { department: allocDept });
//       alert("Department Assigned!");
//       setAllocDept("");
//       setSelectedIssue(null);
//       setOpenDialog(false);
//     } catch (err) {
//       alert("Failed to allocate department: " + err.message);
//     }
//   };

//   return (
//     <Box sx={{ p: { xs: 1, md: 4 }, minHeight: "100vh", bgcolor: "#f7f7f7" }}>
//       <Box
//         sx={{
//           maxWidth: 1100,
//           margin: "auto",
//           p: { xs: 2, md: 5 },
//           bgcolor: "#fff",
//           borderRadius: 3,
//         }}
//       >
//         <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
//           Grievance Categories
//         </Typography>
//         <Grid container spacing={3} justifyContent="center">
//           {categories.map((cat) => {
//             const { icon, bg } = getVisual(cat.name);
//             return (
//               <Grid
//                 key={cat.id}
//                 item
//                 xs={12}
//                 sm={6}
//                 md={4}
//                 lg={3}
//                 sx={{ display: "flex", justifyContent: "center" }}
//               >
//                 <Card
//                   onClick={() => handleClick(cat)}
//                   sx={{
//                     width: 170,
//                     height: 190,
//                     borderRadius: 4,
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     cursor: "pointer",
//                     backgroundColor: "#fafdff",
//                     boxShadow: "0 4px 12px #dde4dc44",
//                     transition: "transform 0.17s, box-shadow 0.19s",
//                     "&:hover": { boxShadow: 8, transform: "scale(1.055)" },
//                     px: 1,
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       backgroundColor: bg,
//                       borderRadius: "50%",
//                       width: 60,
//                       height: 60,
//                       display: "flex",
//                       justifyContent: "center",
//                       alignItems: "center",
//                       mb: 2,
//                       boxShadow: "0 4px 12px #eaece7",
//                     }}
//                   >
//                     {React.cloneElement(icon, { sx: { fontSize: 32, color: "#35787e" } })}
//                   </Box>
//                   <CardContent sx={{ p: 0, textAlign: "center" }}>
//                     <Typography
//                       variant="body1"
//                       sx={{ fontWeight: 700, fontSize: 17, textTransform: "capitalize", mb: 0.2, color: "#232b36" }}
//                     >
//                       {cat.name}
//                     </Typography>
//                     <Typography variant="body2" color="textSecondary">
//                       Issues: {getCount(cat.name)}
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             );
//           })}
//         </Grid>
//       </Box>

//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
//         {dialogType === "details" && (
//           <>
//             <DialogTitle>{categoryDetails?.name} Details</DialogTitle>
//             <DialogContent>
//               <Typography gutterBottom>
//                 <strong>Department:</strong> {categoryDetails?.department || "N/A"}
//               </Typography>
//               <Typography gutterBottom>
//                 <strong>Total Issues:</strong> {getCount(categoryDetails?.name)}
//               </Typography>
//             </DialogContent>
//             <DialogActions>
//               <Button variant="contained" onClick={handleViewDeptDashboard}>
//                 View Department Dashboard
//               </Button>
//               <Button variant="outlined" onClick={() => setOpenDialog(false)}>
//                 Close
//               </Button>
//             </DialogActions>
//           </>
//         )}

//         {dialogType === "others" && (
//           <>
//             <DialogTitle>Unassigned "Others" Issues</DialogTitle>
//             <DialogContent>
//               {issues.filter((i) => toKey(i.category) === "others").length === 0 ? (
//                 <Typography>No 'Others' issues found.</Typography>
//               ) : (
//                 issues
//                   .filter((i) => toKey(i.category) === "others")
//                   .map((issue) => (
//                     <Paper
//                       key={issue.id}
//                       variant="outlined"
//                       sx={{ marginY: 1, padding: 2, backgroundColor: "#eef8f7" }}
//                     >
//                       <Typography gutterBottom>
//                         <strong>Description:</strong> {issue.description || <em>No description</em>}
//                       </Typography>
//                       <Typography gutterBottom>
//                         <strong>Status:</strong> {issue.status || "N/A"}
//                       </Typography>
//                       <Typography gutterBottom>
//                         <strong>Department:</strong> {issue.department || "Not Assigned"}
//                       </Typography>
//                       <Box sx={{ display: "flex", gap: 2, alignItems: "center", marginTop: 1 }}>
//                         <Select
//                           size="small"
//                           value={selectedIssue?.id === issue.id ? allocDept : ""}
//                           onChange={(e) => {
//                             setAllocDept(e.target.value);
//                             setSelectedIssue(issue);
//                           }}
//                           displayEmpty
//                         >
//                           <MenuItem value="">
//                             <em>Assign Department</em>
//                           </MenuItem>
//                           {departments.map((dep) => (
//                             <MenuItem key={dep.id} value={dep.name}>
//                               {dep.name}
//                             </MenuItem>
//                           ))}
//                         </Select>
//                         <Button
//                           variant="contained"
//                           color="success"
//                           disabled={!allocDept}
//                           onClick={() => handleAllocate(issue.id)}
//                         >
//                           Allocate
//                         </Button>
//                       </Box>
//                     </Paper>
//                   ))
//               )}
//             </DialogContent>
//             <DialogActions>
//               <Button variant="outlined" onClick={() => setOpenDialog(false)}>
//                 Close
//               </Button>
//             </DialogActions>
//           </>
//         )}
//       </Dialog>
//     </Box>
//   );
// }
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
// import EnhancedEncryptionIcon from "@mui/icons-material/EnhancedEncryption";
// import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
// import SchoolIcon from "@mui/icons-material/School";
// import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import OpacityIcon from "@mui/icons-material/Opacity";
// import FlashOnIcon from "@mui/icons-material/FlashOn";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import DeleteIcon from "@mui/icons-material/Delete";
// import RecyclingIcon from "@mui/icons-material/Recycling";
import PetsIcon from "@mui/icons-material/Pets";
// import SecurityIcon from "@mui/icons-material/Security";
import WavesIcon from "@mui/icons-material/Waves";
import NatureIcon from "@mui/icons-material/Nature";
import WcIcon from "@mui/icons-material/Wc";
import BugReportIcon from "@mui/icons-material/BugReport";
// import DomainIcon from "@mui/icons-material/Domain";
// import AltRouteIcon from "@mui/icons-material/AltRoute";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const toKey = (s) =>
  (s || "")
    .replace(/[\s&]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

const visualMap = {
  pothole: { icon: <DirectionsCarIcon />, bg: "#fcf7de" },
  streetlight: { icon: <LightbulbIcon />, bg: "#fdecef" },
  publictoilet: { icon: <WcIcon />, bg: "#e9f6f2" },
  garbage: { icon: <DeleteIcon />, bg: "#f6f6f6" },
  streetdogs: { icon: <PetsIcon />, bg: "#f8ebed" },
  mosquitomaintanence: { icon: <BugReportIcon />, bg: "#e5f3fc" },
  waterstagnation: { icon: <OpacityIcon />, bg: "#e6f2ff" },
  treefallen: { icon: <NatureIcon />, bg: "#dff0d8" },
  others: { icon: <EmojiObjectsIcon />, bg: "#f0f0f0" },
  stormwaterdrains: { icon: <WavesIcon />, bg: "#d3f4f1" },
  brokenbin: { icon: <DeleteIcon />, bg: "#f6f6f6" },
  // Fallback: any unmapped category uses a comment icon + a gentle background
  default: { icon: <ChatIcon />, bg: "#f5f5f5" },
};


const getVisual = (name) => {
  const k = toKey(name);
  return visualMap[k] || visualMap.default;
};

const getUnique = (arr) => {
  const seen = new Set();
  return arr.filter((item) => {
    const k = toKey(item.name);
    if (seen.has(k) || !k) return false;
    seen.add(k);
    return true;
  });
};

export default function CategoryPage() {
  const [categories, setCategories] = React.useState([]);
  const [issues, setIssues] = React.useState([]);
  const [departments, setDepartments] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogType, setDialogType] = React.useState("");
  const [categoryDetails, setCategoryDetails] = React.useState(null);
  const [selectedIssue, setSelectedIssue] = React.useState(null);
  const [allocCategory, setAllocCategory] = React.useState({});
  const navigate = useNavigate();

  React.useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "category"));
      const cats = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().CategoryName || "",
        departmentId: doc.data().departmentId || "",
        departmentEmail: doc.data().departmentEmail || "",
        department: doc.data().department || "", // for backward compatibility
      }));
      setCategories(getUnique(cats));
    }
    loadCategories();

    async function loadIssues() {
      const snap = await getDocs(collection(db, "issues"));
      setIssues(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    loadIssues();

    async function loadDepartments() {
      const snap = await getDocs(collection(db, "departments"));
      setDepartments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    loadDepartments();
  }, []);

  const getCount = (catName) => {
    return issues.filter((issue) => toKey(issue.category) === toKey(catName)).length;
  };

  const handleClick = (cat) => {
    setSelectedIssue(null);
    setAllocCategory({});
    if (toKey(cat.name) === "others") {
      setDialogType("others");
      setOpenDialog(true);
    } else {
      setCategoryDetails(cat);
      setDialogType("details");
      setOpenDialog(true);
    }
  };

  // Department dashboard navigation logic
  const handleViewDeptDashboard = () => {
    if (categoryDetails?.departmentId) {
      navigate(`/dept-dashboard/${categoryDetails.departmentId}`);
      setOpenDialog(false);
      return;
    }
    if (categoryDetails?.departmentEmail) {
      const found = departments.find(
        (d) => (d.email || "").trim().toLowerCase() === categoryDetails.departmentEmail.trim().toLowerCase()
      );
      if (found) {
        navigate(`/dept-dashboard/${found.id}`);
        setOpenDialog(false);
        return;
      }
    }
    if (categoryDetails?.department) {
      const found = departments.find(
        (d) => (d.name || "").trim().toLowerCase() === categoryDetails.department.trim().toLowerCase()
      );
      if (found) {
        navigate(`/dept-dashboard/${found.id}`);
        setOpenDialog(false);
        return;
      }
    }
    alert("Department not found for this category. Please check data integrity.");
  };

  // Allocation logic for 'others' issues using category selection
  const allocateOthersIssue = async (issueId) => {
    const selectedCatId = allocCategory[issueId];
    if (!selectedCatId) {
      alert("Please select a category to allocate.");
      return;
    }
    try {
      const selectedCategory = categories.find(cat => cat.id === selectedCatId);
      if (!selectedCategory) {
        alert("Selected category not found.");
        return;
      }
      await updateDoc(doc(db, "issues", issueId), {
        category: selectedCategory.name,
        department: selectedCategory.department || "",
        departmentId: selectedCategory.departmentId || "",
        departmentEmail: selectedCategory.departmentEmail || ""
      });
      alert("Category and department allocated to issue!");

      // Clear selection & close dialog for this issue
      setAllocCategory(prev => {
        const copy = { ...prev };
        delete copy[issueId];
        return copy;
      });

      // Optionally, update local issues state to reflect change immediately
      setIssues(prev =>
        prev.map(issue =>
          issue.id === issueId ? { ...issue, category: selectedCategory.name } : issue
        )
      );

      setSelectedIssue(null);
      setOpenDialog(false);
    } catch (err) {
      alert("Failed to allocate category: " + err.message);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1100, margin: "auto", p: { xs: 2, md: 5 }, bgcolor: "#fff", borderRadius: 3 }}>
        <Typography variant="h5" align="center" sx={{ fontWeight: "bold", mb: 3 }}>
          Grievance Categories
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {categories.map((cat) => {
            const { icon, bg } = getVisual(cat.name);
            return (
              <Grid key={cat.id} item xs={12} sm={6} md={4} lg={3} sx={{ display: "flex", justifyContent: "center" }}>
                <Card
                  onClick={() => handleClick(cat)}
                  sx={{
                    width: 170,
                    height: 190,
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    backgroundColor: "#fafdff",
                    boxShadow: "0 4px 12px #ddeeff44",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": { transform: "scale(1.05)", boxShadow: 6 },
                    px: 1,
                  }}
                >
                  <Box sx={{ backgroundColor: bg, borderRadius: "50%", width: 60, height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, boxShadow: "0 4px 8px #bbb" }}>
                    {React.cloneElement(icon, { sx: { fontSize: 32, color: "#357a7e" } })}
                  </Box>
                  <CardContent sx={{ p: 0, textAlign: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: '700', fontSize: 18, textTransform: "capitalize", color: "#222" }}>
                      {cat.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Issues: {getCount(cat.name)}
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
              <Typography gutterBottom><b>Department:</b> {categoryDetails?.department || "N/A"}</Typography>
              <Typography gutterBottom><b>Total Issues:</b> {getCount(categoryDetails?.name)}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleViewDeptDashboard} variant="contained">View Department Dashboard</Button>
              <Button onClick={() => setOpenDialog(false)} variant="outlined">Close</Button>
            </DialogActions>
          </>
        )}

        {dialogType === "others" && (
          <>
            <DialogTitle>Unassigned "Others" Issues</DialogTitle>
            <DialogContent>
              {issues.filter(i => toKey(i.category) === "others").length === 0 ? (
                <Typography>No 'Others' issues found.</Typography>
              ) : (
                issues.filter(i => toKey(i.category) === "others").map(issue => (
                  <Paper key={issue.id} variant="outlined" sx={{ my: 1, p: 2, backgroundColor: "#eef7f7" }}>
                    <Typography gutterBottom><b>Description:</b> {issue.description || <em>No description</em>}</Typography>
                    <Typography gutterBottom><b>Status:</b> {issue.status || "N/A"}</Typography>
                    <Typography gutterBottom><b>Category:</b> {issue.category || "Others"}</Typography>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
                      <Select
                        size="small"
                        value={allocCategory[issue.id] || ""}
                        onChange={e => setAllocCategory(prev => ({ ...prev, [issue.id]: e.target.value }))}
                        displayEmpty
                      >
                        <MenuItem value=""><em>Assign Category</em></MenuItem>
                        {categories.map(cat => (
                          <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                        ))}
                      </Select>
                      <Button
                        variant="contained"
                        color="success"
                        disabled={!allocCategory[issue.id]}
                        onClick={() => allocateOthersIssue(issue.id)}
                      >
                        Allocate
                      </Button>
                    </Box>
                  </Paper>
                ))
              )}
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
