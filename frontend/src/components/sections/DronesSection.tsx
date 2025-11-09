import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";

interface DronesSectionProps {
  onShowModal: () => void;
}

interface DroneCardProps {
  title: string;
  description: string;
  color?: string;
}

const DroneCard = ({ title, description, color = "#0f1724" }: DroneCardProps) => (
  <Paper elevation={0} sx={{ p: 3, height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
    <Typography variant="h6" gutterBottom sx={{ color }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Paper>
);

export default function DronesSection({ onShowModal }: DronesSectionProps) {
  return (
    <Box component="section" id="drones" sx={{ py: 8, bgcolor: "white" }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" gutterBottom align="center" fontWeight="bold">
          Our Drones
        </Typography>
        <Typography variant="body1" align="center" paragraph sx={{ mb: 6 }}>
          We operate multiple classes of drones tailored to surveys, inspection, and rapid response.
          Each platform is maintained to commercial standards and flown by licensed operators.
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <DroneCard
              title="Survey Mappers"
              description="High-resolution cameras and RTK positioning for topographic and photogrammetry tasks."
              color="#2563eb"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DroneCard
              title="Inspection Drones"
              description="Stable platforms with zoom and thermal cameras for infrastructure and asset inspection."
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DroneCard
              title="Rapid Response"
              description="Lightweight, fast-deploy units for time-sensitive assessments and situational awareness."
              color="#fb923c"
            />
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={onShowModal}
            sx={{
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8" },
              px: 4,
              py: 1.5,
            }}
          >
            See Drone Types
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
