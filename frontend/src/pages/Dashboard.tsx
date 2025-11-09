import { useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, DialogActions, Button } from "@mui/material";
import DroneMap from "../components/DroneMap";
import MissionSection from "../components/sections/MissionSection";
import DronesSection from "../components/sections/DronesSection";
import ContactSection from "../components/sections/ContactSection";

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Map container with fixed height */}
      <Box sx={{ 
        height: '500px', // Fixed height for map
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <DroneMap />
      </Box>

      {/* Sections container */}
      <Box sx={{ 
        position: 'relative',
        zIndex: 2,
        boxShadow: '0px -4px 20px rgba(0,0,0,0.1)' // Optional: adds shadow to separate map from content
      }}>
        <MissionSection />
        <DronesSection onShowModal={() => setShowModal(true)} />
        <ContactSection />
      </Box>

      {/* Modal remains unchanged */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md">
        <DialogTitle>Types of Drones</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            {/*
              - Survey Mappers: High-resolution photogrammetry platforms for mapping and GIS.
              - Inspection Drones: Zoom and thermal sensors for asset inspections.
              - Rapid Response: Fast-deploy units for time-sensitive situations.
            */}
            {/*
              Survey Mappers
              High-resolution photogrammetry platforms for mapping and GIS.
            */}
            {/*
              Inspection Drones
              Zoom and thermal sensors for asset inspections.
            */}
            {/*
              Rapid Response
              Fast-deploy units for time-sensitive situations.
            */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
