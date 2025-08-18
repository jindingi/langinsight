// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

import { globalIgnores } from "eslint/config";

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    globalIgnores([
        ".turbo",
        ".prettierrc.js",
        "node_modules",
        "**/*.test.ts",
        "apps/extension/node_modules", "apps/extension/.wxt", "apps/extension/.turbo", "apps/extension/.output"])
);

// export default defineConfig([globalIgnores([".config/"])]);