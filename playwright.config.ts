import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/admin',
  timeout: 120_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'PORT=5001 npm run start',
      cwd: '../cineticket-backend-nest',
      url: 'http://localhost:5001/api/health',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: 'npm run dev -- -p 3000',
      cwd: '.',
      url: 'http://localhost:3000/login',
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
