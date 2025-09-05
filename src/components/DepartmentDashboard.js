// import React, { useEffect, useState } from "react";
// import { db } from "../firebase";
// import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
// import { useNavigate } from "react-router-dom";
// import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Button,
//   Grid,
// } from "@mui/material";
// import {
//   ChartPieIcon,
//   ClipboardDocumentListIcon,
//   Cog6ToothIcon,
// } from "@heroicons/react/24/outline";
// import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
// import { seedHealthcareIssues } from "../utils/seedIssues";

// const C = {
//   olive: "#3b5d3a",
//   oliveDark: "#2e472d",
//   oliveLight: "#486a3e",
//   textLight: "#ffffff",
//   bg: "#f5f7f5",
//   accent: "#6B8A47",
// };

// export default function DepartmentDashboard() {
//   const [issues, setIssues] = useState([]);
//   const [dept, setDept] = useState(null);
//   const [tab, setTab] = useState("issues");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const stored = localStorage.getItem("department");
//     if (!stored) {
//       navigate("/dept-login");
//       return;
//     }
//     const deptData = JSON.parse(stored);
//     setDept(deptData);

//     const fetchIssues = async () => {
//       try {
//         const q = query(
//           collection(db, "issues"),
//           where("departmentId", "==", deptData.id)
//         );
//         const querySnapshot = await getDocs(q);
//         const deptIssues = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         if (deptIssues.length === 0) {
//           await seedHealthcareIssues(db, deptData.id);
//           const seededSnapshot = await getDocs(q);
//           setIssues(
//             seededSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
//           );
//         } else {
//           setIssues(deptIssues);
//         }
//       } catch (err) {
//         console.error("Error fetching issues:", err);
//       }
//     };

//     fetchIssues();
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("department");
//     navigate("/dept-login");
//   };

//   if (!dept) return null;

//   // -------- Reports Data ------------
//   const total = issues.length;
//   const resolved = issues.filter((i) => i.status === "Resolved").length;
//   const inProgress = issues.filter((i) => i.status === "In Progress").length;
//   const pending = issues.filter((i) => i.status === "Verified").length;
//   const highPriority = issues.filter((i) => i.priority === "High").length;

//   const pieData = [
//     { name: "Verified", value: pending },
//     { name: "In Progress", value: inProgress },
//     { name: "Resolved", value: resolved },
//   ];
//   const COLORS = ["#FFBB28", "#0088FE", "#00C49F"];

//   return (
//     <Box sx={{ height: "100vh", display: "flex", bgcolor: C.bg }}>
//       {/* Sidebar */}
//       <Box
//         component="nav"
//         sx={{
//           background: C.olive,
//           minWidth: 220,
//           color: C.textLight,
//           height: "100%",
//           overflowY: "auto",
//         }}
//       >
//         <Box
//           sx={{
//             fontWeight: 800,
//             p: "22px 32px",
//             fontSize: 20,
//           }}
//         >
//           {dept.name}
//         </Box>
//         <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
//           <Box
//             component="li"
//             onClick={() => setTab("issues")}
//             sx={{
//               p: "13px 32px",
//               cursor: "pointer",
//               bgcolor: tab === "issues" ? C.oliveDark : "transparent",
//               display: "flex",
//               alignItems: "center",
//               gap: 1.5,
//               "&:hover": { bgcolor: C.oliveLight },
//             }}
//           >
//             <ClipboardDocumentListIcon style={{ width: 20 }} /> Issues
//           </Box>
//           <Box
//             component="li"
//             onClick={() => setTab("reports")}
//             sx={{
//               p: "13px 32px",
//               cursor: "pointer",
//               bgcolor: tab === "reports" ? C.oliveDark : "transparent",
//               display: "flex",
//               alignItems: "center",
//               gap: 1.5,
//               "&:hover": { bgcolor: C.oliveLight },
//             }}
//           >
//             <ChartPieIcon style={{ width: 20 }} /> Reports
//           </Box>
//           <Box
//             component="li"
//             onClick={() => setTab("settings")}
//             sx={{
//               p: "13px 32px",
//               cursor: "pointer",
//               bgcolor: tab === "settings" ? C.oliveDark : "transparent",
//               display: "flex",
//               alignItems: "center",
//               gap: 1.5,
//               "&:hover": { bgcolor: C.oliveLight },
//             }}
//           >
//             <Cog6ToothIcon style={{ width: 20 }} /> Settings
//           </Box>
//         </Box>
//       </Box>

