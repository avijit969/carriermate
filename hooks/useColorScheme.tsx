import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  colorScheme: "light" | "dark" | undefined;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleColorScheme: () => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: "light",
  theme: "system",
  setTheme: () => { },
  toggleColorScheme: () => { },
  isLoaded: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme, setColorScheme: setNativeWindColorScheme, toggleColorScheme } = useNativeWindColorScheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") {
          setThemeState(savedTheme);
          setNativeWindColorScheme(savedTheme);
        } else {
          setThemeState("system");
          setNativeWindColorScheme("system");
        }
      } catch (e) {
        console.error("Failed to load theme", e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    setNativeWindColorScheme(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme);
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, theme, setTheme, toggleColorScheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useColorScheme = () => useContext(ThemeContext);
