import { Box, Card, Typography, IconButton, Chip, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface MissionCardProps {
  title: string;
  droneId: string;
  status: string;
  date: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MissionCard({ title, droneId, status, date, onEdit, onDelete }: MissionCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        p: 2,
        background: isDark 
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '10px',
        boxShadow: isDark 
          ? '0 4px 20px rgba(0,0,0,0.4)'
          : '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
          {title}
        </Typography>
        <Chip 
          label={status} 
          size="small"
          sx={{ 
            bgcolor: status === 'Active' ? '#22c55e' : '#64748b',
            color: 'white'
          }} 
        />
      </Box>

      <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#475569', mb: 2 }}>
        Drone ID: {droneId}
      </Typography>
      <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#475569', mb: 2 }}>
        {date}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <IconButton
          onClick={onEdit}
          size="small"
          sx={{
            color: isDark ? '#60a5fa' : '#3b82f6',
            '&:hover': { bgcolor: isDark ? 'rgba(96,165,250,0.1)' : 'rgba(59,130,246,0.1)' }
          }}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={onDelete}
          size="small"
          sx={{
            color: isDark ? '#f87171' : '#ef4444',
            '&:hover': { bgcolor: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(239,68,68,0.1)' }
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );
}
