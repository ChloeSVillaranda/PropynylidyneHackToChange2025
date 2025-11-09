import React, { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

// App color scheme (from your image)
const PALETTE = {
	brandDarkest: "#012E40",
	brandDarker: "#024959",
	brandMid: "#026773",
	brandLight: "#3CA6A6",
	brandAccent: "#F2E3D5"
};

type ColorModeContextType = { mode: PaletteMode; toggleColorMode: () => void };
const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

export const useColorMode = () => {
	const ctx = useContext(ColorModeContext);
	if (!ctx) throw new Error("useColorMode must be used within AppThemeProvider");
	return ctx;
};

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	// persist choice
	const initial = (localStorage.getItem("colorMode") as PaletteMode) || "light";
	const [mode, setMode] = useState<PaletteMode>(initial);

	const colorMode = useMemo(
		() => ({
			mode,
			toggleColorMode: () => {
				setMode(prev => {
					const next = prev === "light" ? "dark" : "light";
					localStorage.setItem("colorMode", next);
					return next;
				});
			}
		}),
		[mode]
	);

	const theme = useMemo(() => {
		const common = {
			primary: { main: PALETTE.brandMid, dark: PALETTE.brandDarker, light: PALETTE.brandLight, contrastText: PALETTE.brandAccent },
			secondary: { main: PALETTE.brandLight, contrastText: PALETTE.brandDarkest }
		};

		return createTheme({
			palette: {
				mode,
				...(mode === "light"
					? {
							...common,
							background: { default: PALETTE.brandAccent, paper: "#ffffff" },
							text: { primary: PALETTE.brandDarkest, secondary: PALETTE.brandDarker }
					  }
					: {
							...common,
							background: { default: "#071822", paper: PALETTE.brandDarkest },
							text: { primary: "#e6f7f7", secondary: PALETTE.brandLight }
					  })
			},
			shape: {
				borderRadius: 8
			},
			components: {
				MuiAppBar: {
					styleOverrides: {
						root: {
							// subtle elevation
							boxShadow: "0 1px 6px rgba(0,0,0,0.3)"
						}
					}
				},
				MuiButton: {
					defaultProps: {
						disableElevation: true
					}
				}
			}
		});
	}, [mode]);

	return (
		<ColorModeContext.Provider value={colorMode}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ColorModeContext.Provider>
	);
};
