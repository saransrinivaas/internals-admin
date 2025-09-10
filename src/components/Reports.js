import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";


const OliveButton = styled(Button)({
  backgroundColor: "#6B8E47",
  color: "white",
  padding: "12px 24px",
  marginLeft: 8,
  "&:hover": {
    backgroundColor: "#557a31",
  },
});

const TABLE_HEADERS = [
  "Category",
  "Description",
  "Status",
  "Priority",
  "Location",
  "Department",
  "User Name",
  "User Email",
  "Staff Name",
  "Staff Email",
];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [issuesSnap, usersSnap, departmentsSnap, staffSnap] = await Promise.all([
          getDocs(collection(db, "issues")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "departments")),
          getDocs(collection(db, "staff")),
        ]);

        const issues = issuesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const users = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const departments = departmentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const staffs = staffSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const getUser = (userId) => users.find((u) => u.id === userId || u.userId === userId) || {};
        const getDepartment = (deptId) =>
          departments.find(
            (d) =>
              d.id === deptId ||
              d.departmentId === deptId ||
              d.name === deptId ||
              d.DepartmentName === deptId
          ) || {};
        const getStaff = (staffId) =>
          staffs.find((s) => s.id === staffId || s.staffId === staffId || s.email === staffId) || {};

        const mergedData = issues.map((item) => {
          const user = getUser(item.userId);
          const dept = getDepartment(item.departmentId || item.department);
          const staff = getStaff(item.assignedStaffId);

          return {
            Category: item.category || "",
            Description: item.description || "",
            Status: item.status || "",
            Priority: item.priority || "",
            Location: item.location
              ? `Lat: ${item.location.lat}, Lng: ${item.location.lng}`
              : "",
            Department: dept.name || dept.DepartmentName || "N/A",
            UserName: user.name || user.displayName || "N/A",
            UserEmail: user.email || "N/A",
            StaffName: staff.name || "N/A",
            StaffEmail: staff.email || "N/A",
          };
        });

        setData(mergedData);
      } catch (err) {
        console.error("Error fetching report data: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Use jspdf-autotable for nicely formatted pdf table
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Full Issue Report", 10, 14);
    doc.setFontSize(10);

    const tableColumn = TABLE_HEADERS;
    const tableRows = [];

    data.forEach((row) => {
      const rowData = [
        row.Category,
        row.Description,
        row.Status,
        row.Priority,
        row.Location,
        row.Department,
        row.UserName,
        row.UserEmail,
        row.StaffName,
        row.StaffEmail,
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      startY: 20,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [107, 142, 71] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 10, left: 10, right: 10, bottom: 10 },
    });

    doc.save("full_issues_report.pdf");
  };

  const generateCSV = () => {
    if (data.length === 0) return;
    const csvHeaders = Object.keys(data[0]).join(",");
    const csvRows = data
      .map((row) =>
        Object.values(row)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const csvContent = `${csvHeaders}\n${csvRows}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "full_issues_report.csv");
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const generateExcel = () => {
    if (data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Full Issue Report");
    XLSX.writeFile(workbook, "full_issues_report.xlsx");
  };

  return (
    <Box className="reports-page" sx={{ maxWidth: 1050, marginX: "auto", marginTop: 6, paddingX: 2 }}>
      <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: "bold", textAlign: "center" }}>
        Full Report
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", marginBottom: 3 }}>
        <OliveButton onClick={generatePDF}>Download PDF</OliveButton>
        <OliveButton onClick={generateCSV}>Export CSV</OliveButton>
        <OliveButton onClick={generateExcel}>Export Excel</OliveButton>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="reports-table">
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#6B8E47" }}>
                {TABLE_HEADERS.map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      backgroundColor: "#6B8E47",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: 16,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={TABLE_HEADERS.length} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.Category}</TableCell>
                    <TableCell>{row.Description}</TableCell>
                    <TableCell>{row.Status}</TableCell>
                    <TableCell>{row.Priority}</TableCell>
                    <TableCell>{row.Location}</TableCell>
                    <TableCell>{row.Department}</TableCell>
                    <TableCell>{row.UserName}</TableCell>
                    <TableCell sx={{ maxWidth: 190, wordWrap: "break-word" }}>{row.UserEmail}</TableCell>
                    <TableCell>{row.StaffName}</TableCell>
                    <TableCell sx={{ maxWidth: 190, wordWrap: "break-word" }}>{row.StaffEmail}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}