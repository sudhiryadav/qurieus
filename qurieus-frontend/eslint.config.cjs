const { defineConfig, globalIgnores } = require("eslint/config");
const nextVitals = require("eslint-config-next/core-web-vitals");
const nextVitalsConfig = Array.isArray(nextVitals) ? nextVitals : [nextVitals];

module.exports = defineConfig([
  ...nextVitalsConfig,
  globalIgnores(["public/**", ".next/**", "node_modules/**", "scripts/**"]),
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/static-components": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
]);
