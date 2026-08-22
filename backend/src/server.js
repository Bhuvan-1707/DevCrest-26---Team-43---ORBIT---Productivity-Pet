import config from './config/env.js';
import { testConnection } from './config/database.js';
import { initDatabase } from './config/initDatabase.js';
import app from './app.js';

app.listen(config.port, async () => {
  console.log(`[ORBIT Backend API] Server running on http://localhost:${config.port} (${config.nodeEnv})`);
  
  // 1. Test MariaDB database connectivity at startup
  const isConnected = await testConnection();

  // 2. Safely initialize DB schema if database connection succeeded
  if (isConnected) {
    await initDatabase();
  }
});
