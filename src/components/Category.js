
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
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  Alert
} from "@mui/material";
import {
  DirectionsCar,
  Block,
  VolumeUp,
  Lightbulb,
  Wc,
  Delete,
  LocalParking,
  Opacity,
  Pets,
  BugReport,
  CleaningServices,
  Water,
  EmojiObjects,
  Waves,
  HighlightOff,
  Construction,
  SmokingRooms,
  DeleteForever,
  AdminPanelSettings,
  Person,
  Add
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const toKey = (s) =>
  (s || "").replace(/[\s&]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

const visualMap = {
  illegalencroachment: { icon: <Block />, bg: "#eedce4" },
  pothole: { icon: <DirectionsCar />, bg: "#fcf1de" },
  noiseproblem: { icon: <VolumeUp />, bg: "#e0eff8" },
  streetlight: { icon: <Lightbulb />, bg: "#fbeef7" },
  publictoilet: { icon: <Wc />, bg: "#e4faf7" },
  garbage: { icon: <Delete />, bg: "#f7f7f7" },
  illegalvehicleparking: { icon: <LocalParking />, bg: "#efeae8" },
  openurination: { icon: <Opacity />, bg: "#e7f4f6" },
  streetdogs: { icon: <Pets />, bg: "#f0ebe4" },
  mosquitemaintenance: { icon: <BugReport />, bg: "#d6edea" },
  waterstagnation: { icon: <Opacity />, bg: "#dbeff7" },
  roadcleaningproblem: { icon: <CleaningServices />, bg: "#ecefeb" },
  treefallen: { icon: <Pets />, bg: "#e6f0dc" },
  cloggeddrainage: { icon: <Water />, bg: "#dbe6ea" },
  burninggarbage: { icon: <DirectionsCar />, bg: "#f7efe8" },
  other: { icon: <EmojiObjects />, bg: "#ebebeb" },
  garbagecollectionproblem: { icon: <DeleteForever />, bg: "#eef1f0" },
  stormwaterdrains: { icon: <Waves />, bg: "#ebf4f9" },
  manholecovermissingrepair: { icon: <HighlightOff />, bg: "#dee0e3" },
  manholerepairing: { icon: <Construction />, bg: "#ebf3e5" },
  deadanimal: { icon: <Pets />, bg: "#f8efe7" },
  brokenbin: { icon: <DeleteForever />, bg: "#faf4f5" },
  opendefecation: { icon: <Wc />, bg: "#f2faf2" },
  violationofcigarettestobacco: { icon: <SmokingRooms />, bg: "#f1e9e3" },
  garbagedumpronroadpond: { icon: <Delete />, bg: "#ece5e3" },
  default: { icon: <EmojiObjects />, bg: "#ededed" },
};

const getVisual = (name) => {
  const key = toKey(name);
  return visualMap[key] || visualMap.default;
};

const getUnique = (arr) => {
  const seen = new Set();
  return arr.filter(item => {
    const k = toKey(item.name || item.CategoryName);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dialogType, setDialogType] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDept, setNewCategoryDept] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    await Promise.all([fetchCategories(), fetchIssues(), fetchDepartments()]);
  }

  async function fetchCategories() {
    const snap = await getDocs(collection(db, "category"));
    const cats = snap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().CategoryName || "",
      department: doc.data().department || "",
      departmentId: doc.data().departmentId || "",
      departmentEmail: doc.data().departmentEmail || "",
      isAdminAdded: !!doc.data().isAdminAdded,
      isUserAdded: !!doc.data().isUserAdded,
    }));
    setCategories(getUnique(cats));
  }
