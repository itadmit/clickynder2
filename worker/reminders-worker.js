/**
 * Reminders Background Worker
 * 
 * Worker זה רץ כתהליך נפרד ושולח תזכורות ואישורי הגעה
 * מריץ את העבודה כל 15 דקות
 */

const https = require('https');
const http = require('http');

const WORKER_INTERVAL = 15 * 60 * 1000; // 15 דקות
const API_URL = process.env.WORKER_API_URL || 'http://app:3000';
const CRON_SECRET = process.env.CRON_SECRET_KEY || 'your-secret-key-here';

console.log('🚀 Reminders Worker Started');
console.log(`📍 API URL: ${API_URL}`);
console.log(`⏰ Interval: ${WORKER_INTERVAL / 1000 / 60} minutes`);
console.log('');

/**
 * שולח בקשה ל-API לשליחת תזכורות
 */
async function sendReminders() {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/cron/send-reminders', API_URL);
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    };

    // בחירה בין http ו-https לפי הפרוטוקול
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * מריץ את המשימה
 */
async function runTask() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] 🔄 Starting reminders task...`);

  try {
    const result = await sendReminders();
    
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`[${endTime.toISOString()}] ✅ Task completed in ${duration}s`);
    console.log(`  📊 Results:`, result.results);
    console.log('');
  } catch (error) {
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error(`[${endTime.toISOString()}] ❌ Task failed after ${duration}s`);
    console.error(`  Error: ${error.message}`);
    console.error('');
  }
}

/**
 * מתחיל את ה-Worker
 */
function start() {
  // הרצה מיידית
  runTask();

  // הרצה מתוזמנת
  setInterval(runTask, WORKER_INTERVAL);

  // טיפול בסגירה נקייה
  process.on('SIGTERM', () => {
    console.log('🛑 Worker shutting down...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('🛑 Worker shutting down...');
    process.exit(0);
  });
}

// התחלה!
start();

