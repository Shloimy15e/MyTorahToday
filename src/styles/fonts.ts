import { Libre_Caslon_Display, Frank_Ruhl_Libre } from "next/font/google";

export const displayFont = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-learning-display" });
export const sourceFont = Frank_Ruhl_Libre({ subsets: ["hebrew", "latin"], weight: "400", display: "swap", variable: "--font-source-reading" });