//       {/* Content */}
//       <Box sx={{ flex: 1, p: 4, overflowY: "auto" }}>
//         {/* Header */}
//         <Box
//           display="flex"
//           justifyContent="space-between"
//           alignItems="center"
//           mb={3}
//         >
//           <Typography variant="h4">
//             {dept.name} {tab.charAt(0).toUpperCase() + tab.slice(1)}
//           </Typography>
//           <Button variant="contained" color="error" onClick={handleLogout}>
//             Logout
//           </Button>
//         </Box>

//         {/* Sort button */}
//         {tab === "issues" && (
//           <Box display="flex" justifyContent="flex-end" mb={2}>
//             <Button
//               variant="contained"
//               sx={{ bgcolor: C.accent, "&:hover": { bgcolor: C.oliveDark } }}
//               onClick={() => {
//                 const priorityOrder = { High: 3, Medium: 2, Low: 1 };
//                 setIssues((prev) =>
//                   [...prev].sort(
//                     (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
//                   )
//                 );
//               }}
//             >
//               Sort by Priority
//             </Button>
//           </Box>
//         )}

//         {/* ISSUES TAB */}
//         {tab === "issues" && (
//           <Paper>
//             <Table>
//               <TableHead>
//                 <TableRow sx={{ bgcolor: C.oliveLight }}>
//                   <TableCell sx={{ color: "white" }}>Issue ID</TableCell>
//                   <TableCell sx={{ color: "white" }}>Category</TableCell>
//                   <TableCell sx={{ color: "white" }}>Description</TableCell>
//                   <TableCell sx={{ color: "white" }}>Status</TableCell>
//                   <TableCell sx={{ color: "white" }}>Priority</TableCell>
//                   <TableCell sx={{ color: "white" }}>Location</TableCell>
//                   <TableCell sx={{ color: "white" }}>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {issues.length > 0 ? (
//                   issues.map((issue) => (
//                     <TableRow key={issue.id}>
//                       <TableCell>{issue.id}</TableCell>
//                       <TableCell>{issue.category}</TableCell>
//                       <TableCell>{issue.description}</TableCell>
//                       <TableCell>{issue.status}</TableCell>
//                       <TableCell>{issue.priority}</TableCell>
//                       <TableCell>
//                         Lat: {issue.location?.lat}, Lng: {issue.location?.lng}
//                       </TableCell>
//                       <TableCell>
//                         <select
//                           value={issue.status}
//                           onChange={async (e) => {
//                             const newStatus = e.target.value;
//                             try {
//                               await updateDoc(doc(db, "issues", issue.id), {
//                                 status: newStatus,
//                               });
//                               setIssues((prev) =>
//                                 prev.map((i) =>
//                                   i.id === issue.id ? { ...i, status: newStatus } : i
//                                 )
//                               );
//                             } catch (err) {
//                               console.error("Error updating status:", err);
//                             }
//                           }}
//                         >
//                           <option value="Verified">Verified</option>
//                           <option value="In Progress">In Progress</option>
//                           <option value="Resolved">Resolved</option>
//                         </select>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7} align="center">
//                       No issues found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </Paper>
//         )}

//         {/* REPORTS TAB */}
//         {tab === "reports" && (
//           <Box>
//             <Grid container spacing={2} mb={4}>
//               {[
//                 { label: "Total", value: total },
//                 { label: "Resolved", value: resolved },
//                 { label: "In Progress", value: inProgress },
//                 { label: "Verified", value: pending },
//                 { label: "High Priority", value: highPriority },
//               ].map((stat, i) => (
//                 <Grid item xs={12} sm={6} md={2} key={i}>
//                   <Paper
//                     sx={{
//                       p: 2,
//                       textAlign: "center",
//                       bgcolor: i % 2 === 0 ? C.oliveLight : "white",
//                       color: i % 2 === 0 ? "white" : "black",
//                     }}
//                   >
//                     <Typography variant="h6">{stat.label}</Typography>
//                     <Typography variant="h5">{stat.value}</Typography>
//                   </Paper>
//                 </Grid>
//               ))}
//             </Grid>

//             <Paper sx={{ p: 3 }}>
//               <Typography variant="h6" mb={2}>
//                 Issues by Status
//               </Typography>
//               <PieChart width={400} height={300}>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={100}
//                   fill="#8884d8"
//                   dataKey="value"
//                   label
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </Paper>
//           </Box>
//         )}

//         {/* SETTINGS TAB */}
//         {tab === "settings" && (
//           <Paper sx={{ p: 4 }}>
//             <Typography variant="h6">Settings Placeholder</Typography>
//             <Typography variant="body2">
//               Department-level settings can go here (e.g., change password).
//             </Typography>
//           </Paper>
//         )}
//       </Box>
//     </Box>
//   );
// }

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { seedHealthcareIssues } from "../utils/seedIssues";

