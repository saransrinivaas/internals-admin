import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const OliveButton = styled(Button)({
  backgroundColor: "#6B8A47",
  color: "white",
  width: "100%",
  padding: "14px 0",
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 8,
  "&:hover": {
    backgroundColor: "#556B2F",
  },
});

export default function Reports() {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Sample PDF Report Content", 10, 10);
    doc.save("report.pdf");
  };

  const generateCSV = () => {
    const csvContent = "Name,Email,Role\nJohn Doe,john@example.com,Admin\nJane Doe,jane@example.com,User";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "report.csv");
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const generateExcel = () => {
    const data = [
      { Name: "John Doe", Email: "john@example.com", Role: "Admin" },
      { Name: "Jane Doe", Email: "jane@example.com", Role: "User" },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    XLSX.writeFile(workbook, "report.xlsx");
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: 4,
        padding: 6,
        boxShadow: 4,
        maxWidth: 400,
        margin: "40px auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Reports
      </Typography>

      <OliveButton variant="contained" onClick={generatePDF}>
        Download PDF Report
      </OliveButton>

      <OliveButton variant="contained" onClick={generateCSV}>
        Export CSV
      </OliveButton>

      <OliveButton variant="contained" onClick={generateExcel}>
        Export Excel
      </OliveButton>
    </Box>
  );
}
