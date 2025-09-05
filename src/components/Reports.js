import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

const OliveButton = styled(Button)({
  backgroundColor: "#6B8A47",
  color: "white",
  marginRight: 2,
  "&:hover": {
    backgroundColor: "#556B2F",
  },
});

export default function Reports({ generatePDF, generateCSV, generateExcel }) {
  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: 2, padding: 3, boxShadow: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
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
