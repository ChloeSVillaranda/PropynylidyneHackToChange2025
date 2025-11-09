import { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Fab,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DroneMap from "../components/DroneMap";
import MissionSection from "../components/sections/MissionSection";
import DronesSection from "../components/sections/DronesSection";
import ContactSection from "../components/sections/ContactSection";
import ChatPanel from "../components/ChatPanel";

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [showChatOverlay, setShowChatOverlay] = useState(true);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Map container with fixed height */}
      <Box
        sx={{
          height: "500px", // Fixed height for map
          width: "100%",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <DroneMap />
        {showChatOverlay && (
          <Box
            sx={{
              position: "absolute",
              top: { xs: 12, md: 24 },
              right: { xs: 12, md: 24 },
              width: { xs: "calc(100% - 24px)", sm: 320, md: 360 },
              pointerEvents: "auto",
              zIndex: 500,
            }}
          >
            <ChatPanel
              variant="overlay"
              onClose={() => setShowChatOverlay(false)}
            />
          </Box>
        )}
        <Fab
          color="primary"
          size="medium"
          onClick={() => setShowChatOverlay((prev) => !prev)}
          sx={{
            position: "absolute",
            bottom: { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            zIndex: 510,
            boxShadow: "0 12px 24px rgba(15,23,42,0.35)",
          }}
          aria-label={
            showChatOverlay ? "Hide community chat" : "Show community chat"
          }
        >
          <ChatBubbleOutlineIcon />
        </Fab>
      </Box>

      {/* Sections container */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          boxShadow: "0px -4px 20px rgba(0,0,0,0.1)", // Optional: adds shadow to separate map from content
        }}
      >
        <MissionSection />
        <DronesSection />
        <ContactSection />
      </Box>

      {/* Modal remains unchanged */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="md"
      >
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
