import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  globalIgnores([
    "node_modules",
    "main.js",
    "esbuild.config.mjs",
    "versions.json",
    "package.json",
    "package-lock.json"
  ]),
  {
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },
  ...obsidianmd.configs.recommended
);