const handleCreateCategory = async () => {
  if (!newCategoryName.trim() || !newCategoryDept.trim()) {
    setSnackbar({ open: true, message: "Please fill all required fields.", severity: "warning" });
    return;
  }
  setLoading(true);
  try {
    await addDoc(collection(db, "category"), {
      CategoryName: newCategoryName.trim(),
      department: newCategoryDept.trim(),
      isAdminAdded: true,
      isUserAdded: false,
    });
    setSnackbar({ open: true, message: "Category created successfully.", severity: "success" });
    setNewCategoryName("");
    setNewCategoryDept("");
    setDialogType("");
    setDialogOpen(false);
    await fetchCategories();
  } catch (err) {
    setSnackbar({ open: true, message: "Failed to create category.", severity: "error" });
  }
  setLoading(false);
};

  async function fetchIssues() {
    const snap = await getDocs(collection(db, "issues"));
    setIssues(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }

  async function fetchDepartments() {
    const snap = await getDocs(collection(db, "departments"));
    setDepartments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }

  const getCount = (catName) =>
    issues.filter((issue) => toKey(issue.category || "") === toKey(catName)).length;

  // Only show categories that are not "other", not admin, not user added in the main grid
  const coreCategories = categories.filter(
    (cat) =>
      !["other", "others"].includes(toKey(cat.name || cat.CategoryName)) &&
      !cat.isAdminAdded &&
      !cat.isUserAdded
  );

  // These are shown in the Others modal
  const othersCategories = categories.filter(
    (cat) => cat.isAdminAdded || cat.isUserAdded
  );

  const handleCategoryClick = (cat) => {
    setCategoryDetails(cat);
    setDialogType("details");
    setDialogOpen(true);
  };

  return (
    <>
      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Top control buttons */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1100, mx: "auto" }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setDialogType("create");
            setDialogOpen(true);
          }}
        >
          Add New Category
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setDialogType("others");
            setDialogOpen(true);
          }}
          sx={{ textTransform: "none" }}
        >
          Other Categories
          <Box component="span" sx={{ ml: 1 }}>
            <EmojiObjects />
          </Box>
        </Button>
      </Box>

      {/* Main core categories grid */}
      <Box sx={{
        maxWidth: 1100,
        mx: "auto",
        p: { xs: 2, md: 5 },
        bgcolor: "#fff",
        borderRadius: 3,
      }}>
        <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: "bold" }}>
          Grievance Categories
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {coreCategories.map((cat) => {
            const name = cat.name || cat.CategoryName || "Unnamed";
            const visual = getVisual(name);
            return (
              <Grid item xs={6} sm={4} md={3} lg={2} key={cat.id} sx={{ display: "flex", justifyContent: "center" }}>
                <Card
                  onClick={() => handleCategoryClick(cat)}
                  sx={{
                    width: 166,
                    height: 173,
                    borderRadius: 3,
                    boxShadow: 2,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f9faf9",
                    "&:hover": { boxShadow: 6, transform: "scale(1.05)" },
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: visual.bg,
                      borderRadius: "50%",
                      width: 60,
                      height: 60,
                      mb: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {visual.icon}
                  </Box>
                  <CardContent sx={{ py: 0, px: 1, textAlign: "center" }}>
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: "600" }}>
                      {name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {`Issues: ${getCount(name)}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Details Dialog */}
      <Dialog open={dialogOpen && dialogType === "details"} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {categoryDetails && (
          <>
            <DialogTitle>{categoryDetails.name || categoryDetails.CategoryName}</DialogTitle>
            <DialogContent dividers>
              <Typography gutterBottom>
                <b>Department:</b> {categoryDetails.department || "N/A"}
              </Typography>
              <Typography gutterBottom>
                <b>Total Issues:</b> {getCount(categoryDetails.name || categoryDetails.CategoryName)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                onClick={() => {
                  if (categoryDetails.departmentId) {
                    navigate(`/dept-dashboard/${categoryDetails.departmentId}`);
                  }
                  setDialogOpen(false);
                }}
              >
                View Department Dashboard
              </Button>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Others - Admin/User Added Categories Modal */}
      <Dialog open={dialogOpen && dialogType === "others"} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Admin/User Added Categories ({othersCategories.length})</DialogTitle>
        <DialogContent>
          {othersCategories.length === 0 ? (
            <Typography sx={{ p: 4, textAlign: "center" }}>
              No Admin/User Added Categories found.
            </Typography>
          ) : (
            <Grid container spacing={2} sx={{ mt: 0, maxHeight: 400, overflowY: "auto" }}>
              {othersCategories.map((cat) => {
                const name = cat.name || cat.CategoryName || "Unnamed";
                const visual = getVisual(name);
                return (
                  <Grid key={cat.id} item xs={6} sm={4} md={3}>
                    <Paper
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 3,
                        boxShadow: 2,
                        position: "relative",
                        border: cat.isAdminAdded ? '2px solid #43a047' : cat.isUserAdded ? '2px solid #1976d2' : '',
                        bgcolor: "#f8fdfa"
                      }}
                    >
                      <Box sx={{
                        bgcolor: visual.bg,
                        borderRadius: "50%",
                        width: 56,
                        height: 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}>
                        {visual.icon}
                      </Box>
                      <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, mb: 0.5 }}>
                        {name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Issues: {getCount(name)}
                      </Typography>
                      {cat.isAdminAdded && (
                        <Tooltip title="Added by Admin">
                          <AdminPanelSettings sx={{
                            position: "absolute",
                            top: 10,
                            right: 12,
                            color: "green"
                          }} />
                        </Tooltip>
                      )}
                      {cat.isUserAdded && (
                        <Tooltip title="Added by User">
                          <Person sx={{
                            position: "absolute",
                            top: 10,
                            right: cat.isAdminAdded ? 36 : 12,
                            color: "blue"
                          }} />
                        </Tooltip>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={dialogOpen && dialogType === "create"} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name"
            fullWidth
            margin="normal"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              value={newCategoryDept}
              onChange={(e) => setNewCategoryDept(e.target.value)}
              label="Department"
            >
              {departments.map((dep) => (
                <MenuItem key={dep.id} value={dep.name}>{dep.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateCategory}
            disabled={!newCategoryName.trim() || !newCategoryDept.trim() || loading}
          >
            {loading ? "Adding..." : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
