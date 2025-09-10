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
import DomainIcon from "@mui/icons-material/Domain";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import WbIncandescentIcon from "@mui/icons-material/WbIncandescent";
import WcIcon from "@mui/icons-material/Wc";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import AirIcon from "@mui/icons-material/Air";
import PetsIcon from "@mui/icons-material/Pets";
import BugReportIcon from "@mui/icons-material/BugReport";
import OpacityIcon from "@mui/icons-material/Opacity";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import NatureIcon from "@mui/icons-material/Nature";
import PlumbingIcon from "@mui/icons-material/Plumbing";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import ParkIcon from "@mui/icons-material/Park";
import InvertColorsIcon from "@mui/icons-material/InvertColors";
import ConstructionIcon from "@mui/icons-material/Construction";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SmokeFreeIcon from "@mui/icons-material/SmokeFree";
import RecyclingIcon from "@mui/icons-material/Recycling";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import Add from "@mui/icons-material/Add";
import EmojiObjects from "@mui/icons-material/EmojiObjects";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import Person from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import CategoryIcon from "@mui/icons-material/Category"; // Use as replacement for HelpOutlineIcon


const toKey = (s) =>
  (s || "").replace(/[\s&]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

const OLIVE = "#3b5b27";
const OLIVE_LIGHT = "#6b8e47";
const OLIVE_BG = "#f5f7f5";
const ADMIN_BG = "#e6f2e6"; // Light green for admin
const USER_BG = "#e6eaf7"; 
// Define in constants
const ADMIN_CARD_BG = "#e6f7e6";  // light green
const ADMIN_ICON_BG = "#2e7d32";  // dark green
const USER_CARD_BG = "#e6f0ff";   // light blue
const USER_ICON_BG = "#1565c0";   // dark blue
 // Light blue for user

// Unique, relevant icons for each category
const masterIconMap = {
  illegalencroachment: DomainIcon,
  pothole: DirectionsCarIcon,
  noiseproblem: VolumeUpIcon,
  streetlight: WbIncandescentIcon,
  publictoilet: WcIcon,
  garbage: DeleteForeverIcon,
  illegalvehicleparking: LocalParkingIcon,
  openurination: AirIcon,
  streetdogs: PetsIcon,
  mosquitomenace: BugReportIcon,
  waterstagnation: OpacityIcon,
  roadcleaningproblem: CleaningServicesIcon,
  treefallen: NatureIcon,
  cloggeddrainage: PlumbingIcon,
  burninggarbage: WhatshotIcon,
  other: CategoryIcon, // Changed from HelpOutlineIcon to CategoryIcon
  garbagecollectionproblem: RestoreFromTrashIcon,
  litteringpark: ParkIcon,
  stormwaterdrains: InvertColorsIcon,
  manholecovermissingrepair: ConstructionIcon,
  manholerepairing: BuildCircleIcon,
  deadanimal: ReportProblemIcon,
  brokenbin: DeleteSweepIcon,
  opendefecation: SentimentVeryDissatisfiedIcon,
  garbagedumpronroadpond: RecyclingIcon,
  recycling: RecyclingIcon,
  default: CategoryIcon, // Changed from HelpOutlineIcon to CategoryIcon
};

const getVisual = (name, isAdminAdded, isUserAdded) => {
  const key = toKey(name);
  let IconComponent = masterIconMap[key] || masterIconMap.default;
  let icon = IconComponent ? <IconComponent sx={{ color: OLIVE, fontSize: 36 }} /> : null;
  // Set background color for admin/user
  let bg = "#ededed";
  if (isAdminAdded) {
    bg = ADMIN_BG;
  } else if (isUserAdded) {
    bg = USER_BG;
  }
  return { icon, bg };
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
      <Box className="category-controls" sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1100, mx: "auto" }}>
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
      <Box className="category-container" sx={{
        maxWidth: 1400, // Increased from 1100 to 1400
        mx: "auto",
        p: { xs: 3, md: 7 }, // Increased padding
        bgcolor: "#fff",
        borderRadius: 3,
      }}>
        <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: "bold", fontSize: "2rem" }}>
          Grievance Categories
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {coreCategories.map((cat) => {
            const name = cat.name || cat.CategoryName || "Unnamed";
            const visual = getVisual(name, cat.isAdminAdded, cat.isUserAdded);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={cat.id} sx={{ display: "flex", justifyContent: "center" }}>
                <Card
                  className={`category-card cat-${toKey(name)}`}
                  onClick={() => handleCategoryClick(cat)}
                  sx={{
                    width: 240, // Increased from 166 to 240
                    height: 240, // Increased from 173 to 240
                    borderRadius: 4,
                    boxShadow: 3,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f9faf9",
                    border: `2px solid ${OLIVE_BG}`,
                    "&:hover": { boxShadow: 8, transform: "scale(1.08)", borderColor: OLIVE_LIGHT },
                  }}
                >
                  <Box
                    className={`category-card__icon icon-${toKey(name)}`}
                    sx={{
                      backgroundColor: visual.bg,
                      borderRadius: "50%",
                      width: 90, // Increased from 60 to 90
                      height: 90, // Increased from 60 to 90
                      mb: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: "0 2px 12px #8BA47322",
                    }}
                  >
                    {visual.icon}
                  </Box>
                  <CardContent sx={{ py: 0, px: 1, textAlign: "center" }}>
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: "700", color: OLIVE, fontSize: "1.2rem" }}>
                      {name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "1rem" }}>
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
      <Dialog className="category-dialog" open={dialogOpen && dialogType === "details"} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
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
                sx={{ bgcolor: OLIVE, color: "#fff", "&:hover": { bgcolor: OLIVE_LIGHT } }}
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
      <Dialog
        className="others-dialog"
        open={dialogOpen && dialogType === "others"}
        onClose={() => setDialogOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "70vw", // Reduce from 85vw to 70vw
            maxWidth: "70vw",
            maxHeight: "92vh",
            borderRadius: 3,
            p: 0,
            m: 0,
            overflow: "hidden",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            bgcolor: OLIVE_BG,
            position: "relative",
            height: "100%",
            minHeight: 400,
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Sticky Headings */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              bgcolor: OLIVE_BG,
              borderBottom: "1px solid #dbe4d0",
              px: 3,
              pt: 2,
              pb: 1,
            }}
          >
            <Typography variant="h6" sx={{ color: OLIVE, fontWeight: 700 }}>
              Admin Added Categories ({othersCategories.filter(cat => cat.isAdminAdded).length})
              &nbsp; | &nbsp;
              User Added Categories ({othersCategories.filter(cat => cat.isUserAdded).length})
            </Typography>
          </Box>
          {/* Scrollable Cards Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              px: 2,
              py: 2,
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-thumb": { background: "#b7cbb1", borderRadius: "8px" },
              "&::-webkit-scrollbar-track": { background: "#f5f7f5" },
            }}
          >
{othersCategories.filter(cat => cat.isAdminAdded).length > 0 && (
  <>
    <Typography
      variant="subtitle1"
      sx={{
        fontWeight: 700,
        color: OLIVE,
        mt: 2,
        mb: 1,
        position: "sticky",
        top: 48,
        zIndex: 1,
        bgcolor: OLIVE_BG,
      }}
    >
      Admin Created Categories
    </Typography>
    <Grid container spacing={2} sx={{ pt: 5 }}>
      {othersCategories.filter(cat => cat.isAdminAdded).map((cat) => {
        const name = cat.name || cat.CategoryName || "Unnamed";
        const isAdmin = !!cat.isAdminAdded;
        const isUser = !!cat.isUserAdded && !isAdmin;
        const cardBg = isAdmin ? ADMIN_CARD_BG : USER_CARD_BG;
        const iconBg = isAdmin ? ADMIN_ICON_BG : USER_ICON_BG;
        const visual = getVisual(name, isAdmin, isUser);
        return (
          <Grid key={cat.id} item xs={12} sm={6} md={3} lg={2}>
            <Paper
              className={`others-card cat-${toKey(name)}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                p: 2,
                borderRadius: 3,
                boxShadow: 2,
                width: 160,
                minHeight: 150,
                border: `2px solid ${isAdmin ? OLIVE : OLIVE_LIGHT}`,
                bgcolor: cardBg,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 4,
                  borderColor: OLIVE_LIGHT,
                },
                mx: "auto",
              }}
            >
              <Box
                sx={{
                  bgcolor: iconBg,
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                  boxShadow: "0 2px 7px #8BA47322",
                }}
                className={`category-card__icon icon-${toKey(name)}`}
              >
                {visual.icon}
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  color: OLIVE,
                  wordBreak: "break-word",
                  textAlign: "center",
                  fontSize: "1rem",
                  maxWidth: "100%",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                Issues: {getCount(name)}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  </>
)}


    <Grid container spacing={2}>
                      {othersCategories.filter(cat => cat.isAdminAdded).map((cat) => {
                        const name = cat.name || cat.CategoryName || "Unnamed";
                        const isAdmin = !!cat.isAdminAdded;
                        const isUser = !!cat.isUserAdded && !isAdmin;
                        const cardBg = isAdmin ? ADMIN_CARD_BG : USER_CARD_BG;
                        const iconBg = isAdmin ? ADMIN_ICON_BG : USER_ICON_BG;
                        const visual = getVisual(name, isAdmin, isUser);
                        return (
                          <Grid key={cat.id} item xs={12} sm={6} md={3} lg={2}>
                            <Paper
                              className={`others-card cat-${toKey(name)}`}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                p: 2,
                                borderRadius: 3,
                                boxShadow: 2,
                                width: 160,
                                minHeight: 150,
                                border: `2px solid ${isAdmin ? OLIVE : OLIVE_LIGHT}`,
                                bgcolor: cardBg,
                                transition: "transform 0.2s, box-shadow 0.2s",
                                cursor: "pointer",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                  boxShadow: 4,
                                  borderColor: OLIVE_LIGHT,
                                },
                                mx: "auto",
                              }}
                            >
                              <Box
                                sx={{
                                  bgcolor: iconBg,
                                  borderRadius: "50%",
                                  width: 48,
                                  height: 48,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mb: 1.5,
                                  boxShadow: "0 2px 7px #8BA47322",
                                }}
                                className={`category-card__icon icon-${toKey(name)}`}
                              >
                                {visual.icon}
                              </Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  mb: 0.5,
                                  color: OLIVE,
                                  wordBreak: "break-word",
                                  textAlign: "center",
                                  fontSize: "1rem",
                                  maxWidth: "100%",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                                Issues: {getCount(name)}
                              </Typography>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
            
            
                {/* User Added Categories */}
                {othersCategories.filter(cat => cat.isUserAdded).length > 0 && (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: OLIVE,
                        mt: 3,
                        mb: 1,
                        position: "sticky",
                        top: 48,
                        zIndex: 1,
                        bgcolor: OLIVE_BG,
                      }}
                    >
                      User Created Categories
                    </Typography>
                    <Grid container spacing={2}>
                      {othersCategories.filter(cat => cat.isUserAdded && !cat.isAdminAdded).map((cat) => {
                        const name = cat.name || cat.CategoryName || "Unnamed";
                        const isAdmin = !!cat.isAdminAdded;
                        const isUser = !!cat.isUserAdded && !isAdmin;
                        const cardBg = isAdmin ? ADMIN_CARD_BG : USER_CARD_BG;
                        const iconBg = isAdmin ? ADMIN_ICON_BG : USER_ICON_BG;
                        const visual = getVisual(name, isAdmin, isUser);
                        return (
                          <Grid key={cat.id} item xs={12} sm={6} md={3} lg={2}>
                            <Paper
                              className={`others-card cat-${toKey(name)}`}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                p: 2,
                                borderRadius: 3,
                                boxShadow: 2,
                                width: 160,
                                minHeight: 150,
                                border: `2px solid ${OLIVE_LIGHT}`,
                                bgcolor: cardBg,
                                transition: "transform 0.2s, box-shadow 0.2s",
                                cursor: "pointer",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                  boxShadow: 4,
                                  borderColor: OLIVE,
                                },
                                mx: "auto",
                              }}
                            >
                              <Box
                                sx={{
                                  bgcolor: iconBg,
                                  borderRadius: "50%",
                                  width: 48,
                                  height: 48,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mb: 1.5,
                                  boxShadow: "0 2px 7px #8BA47322",
                                }}
                                className={`category-card__icon icon-${toKey(name)}`}
                              >
                                {visual.icon}
                              </Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  mb: 0.5,
                                  color: OLIVE,
                                  wordBreak: "break-word",
                                  textAlign: "center",
                                  fontSize: "1rem",
                                  maxWidth: "100%",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                                Issues: {getCount(name)}
                              </Typography>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </>
                )}
            
          
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: OLIVE_BG }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            sx={{ bgcolor: OLIVE, color: "#fff", "&:hover": { bgcolor: OLIVE_LIGHT } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog className="create-dialog" open={dialogOpen && dialogType === "create"} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
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
