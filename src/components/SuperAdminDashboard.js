import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, sendSignInLinkToEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, HeatmapLayer } from '@react-google-maps/api';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import { Container, Tabs, Tab, Box, Typography, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const containerStyle = { width: '100%', height: '400px' };
const center = { lat: 37.7749, lng: -122.4194 }; // San Francisco

// Olive Green Theme
const OliveBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#3C4F2F', // Olive Green
  color: '#FFFFFF',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
}));

const OliveButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#6B8A47',
  color: '#FFFFFF',
  '&:hover': { backgroundColor: '#556B2F' },
}));

const SuperAdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('staff');
  const [newDeptName, setNewDeptName] = useState('');
  const [newRoutingRule, setNewRoutingRule] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) navigate('/');
      else {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'SUPER_ADMIN') {
          signOut(auth);
          navigate('/');
        }
      }
    });

    const fetchData = async () => {
      const issuesSnap = await getDocs(collection(db, 'issues'));
      const usersSnap = await getDocs(collection(db, 'users'));
      const deptsSnap = await getDocs(collection(db, 'departments'));
      setIssues(issuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setDepartments(deptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchData();

    return unsubscribe;
  }, [navigate]);

  // Invite User via Email
  const handleInviteUser = async () => {
    try {
      const actionCodeSettings = {
        url: 'http://localhost:3000', // Update to your app's URL
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, newUserEmail, actionCodeSettings);
      alert(`Invite sent to ${newUserEmail}!`);
      await setDoc(doc(db, 'users', newUserEmail), {
        email: newUserEmail,
        role: newUserRole,
        department: null,
      });
      setNewUserEmail('');
      setNewUserRole('staff');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Add Department
  const handleAddDepartment = async () => {
    try {
      const deptId = `dept_${Date.now()}`;
      await setDoc(doc(db, 'departments', deptId), {
        name: newDeptName,
        routing_rules: newRoutingRule ? [{ category: newRoutingRule, auto_assign: true }] : [],
      });
      setDepartments([...departments, { id: deptId, name: newDeptName, routing_rules: newRoutingRule ? [{ category: newRoutingRule, auto_assign: true }] : [] }]);
      setNewDeptName('');
      setNewRoutingRule('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Delete Department
  const handleDeleteDepartment = async (deptId) => {
    try {
      await deleteDoc(doc(db, 'departments', deptId));
      setDepartments(departments.filter(d => d.id !== deptId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Generate PDF Report
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('City Issues Report', 10, 10);
    issues.forEach((issue, i) => {
      doc.text(`${i + 1}. ${issue.category} - ${issue.status} (${issue.priority})`, 10, 20 + i * 10);
    });
    doc.save('issues_report.pdf');
  };

  // Generate CSV
  const generateCSV = () => {
    const csvData = issues.map(issue => ({
      Category: issue.category,
      Status: issue.status,
      Priority: issue.priority,
      Location: `Lat: ${issue.location.lat}, Lng: ${issue.location.lng}`,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'issues_report.csv';
    a.click();
  };

  // Generate Excel
  const generateExcel = () => {
    const ws = XLSX.utils.json_to_sheet(issues.map(issue => ({
      Category: issue.category,
      Status: issue.status,
      Priority: issue.priority,
      Location: `Lat: ${issue.location.lat}, Lng: ${issue.location.lng}`,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Issues');
    XLSX.writeFile(wb, 'issues_report.xlsx');
  };


  // Stats
  const totalIssues = issues.length;
  const newIssues = issues.filter(i => i.status === 'New').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;

  // Top 5 Categories
  const categories = issues.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const barData = {
    labels: topCategories.map(([cat]) => cat),
    datasets: [{ label: 'Volume', data: topCategories.map(([, count]) => count), backgroundColor: '#6B8A47' }],
  };

  // Resolution Performance (Mock SLA)
  const lineData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{ label: 'SLA %', data: [85, 90, 95, 88], borderColor: '#6B8A47' }],
  };

  // Heatmap Data
//   const heatmapData = issues.map(i => new window.google.maps.LatLng(i.location.lat, i.location.lng));


  // Add this inside your component
const [heatmapData, setHeatmapData] = useState([]);

useEffect(() => {
  if (window.google && issues.length > 0) {
    const data = issues.map(i => new window.google.maps.LatLng(i.location.lat, i.location.lng));
    setHeatmapData(data);
  }
}, [issues]);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <OliveBox>
        <Typography variant="h4">Super Admin Dashboard</Typography>
        <OliveButton onClick={() => signOut(auth).then(() => navigate('/'))}>Logout</OliveButton>
      </OliveBox>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ backgroundColor: '#3C4F2F', color: '#FFFFFF' }}>
        <Tab label="Dashboard" />
        <Tab label="Departments" />
        <Tab label="Users" />
        <Tab label="Reports" />
      </Tabs>

      {tabValue === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <OliveBox>
            <Typography variant="h5">Total Issues</Typography>
            <Typography>New: {newIssues} | In Progress: {inProgress} | Resolved: {resolved}</Typography>
          </OliveBox>
          <OliveBox>
            <Typography variant="h5">City Hotspots</Typography>
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={['visualization']}>
              <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
                <HeatmapLayer data={heatmapData} options={{ radius: 20 }} />
              </GoogleMap>
            </LoadScript>
          </OliveBox>
          <OliveBox>
            <Typography variant="h5">Top 5 Categories by Volume</Typography>
            <Bar data={barData} options={{ responsive: true }} />
          </OliveBox>
          <OliveBox>
            <Typography variant="h5">Resolution Performance (SLA %)</Typography>
            <Line data={lineData} options={{ responsive: true }} />
          </OliveBox>
        </motion.div>
      )}

      {tabValue === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <OliveBox>
            <Typography variant="h5">Departments</Typography>
            <TextField
              label="Department Name"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              sx={{ marginRight: 2 }}
            />
            <TextField
              label="Routing Rule (Category)"
              value={newRoutingRule}
              onChange={(e) => setNewRoutingRule(e.target.value)}
            />
            <OliveButton onClick={handleAddDepartment}>Add Department</OliveButton>
            <Table component={Paper}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Routing Rules</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map(dept => (
                  <TableRow key={dept.id}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.routing_rules.map(r => r.category).join(', ')}</TableCell>
                    <TableCell>
                      <OliveButton onClick={() => handleDeleteDepartment(dept.id)}>Delete</OliveButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </OliveBox>
        </motion.div>
      )}

      {tabValue === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <OliveBox>
            <Typography variant="h5">Users</Typography>
            <TextField
              label="Invite Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              sx={{ marginRight: 2 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="dept_head">Department Head</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <OliveButton onClick={handleInviteUser}>Invite User</OliveButton>
            <Table component={Paper}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.department || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </OliveBox>
        </motion.div>
      )}

      {tabValue === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <OliveBox>
            <Typography variant="h5">Reports</Typography>
            <OliveButton onClick={generatePDF}>Download PDF Report</OliveButton>
            <OliveButton onClick={generateCSV}>Export CSV</OliveButton>
            <OliveButton onClick={generateExcel}>Export Excel</OliveButton>
          </OliveBox>
        </motion.div>
      )}
    </Container>
  );
};

export default SuperAdminDashboard;