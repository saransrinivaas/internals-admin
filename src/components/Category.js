import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import WcIcon from '@mui/icons-material/Wc';
import BugReportIcon from '@mui/icons-material/BugReport';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import GradingIcon from '@mui/icons-material/Grading';
import PetsIcon from '@mui/icons-material/Pets';
import ChatIcon from '@mui/icons-material/Chat';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import NatureIcon from '@mui/icons-material/Nature';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useTranslation } from "react-i18next";

const categories = [
  { label: "pothole", icon: <DirectionsCarIcon />, color: "#b2dfdb" },
  { label: "garbage", icon: <DeleteIcon />, color: "#f8bbd0" },
  { label: "brokenBin", icon: <DeleteIcon />, color: "#cfd8dc" },
  { label: "streetLight", icon: <LightbulbIcon />, color: "#fff9c4" },
  { label: "publicToilet", icon: <WcIcon />, color: "#d1c4e9" },
  { label: "mosquitoMenace", icon: <BugReportIcon />, color: "#ffe0b2" },
  { label: "waterStagnation", icon: <WaterDropIcon />, color: "#b3e5fc" },
  { label: "stormWaterDrains", icon: <GradingIcon />, color: "#c8e6c9" },
  { label: "streetDogs", icon: <PetsIcon />, color: "#ffccbc" },
  { label: "others", icon: <ChatIcon />, color: "#bdbdbd" },
  { label: "checkStatus", icon: <PersonSearchIcon />, color: "#e1bee7" },
  { label: "treeFallen", icon: <NatureIcon />, color: "#ffecb3" },
];

export default function CategoryPage() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "#f6f7fa" }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        {t("grievanceCategories") || "Grievance Categories"}
      </Typography>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {categories.map((cat) => (
          <Grid
            key={cat.label}
            item
            xs={6}
            sm={4}
            md={3}
            lg={2}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Card
              sx={{
                width: 150,
                height: 180,
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: 2,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                bgcolor: "#fff",
                '&:hover': {
                  transform: "scale(1.05)",
                  boxShadow: 6,
                },
              }}
            >
              <Box
                sx={{
                  background: cat.color,
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                {React.cloneElement(cat.icon, { sx: { fontSize: 36, color: theme.palette.primary.dark } })}
              </Box>
              <CardContent sx={{ p: 0, textAlign: "center" }}>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 16 }}>
                  {t(cat.label)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
