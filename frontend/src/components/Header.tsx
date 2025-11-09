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
import { useColorMode } from "../theme";
import "../index.css";
import { Typography } from "@mui/material";

interface HeaderProps {
  isLoggedIn?: boolean;
}

const NavButton: React.FC<{ title: string; onClick?: () => void; children?: React.ReactNode }> = ({ title, onClick, children }) => (
  <Tooltip title={title}>
    <IconButton color="inherit" onClick={onClick} size="large" sx={{ ml: 1 }}>
      {children}
    </IconButton>
  </Tooltip>
);

export default function Header({ isLoggedIn }: HeaderProps) {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const colorMode = useColorMode();

  const go = (path: string) => () => navigate(path);

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        {/* Left: logo + title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }} onClick={go("/")}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Drone The Change
          </Typography>
        </Box>

        {/* Center / Right: nav icons, theme toggle, login */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <NavButton title="Dashboard" onClick={go("/")}>
            <HomeIcon />
          </NavButton>

          <NavButton title="View Drones" onClick={go("/view-drones")}>
            <MapIcon />
          </NavButton>

          <NavButton title="Manage Missions" onClick={go("/manage-missions")}>
            <ListAltIcon />
          </NavButton>

          <NavButton title="Settings" onClick={go("/settings")}>
            <SettingsIcon />
          </NavButton>

          <NavButton
            title={muiTheme.palette.mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            onClick={colorMode.toggleColorMode}
          >
            {muiTheme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </NavButton>

          <NavButton title={isLoggedIn ? "Logout" : "Login"} onClick={go("/login")}>
            {isLoggedIn ? <LogoutIcon /> : <LoginIcon />}
          </NavButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
