import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        fontSize: "22px",
        bg: "brand.background",
      },
    },
  },
  fonts: {
    heading: "DM Sans, sans-serif",
    body: "DM Sans, sans-serif",
  },
  colors: {
    brand: {
      background: "#030D20",
    },
  },
});

export default theme
