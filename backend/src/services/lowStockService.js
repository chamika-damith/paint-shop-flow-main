const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const Notification = require('../models/Notification');
const transporter = require('../config/email');

// Function to check inventory levels and send notifications
const checkLowStockAndNotify = async () => {
  try {
    // Find all inventory items with low stock status
    const lowStockItems = await Inventory.find({
      status: { $in: ['Low Stock', 'Out of Stock'] }
    }).populate('supplier');

    if (!lowStockItems.length) {
      console.log('No low stock items found');
      return;
    }

    // Group items by supplier
    const itemsBySupplier = {};
    lowStockItems.forEach(item => {
      if (item.supplier && item.supplier.email && item.supplier.status === 'Active') {
        if (!itemsBySupplier[item.supplier.email]) {
          itemsBySupplier[item.supplier.email] = {
            supplier: item.supplier,
            items: []
          };
        }
        itemsBySupplier[item.supplier.email].items.push({
          item: item._id,
          name: item.name,
          currentQuantity: item.quantity,
          category: item.category,
          status: item.status
        });
      }
    });

    if (Object.keys(itemsBySupplier).length === 0) {
      console.log('No active suppliers found for low stock items');
      return;
    }

    // Send emails to suppliers and save notifications
    for (const [supplierEmail, data] of Object.entries(itemsBySupplier)) {
      try {
        const emailContent = {
          from: process.env.SMTP_FROM || 'paintshop@example.com',
          to: supplierEmail,
          subject: 'Low Stock Alert - Restocking Required',
          html: `
            <h2>Low Stock Alert</h2>
            <p>Dear ${data.supplier.name},</p>
            <p>The following items require your immediate attention for restocking:</p>
            <table style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item Name</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Category</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Current Quantity</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.category}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.currentQuantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; color: ${item.status === 'Out of Stock' ? 'red' : 'orange'}">${item.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p>Please arrange for restocking of these items at your earliest convenience.</p>
            <p>Best regards,<br>Paint Shop Management System</p>
          `
        };

        await transporter.sendMail(emailContent);
        console.log(`Low stock notification sent to ${supplierEmail}`);

        // Save notification record
        await Notification.create({
          type: 'Low Stock Alert',
          supplier: data.supplier._id,
          items: data.items.map(item => ({
            item: item.item,
            name: item.name,
            quantity: item.currentQuantity,
            category: item.category,
            status: item.status
          })),
          sentTo: supplierEmail,
          status: 'Sent'
        });

      } catch (emailError) {
        console.error(`Failed to send email to ${supplierEmail}:`, emailError);
        
        // Save failed notification
        await Notification.create({
          type: 'Low Stock Alert',
          supplier: data.supplier._id,
          items: data.items.map(item => ({
            item: item.item,
            name: item.name,
            quantity: item.currentQuantity,
            category: item.category,
            status: item.status
          })),
          sentTo: supplierEmail,
          status: 'Failed'
        });
      }
    }
  } catch (error) {
    console.error('Error in low stock notification service:', error);
    throw error;
  }
};

module.exports = {
  checkLowStockAndNotify
}; 