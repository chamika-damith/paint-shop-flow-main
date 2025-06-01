const cron = require('node-cron');
const { checkLowStockAndNotify } = require('../services/lowStockService');

// Schedule low stock check to run every day at midnight
const scheduleLowStockCheck = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled low stock check...');
    await checkLowStockAndNotify();
  });
};

module.exports = {
  scheduleLowStockCheck
}; 