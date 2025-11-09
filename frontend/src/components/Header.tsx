import React from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import MapIcon from "@mui/icons-material/Map";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import DroneIcon from "@mui/icons-material/PropaneTank";
import { useColorMode } from "../theme";
import "../index.css";
import { SxProps, Theme } from "@mui/material/styles";

interface HeaderProps {
  isLoggedIn?: boolean;
  setIsLoggedIn?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface NavButtonProps {
  title: string;
  onClick?: () => void;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const NavButton: React.FC<NavButtonProps> = ({ title, onClick, children, sx }) => (
  <Tooltip title={title}>
    <IconButton color="inherit" onClick={onClick} size="large" sx={{ ml: 1, ...sx }}>
      {children}
    </IconButton>
  </Tooltip>
);

export default function Header({ isLoggedIn, setIsLoggedIn }: HeaderProps) {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const colorMode = useColorMode();

  const go = (path: string) => () => navigate(path);
  const handleAuthClick = () => {
    if (isLoggedIn) {
      try {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } catch (e) {
        // ignore
      }
      if (typeof setIsLoggedIn === "function") setIsLoggedIn(false);
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  const iconStyle = {
    color: '#1e40af',
    "&:hover": {
      color: '#2563eb'
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        background:
          muiTheme.palette.mode === "dark"
            ? "linear-gradient(to right, #0f172a, #1e293b)"
            : "linear-gradient(to right, #ffffff, #f8fafc)",
        boxShadow:
          muiTheme.palette.mode === "dark"
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        {/* Left: logo + title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }} onClick={go("/")}>
          <img
            src={muiTheme.palette.mode === "dark" ? "/drone-the-change-dark.png" : "/drone-the-change.png"}
            alt="Drone The Change"
            style={{
              height: "60px",
              width: "auto",
              objectFit: "contain",
              transition: "all 0.3s ease",
            }}
            onError={(e) => {
              console.error("Failed to load logo");
              e.currentTarget.style.display = "none";
            }}
          />
        </Box>

        {/* Center / Right: nav icons, theme toggle, login */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* show nav only when logged in */}
          {isLoggedIn && (
            <>
              <NavButton title="Dashboard" onClick={go("/")} sx={iconStyle}>
                <HomeIcon />
              </NavButton>

              <NavButton title="View Drones" onClick={go("/view-drones")} sx={iconStyle}>
                <MapIcon />
              </NavButton>

              <NavButton title="Manage Drones" onClick={go("/manage-drones")} sx={iconStyle}>
                <DroneIcon />
              </NavButton>

              <NavButton title="Manage Missions" onClick={go("/manage-missions")} sx={iconStyle}>
                <ListAltIcon />
              </NavButton>

              <NavButton title="Settings" onClick={go("/settings")} sx={iconStyle}>
                <SettingsIcon />
              </NavButton>
            </>
          )}

          {/* theme toggle with updated colors */}
          <NavButton
            title={muiTheme.palette.mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            onClick={colorMode.toggleColorMode}
            sx={iconStyle}
          >
            {muiTheme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </NavButton>

          <NavButton
            title={isLoggedIn ? "Logout" : "Login"}
            onClick={handleAuthClick}
            sx={iconStyle}
          >
            {isLoggedIn ? <LogoutIcon /> : <LoginIcon />}
          </NavButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