const C = {
  olive: "#3b5d3a",
  oliveDark: "#2e472d",
  oliveLight: "#486a3e",
  textLight: "#ffffff",
  bg: "#f5f7f5",
  accent: "#6B8A47",
};

const texts = {
  en: {
    departmentName: "Department of Health, Medical Education & Family Welfare",
    issueSuffix: "Issues",
    reports: "Reports",
    issues: "Issues",
    settings: "Settings",
    total: "Total",
    resolved: "Resolved",
    inProgress: "In Progress",
    verified: "Verified",
    highPriority: "High Priority",
    logout: "LOGOUT",
    category: "Category",
    description: "Description",
    status: "Status",
    priority: "Priority",
    location: "Location",
    actions: "Actions",
    issuesByStatus: "Issues by Status",
    sortByPriority: "SORT BY PRIORITY",
    hindi: "हिन्दी",
    english: "ENGLISH",
  },
  hi: {
    departmentName: "स्वास्थ्य, चिकित्सा शिक्षा और परिवार कल्याण विभाग",
    issueSuffix: "मुद्दे",
    reports: "रिपोर्ट",
    issues: "मुद्दे",
    settings: "सेटिंग्स",
    total: "कुल",
    resolved: "समाधान हो गया",
    inProgress: "प्रगति पर",
    verified: "सत्यापित",
    highPriority: "उच्च प्राथमिकता",
    logout: "लॉग आउट",
    category: "श्रेणी",
    description: "विवरण",
    status: "स्थिति",
    priority: "प्राथमिकता",
    location: "स्थान",
    actions: "कार्य",
    issuesByStatus: "स्थिति के अनुसार मुद्दे",
    sortByPriority: "प्राथमिकता से छाँटें",
    hindi: "हिन्दी",
    english: "ENGLISH",
  },
};

