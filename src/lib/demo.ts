/**
 * Demo mode is switched on per deployment (DEMO_MODE=1) and only ever together with a database that holds
 * nothing but fictional data. Without it the one-click demo sign-in does not exist.
 */
export const DEMO_USERNAME = "demo";

export const isDemoMode = () => process.env.DEMO_MODE === "1";
