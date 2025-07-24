const { spawn } = require("child_process");
const path = require("path");

// Get the directory of this script
const scriptDir = __dirname;

// Change to the script directory
process.chdir(scriptDir);

// Start the Next.js dev server
const nextDev = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
});

nextDev.on("error", (err) => {
  console.error("Failed to start Next.js dev server:", err);
});

process.on("SIGINT", () => {
  nextDev.kill("SIGINT");
  process.exit(0);
});
