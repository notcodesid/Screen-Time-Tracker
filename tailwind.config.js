export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
  extend: {},
};
export const plugins = [];

export const references = [
  {
    path: "./tsconfig.app.json"
  },
  {
    path: "./tsconfig.node.json"
  }
];

export const compilerOptions = {
  baseUrl: ".",
  paths: {
    "@/*": ["./src/*"]
  }
};
