import React, { useState, useMemo } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { LoadScript, GoogleMap, HeatmapLayer } from "@react-google-maps/api";

// Jharkhand default coordinates center (approximate)
const JHARKHAND_CENTER = { lat: 23.6102, lng: 85.2799 };

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: 12,
  overflow: "hidden",
};

export default function Heatmap({ heatmapData = [] }) {
  // Example heatmap data points (Google Maps LatLngLiteral objects)
  // Replace or pass actual dynamic data as needed
  const defaultHeatmapData = useMemo(() => [
    { lat: 23.6102, lng: 85.2799 },
    { lat: 23.6345, lng: 85.3250 },
    { lat: 23.5800, lng: 85.2000 },
    { lat: 23.6500, lng: 85.3000 },
  ], []);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 2px 14px rgba(0,0,0,0.15)" }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Heatmap of Issues in Jharkhand
        </Typography>

        <LoadScript
          googleMapsApiKey={process.env.AIzaSyCyZYuKJc4YREy3ppZxlnODX_HL7sJlAbk}
          libraries={["visualization"]}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={JHARKHAND_CENTER}
            zoom={7}
            options={{ gestureHandling: "greedy" }}
          >
            <HeatmapLayer
              data={heatmapData.length > 0 ? heatmapData : defaultHeatmapData}
              options={{ radius: 30 }}
            />
          </GoogleMap>
        </LoadScript>
      </CardContent>
    </Card>
  );
}
