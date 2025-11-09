import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Dialog,
    DialogContent,
    Grid,
    Typography,
    useTheme,
    IconButton,
} from '@mui/material';
import {motion} from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import droneInspection from '../assets/drone-inspection.jpg';
import droneResponse from '../assets/drone-response.jpg';
import droneSensor from '../assets/drone-sensor.jpg';
import droneSurvey from '../assets/drone-survey.jpg';

interface DroneFleetModalProps {
    open: boolean;
    onClose: () => void;
}

interface DroneInfo {
    name: string;
    model: string;
    description: string;
    image: string;
}

const drones: DroneInfo[] = [
    {
        name: 'Survey & Mapping Drone',
        model: 'AeroMap X2',
        description:
            'Equipped with LiDAR and 4K cameras for high-precision urban mapping and terrain modeling.',
        image: droneSurvey,
    },
    {
        name: 'Inspection Drone',
        model: 'InfraScan Pro',
        description:
            'Designed for infrastructure monitoring with AI-powered defect detection and thermal imaging.',
        image: droneInspection,
    },
    {
        name: 'Rapid Response Drone',
        model: 'ResQ Swift',
        description:
            'Built for emergency response, featuring fast deployment, night vision, and live data streaming.',
        image: droneResponse,
    },
    {
        name: 'Environmental Drone',
        model: 'EcoSense 4K',
        description:
            'Monitors air quality, vegetation health, and pollution sources to promote urban sustainability.',
        image: droneSensor,
    },
];

export default function DroneFleetModal({open, onClose}: DroneFleetModalProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth='md'
            fullWidth
            PaperProps={{
                sx: {
                    background: isDark
                        ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
                        : 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
                    borderRadius: 3,
                    p: 2,
                },
            }}>
            <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                px={3}
                pt={2}>
                <Typography
                    variant='h5'
                    sx={{
                        fontWeight: 700,
                        background:
                            'linear-gradient(to right, #1e40af, #3b82f6)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                    }}>
                    Explore Our Drone Fleet
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon sx={{color: isDark ? '#fff' : '#000'}} />
                </IconButton>
            </Box>

            <DialogContent>
                <Grid container spacing={3}>
                    {drones.map((drone, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <motion.div
                                initial={{opacity: 0, y: 30}}
                                animate={{opacity: 1, y: 0}}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}>
                                <Card
                                    sx={{
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        height: '100%',
                                        background: isDark
                                            ? 'linear-gradient(135deg, rgba(30,30,30,0.95), rgba(20,20,20,0.95))'
                                            : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                        border: `1px solid ${
                                            isDark
                                                ? 'rgba(255,255,255,0.1)'
                                                : 'rgba(0,0,0,0.05)'
                                        }`,
                                        transition:
                                            'transform 0.3s ease, box-shadow 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: isDark
                                                ? '0 12px 30px rgba(0,0,0,0.4)'
                                                : '0 12px 30px rgba(0,0,0,0.15)',
                                        },
                                    }}>
                                    <CardMedia
                                        component='img'
                                        height='180'
                                        image={drone.image}
                                        alt={drone.name}
                                        sx={{objectFit: 'cover'}}
                                    />
                                    <CardContent>
                                        <Typography
                                            variant='h6'
                                            sx={{fontWeight: 600}}>
                                            {drone.name}
                                        </Typography>
                                        <Typography
                                            variant='subtitle2'
                                            sx={{
                                                color: 'text.secondary',
                                                mb: 1,
                                            }}>
                                            Model: {drone.model}
                                        </Typography>
                                        <Typography
                                            variant='body2'
                                            sx={{color: 'text.secondary'}}>
                                            {drone.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
        </Dialog>
    );
}
