import { Box, Container, Grid, Typography, Paper } from "@mui/material";
import SecurityIcon from '@mui/icons-material/Security';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import NatureIcon from '@mui/icons-material/Nature';

interface MissionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const MissionCard = ({ icon, title, description }: MissionCardProps) => (
  <Paper elevation={0} sx={{
    p: 4,
    height: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-5px)',
    }
  }}>
    <Box sx={{ color: '#60a5fa', mb: 2, '& svg': { fontSize: 40 } }}>
      {icon}
    </Box>
    <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
      {description}
    </Typography>
  </Paper>
);

export default function MissionSection() {
  return (
    <Box
      component="section"
      id="mission"
      sx={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: 'white',
        py: 12,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0) 50%)',
        }
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 800,
            mb: 6,
            background: 'linear-gradient(to right, #60a5fa, #93c5fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 2px 10px rgba(96, 165, 250, 0.2)',
          }}
        >
          Our Mission
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <MissionCard
              icon={<SecurityIcon />}
              title="Safety First"
              description="We prioritize safe and responsible drone operations, adhering to strict protocols and regulatory compliance."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MissionCard
              icon={<DataUsageIcon />}
              title="Data Excellence"
              description="Delivering precise, actionable data through advanced drone technology and expert analysis."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MissionCard
              icon={<NatureIcon />}
              title="Sustainable Impact"
              description="Creating positive environmental and social impact through efficient aerial solutions."
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
