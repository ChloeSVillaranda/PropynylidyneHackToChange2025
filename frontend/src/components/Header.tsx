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

interface HeaderProps {
  isLoggedIn?: boolean;
  setIsLoggedIn?: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavButton: React.FC<{ title: string; onClick?: () => void; children?: React.ReactNode }> = ({ title, onClick, children }) => (
  <Tooltip title={title}>
    <IconButton color="inherit" onClick={onClick} size="large" sx={{ ml: 1 }}>
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

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        {/* Left: logo + title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }} onClick={go("/")}>
          <img
            src="/drone-the-change.png"
            alt="Drone The Change"
            style={{
              height: "60px",
              width: "auto",
              objectFit: "contain",
              filter: muiTheme.palette.mode === "dark" ? "brightness(1)" : "brightness(0.9)",
              transition: "filter 0.3s ease",
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
            </>
          )}

          {/* theme toggle (always visible) */}
          <NavButton
            title={muiTheme.palette.mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            onClick={colorMode.toggleColorMode}
          >
            {muiTheme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </NavButton>

          <NavButton title={isLoggedIn ? "Logout" : "Login"} onClick={handleAuthClick}>
            {isLoggedIn ? <LogoutIcon /> : <LoginIcon />}
          </NavButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
