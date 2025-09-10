import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Card, CardContent, TextField, Autocomplete } from "@mui/material";
import { LoadScript, GoogleMap, HeatmapLayer, Marker, InfoWindow } from "@react-google-maps/api";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Default Coimbatore center
const COIMBATORE_CENTER = { lat: 11.0168, lng: 76.9558 };

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: 12,
  overflow: "hidden",
};

// Your Firebase config (replace)
const firebaseConfig = {
  // apiKey, authDomain, projectId, etc.
};

// Init Firebase (only once)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
const db = getFirestore(app);

// Example place list
const PLACE_NAMES = [
  "Coimbatore",
  "Gandhipuram",
  "Ukkadam",
  "RS Puram",
  "Saibaba Colony",
  "Peelamedu",
  "Town Hall",
  "Singanallur",
  "Race Course",
  "Vadavalli",
  "Selvapuram",
  "Saravanampatti",
  "Ramnagar",
  "Ganapathy",
  "Kavundampalayam",
  "Podanur",
  "Kuniamuthur",
  "Keeranatham",
  "PN Pudur"
];
const PLACE_OPTIONS = PLACE_NAMES.map(name => ({ label: name }));

export default function Heatmap() {
  const [issues, setIssues] = useState([]);                // raw issues (lat/lng as numbers)
  const [heatmapPoints, setHeatmapPoints] = useState([]);  // google.maps.LatLng[]
  const [locations] = useState(PLACE_OPTIONS);
  const [selectedLocation, setSelectedLocation] = useState({ label: "Coimbatore" });
  const [customLocation, setCustomLocation] = useState("");
  const [mapCenter, setMapCenter] = useState(COIMBATORE_CENTER);
  const [hoveredIssue, setHoveredIssue] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Fetch issues from Firestore and normalize lat/lng to numbers
  useEffect(() => {
    let mounted = true;
    async function fetchIssues() {
      try {
        const snap = await getDocs(collection(db, "issues"));
        const data = [];
        snap.forEach(doc => {
          const issue = doc.data();

          const rawLat = issue?.location?.lat;
          const rawLng = issue?.location?.lng;

          // parse to numbers if needed
          const lat = (typeof rawLat === "string") ? parseFloat(rawLat) : rawLat;
          const lng = (typeof rawLng === "string") ? parseFloat(rawLng) : rawLng;

          // ensure valid numeric lat/lng
          if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
            data.push({
              id: doc.id,
              lat,
              lng,
              title: issue.title || "Issue",
              description: issue.description || "",
              place: issue.place || ""
            });
          } else {
            // optional: console.warn(`Skipping issue ${doc.id} - invalid lat/lng`, rawLat, rawLng);
          }
        });

        if (mounted) setIssues(data);
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    }
    fetchIssues();
    return () => { mounted = false; };
  }, []);

  // Convert issues -> google.maps.LatLng but only after google API is loaded (i.e., window.google available)
  useEffect(() => {
    if (!mapInstance || typeof window === "undefined" || !window.google) {
      setHeatmapPoints([]); // not ready yet
      return;
    }
    try {
      const points = issues.map(i => new window.google.maps.LatLng(i.lat, i.lng));
      setHeatmapPoints(points);
    } catch (err) {
      console.error("Error converting heatmap points:", err);
      setHeatmapPoints([]);
    }
  }, [issues, mapInstance]);

  // Geocode selected/custom location and update center
  useEffect(() => {
    let active = true;
    async function geocodeLocation(locationName) {
      if (!locationName) return COIMBATORE_CENTER;
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName + ", Coimbatore")}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
        );
        const json = await res.json();
        if (json?.results?.[0]?.geometry?.location) {
          const { lat, lng } = json.results[0].geometry.location;
          return { lat, lng };
        }
      } catch (err) {
        console.error("Geocode error:", err);
      }
      return COIMBATORE_CENTER;
    }

    async function update() {
      let center = COIMBATORE_CENTER;
      if (customLocation) {
        center = await geocodeLocation(customLocation);
      } else if (selectedLocation?.label) {
        center = await geocodeLocation(selectedLocation.label);
      }
      if (active) setMapCenter(center);
    }
    update();
    return () => { active = false; };
  }, [selectedLocation, customLocation]);

  // GoogleMap onLoad callback
  const onMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  // GoogleMap onUnmount
  const onMapUnmount = useCallback(() => {
    setMapInstance(null);
    setHeatmapPoints([]);
  }, []);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 2px 14px rgba(0,0,0,0.15)" }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Heatmap of Issues (Pinned: {selectedLocation?.label || customLocation || "Coimbatore"})
        </Typography>

        <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
          <Autocomplete
            options={locations}
            getOptionLabel={option => option.label}
            value={selectedLocation}
            onChange={(e, value) => {
              setSelectedLocation(value || locations[0]);
              setCustomLocation("");
            }}
            sx={{ width: 250 }}
            renderInput={params => <TextField {...params} label="Select Location" />}
          />
          <TextField
            label="Or type location"
            value={customLocation}
            onChange={e => setCustomLocation(e.target.value)}
            sx={{ width: 200 }}
          />
        </Box>

        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          libraries={["visualization"]}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={13}
            options={{ gestureHandling: "greedy" }}
            onLoad={onMapLoad}
            onUnmount={onMapUnmount}
          >
            {/* Heatmap expects google.maps.LatLng objects in many versions, so we pass heatmapPoints (constructed above) */}
            <HeatmapLayer
              data={heatmapPoints}
              options={{ radius: 30 }}
            />

            {/* Center marker (lat/lng literal is fine for Marker) */}
            <Marker
              position={mapCenter}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: { width: 40, height: 40 }
              }}
            />

            {/* Show ALL issue markers (lat/lng literals are fine for Marker) */}
            {issues.map(issue => (
              <Marker
                key={issue.id}
                position={{ lat: issue.lat, lng: issue.lng }}
                onMouseOver={() => setHoveredIssue(issue)}
                onMouseOut={() => setHoveredIssue(null)}
              />
            ))}

            {/* Hover info window */}
            {hoveredIssue && (
              <InfoWindow
                position={{ lat: hoveredIssue.lat, lng: hoveredIssue.lng }}
                onCloseClick={() => setHoveredIssue(null)}
              >
                <Box>
                  <Typography variant="subtitle1">{hoveredIssue.title}</Typography>
                  <Typography variant="body2">{hoveredIssue.description}</Typography>
                </Box>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </CardContent>
    </Card>
  );
}
