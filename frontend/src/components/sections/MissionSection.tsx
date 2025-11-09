import { Box, Container, Grid, Typography, Paper, useTheme } from "@mui/material";
import SecurityIcon from '@mui/icons-material/Security';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import NatureIcon from '@mui/icons-material/Nature';

interface MissionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const MissionCard = ({ icon, title, description }: MissionCardProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Paper elevation={0} sx={{
      p: 4,
      height: '100%',
      background: isDark 
        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: isDark 
          ? '0 20px 40px rgba(0,0,0,0.3)'
          : '0 20px 40px rgba(0,0,0,0.1)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
      }
    }}>
      <Box className="icon-container">
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom sx={{ 
        color: isDark ? 'white' : '#1e293b',
        fontWeight: 600 
      }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ 
        color: isDark ? '#cbd5e1' : '#475569'
      }}>
        {description}
      </Typography>
    </Paper>
  );
};

export default function MissionSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component="section"
      id="mission"
      sx={{
        background: isDark
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'
          : 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #e0e7ff 100%)',
        color: isDark ? 'white' : '#1e1b4b',
        py: 12,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 50%)'
            : 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0) 50%)',
          animation: 'pulse 8s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 0.8 }
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
              title="Safer Cities"
              description="Using drones to monitor infrastructure and public spaces, enabling rapid response to hazards and disasters to protect communities."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MissionCard
              icon={<DataUsageIcon />}
              title="Data-Driven Insights"
              description="Collecting real-time data on pollution, traffic, and urban patterns to support informed decision-making for sustainable city planning."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MissionCard
              icon={<NatureIcon />}
              title="Sustainable & Inclusive"
              description="Leveraging drones for environmental monitoring, accessibility mapping, and equitable resource distribution to make cities greener and fairer."
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
