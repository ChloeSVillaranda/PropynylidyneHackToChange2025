import {
    Box,
    Button,
    Container,
    Grid,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';
import {motion} from 'framer-motion';
import DroneFleetModal from '../DroneFleetModal';
import {useState} from 'react';

interface DronesSectionProps {
    onShowModal: () => void;
}

interface DroneCardProps {
    title: string;
    description: string;
    color?: string;
}

const DroneCard = ({title, description, color = '#0f1724'}: DroneCardProps) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <motion.div
            initial={{opacity: 0, scale: 0.95}}
            whileInView={{opacity: 1, scale: 1}}
            viewport={{once: true}}
            transition={{duration: 0.5}}>
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    height: '100%',
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(20,20,20,0.95) 100%)'
                        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    border: `1px solid ${
                        isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }`,
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: isDark
                            ? '0 12px 30px rgba(0,0,0,0.4)'
                            : '0 12px 30px rgba(0,0,0,0.1)',
                        border: `1px solid ${
                            isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                        }`,
                    },
                }}>
                <Typography
                    variant='h6'
                    gutterBottom
                    sx={{
                        color,
                        fontWeight: 600,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -1,
                            left: 0,
                            width: '40px',
                            height: '2px',
                            background: color,
                            borderRadius: '2px',
                        },
                    }}>
                    {title}
                </Typography>
                <Typography
                    variant='body2'
                    sx={{color: 'text.secondary', lineHeight: 1.7}}>
                    {description}
                </Typography>
            </Paper>
        </motion.div>
    );
};

export default function DronesSection({onShowModal}: DronesSectionProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [open, setOpen] = useState(false);

    return (
        <>
            <Box
                component='section'
                id='drones'
                sx={{
                    py: 12,
                    background: isDark
                        ? 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)'
                        : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                    borderTop: `1px solid ${
                        isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }`,
                    borderBottom: `1px solid ${
                        isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }`,
                }}>
                <Container maxWidth='lg'>
                    <motion.div
                        initial={{opacity: 0, y: 30}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true}}
                        transition={{duration: 0.6}}>
                        <Typography
                            variant='h2'
                            component='h2'
                            gutterBottom
                            align='center'
                            sx={{
                                fontWeight: 900,
                                fontSize: {xs: '3rem', md: '4.5rem'},
                                fontFamily: '"Poppins", sans-serif',
                                background:
                                    'linear-gradient(to right, #0f2447, #3b82f6)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                textShadow: '0 4px 15px rgba(59,130,246,0.4)',
                                mb: 4,
                                letterSpacing: '-0.02em',
                            }}>
                            Our Drones
                        </Typography>
                    </motion.div>
                    <Typography
                        variant='body1'
                        align='center'
                        paragraph
                        sx={{mb: 6}}>
                        Our drone fleet addresses key urban challenges. From
                        monitoring public safety and infrastructure to tracking
                        environmental impact, each drone is designed to improve
                        the quality of life in cities, ensuring inclusivity,
                        sustainability, and resilience.
                    </Typography>

                    <Grid container spacing={4} sx={{mb: 4}}>
                        <Grid item xs={12} md={4}>
                            <DroneCard
                                title='Survey & Mapping Drones'
                                description='Capture high-resolution data for city planning, accessibility mapping, and disaster risk assessment.'
                                color='#2563eb'
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DroneCard
                                title='Inspection Drones'
                                description='Inspect bridges, roads, and public spaces to detect hazards, improve safety, and maintain infrastructure efficiently.'
                                color='#10b981'
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DroneCard
                                title='Rapid Response Drones'
                                description='Deploy immediately to emergencies, provide situational awareness, and support first responders for safer communities.'
                                color='#fb923c'
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{textAlign: 'center'}}>
                        <Button
                            variant='contained'
                            // onClick={onShowModal}
                            onClick={() => setOpen(true)}
                            sx={{
                                background:
                                    'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 500,
                                boxShadow: '0 10px 20px rgba(59,130,246,0.3)',
                                '&:hover': {
                                    background:
                                        'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 15px 30px rgba(59,130,246,0.4)',
                                },
                            }}>
                            Explore Our Drone Fleet
                        </Button>
                    </Box>
                </Container>
            </Box>
            <DroneFleetModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}