export default function DepartmentDashboard() {
  const [issues, setIssues] = useState([]);
  const [dept, setDept] = useState(null);
  const [tab, setTab] = useState("issues");
  const [locale, setLocale] = useState("en");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("department");
    if (!stored) {
      navigate("/dept-login");
      return;
    }
    const deptData = JSON.parse(stored);
    setDept(deptData);

    const fetchIssues = async () => {
      try {
        const q = query(
          collection(db, "issues"),
          where("departmentId", "==", deptData.id)
        );
        const querySnapshot = await getDocs(q);
        const deptIssues = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (deptIssues.length === 0) {
          await seedHealthcareIssues(db, deptData.id);
          const seededSnapshot = await getDocs(q);
          setIssues(
            seededSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        } else {
          setIssues(deptIssues);
        }
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    };

    fetchIssues();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("department");
    navigate("/dept-login");
  };

  if (!dept) return null;

  // Reports logic
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === texts.en.resolved).length;
  const inProgress = issues.filter((i) => i.status === texts.en.inProgress).length;
  const pending = issues.filter((i) => i.status === texts.en.verified).length;
  const highPriority = issues.filter((i) => i.priority === "High").length;

  const pieData = [
    { name: texts[locale].verified, value: pending },
    { name: texts[locale].inProgress, value: inProgress },
    { name: texts[locale].resolved, value: resolved },
  ];
  const COLORS = ["#FFBB28", "#0088FE", "#00C49F"];

  return (
    <Box sx={{ height: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          background: C.olive,
          minWidth: 380,
          color: C.textLight,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            fontWeight: 800,
            p: "20px 32px 10px 32px",
            fontSize: 25,
            background: C.olive,
          }}
        >
          Department Dashboard
        </Box>
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
          <Box
            component="li"
            onClick={() => setTab("issues")}
            sx={{
              p: "13px 32px",
              cursor: "pointer",
              bgcolor: tab === "issues" ? C.oliveDark : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: 19,
              "&:hover": { bgcolor: C.oliveLight },
            }}
          >
            <ClipboardDocumentListIcon style={{ width: 22 }} /> {texts[locale].issues}
          </Box>
          <Box
            component="li"
            onClick={() => setTab("reports")}
            sx={{
              p: "13px 32px",
              cursor: "pointer",
              bgcolor: tab === "reports" ? C.oliveDark : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: 19,
              "&:hover": { bgcolor: C.oliveLight },
            }}
          >
            <ChartPieIcon style={{ width: 22 }} /> {texts[locale].reports}
          </Box>
          <Box
            component="li"
            onClick={() => setTab("settings")}
            sx={{
              p: "13px 32px",
              cursor: "pointer",
              bgcolor: tab === "settings" ? C.oliveDark : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: 19,
              "&:hover": { bgcolor: C.oliveLight },
            }}
          >
            <Cog6ToothIcon style={{ width: 22 }} /> {texts[locale].settings}
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          minHeight: "100vh",
          bgcolor: C.bg,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Olive Bar on Top */}
        <Box
          sx={{
            width: "100%",
            bgcolor: C.olive,
            color: "#fff",
            height: "68px",
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            px: 5,
            py: 1,
            fontWeight: 700,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", letterSpacing: ".5px" }}
          >
            {texts[locale].departmentName}
            {tab === "issues" && " " + texts[locale].issueSuffix}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: C.oliveLight,
                color: "white",
                fontWeight: 600,
                minWidth: 80,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { bgcolor: C.accent },
              }}
              onClick={() => setLocale(locale === "en" ? "hi" : "en")}
            >
              {locale === "en" ? texts["en"].hindi : texts["hi"].english}
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: C.oliveLight,
                color: "white",
                fontWeight: 600,
                minWidth: 100,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { bgcolor: C.accent },
              }}
              onClick={handleLogout}
            >
              {texts[locale].logout}
            </Button>
          </Box>
        </Box>

        <Box sx={{ flex: 1, p: 4, overflowY: "auto" }}>
          {/* Sort button */}
          {tab === "issues" && (
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: C.accent,
                  fontWeight: 700,
                  color: "#fff",
                  borderRadius: 2,
                  minWidth: 180,
                  boxShadow: "none",
                  "&:hover": { bgcolor: C.oliveDark },
                }}
                onClick={() => {
                  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                  setIssues((prev) =>
                    [...prev].sort(
                      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
                    )
                  );
                }}
              >
                {texts[locale].sortByPriority}
              </Button>
            </Box>
          )}

          {/* ISSUES TAB */}
          {tab === "issues" && (
            <Paper sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: C.oliveLight }}>
                    {/* Removed Issue ID header */}
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      {texts[locale].category}
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      {texts[locale].description}
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      {texts[locale].status}
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      {texts[locale].priority}
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      {texts[locale].location}
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      {texts[locale].actions}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.length > 0 ? (
                    issues.map((issue) => (
                      <TableRow key={issue.id}>
                        {/* Removed Issue ID cell */}
                        <TableCell>{issue.category}</TableCell>
                        <TableCell>{issue.description}</TableCell>
                        <TableCell>{issue.status}</TableCell>
                        <TableCell>{issue.priority}</TableCell>
                        <TableCell>
                          Lat: {issue.location?.lat}, Lng: {issue.location?.lng}
                        </TableCell>
                        <TableCell>
                          <select
                            value={issue.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                await updateDoc(doc(db, "issues", issue.id), {
                                  status: newStatus,
                                });
                                setIssues((prev) =>
                                  prev.map((i) =>
                                    i.id === issue.id ? { ...i, status: newStatus } : i
                                  )
                                );
                              } catch (err) {
                                console.error("Error updating status:", err);
                              }
                            }}
                          >
                            <option value={texts["en"].verified}>
                              {texts[locale].verified}
                            </option>
                            <option value={texts["en"].inProgress}>
                              {texts[locale].inProgress}
                            </option>
                            <option value={texts["en"].resolved}>
                              {texts[locale].resolved}
                            </option>
                          </select>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No issues found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          )}

          {/* REPORTS TAB */}
          {tab === "reports" && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 4,
                  mt: 1,
                }}
              >
                {[
                  { label: texts[locale].total, value: total, filled: true },
                  { label: texts[locale].resolved, value: resolved },
                  { label: texts[locale].inProgress, value: inProgress, filled: true },
                  { label: texts[locale].verified, value: pending },
                  { label: texts[locale].highPriority, value: highPriority, filled: true },
                ].map((stat, i) => (
                  <Paper
                    key={i}
                    elevation={3}
                    sx={{
                      width: 150,
                      height: 120,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      bgcolor: stat.filled ? C.olive : "#fff",
                      color: stat.filled ? "#fff" : "#212121",
                      fontWeight: 500,
                      fontSize: 16,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5">{stat.value}</Typography>
                  </Paper>
                ))}
              </Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>
                  {texts[locale].issuesByStatus}
                </Typography>
                <PieChart width={400} height={300}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </Paper>
            </Box>
          )}

          {/* SETTINGS TAB */}
          {tab === "settings" && (
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6">{texts[locale].settings}</Typography>
              <Typography variant="body2">{/* Add content for settings here */}</Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
