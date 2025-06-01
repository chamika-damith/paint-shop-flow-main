const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

// Invoice routes
router.get('/invoices', billingController.getAllInvoices);
router.get('/invoices/:id', billingController.getInvoiceById);
router.post('/invoices', billingController.createInvoice);
router.put('/invoices/:id', billingController.updateInvoice);
router.delete('/invoices/:id', billingController.deleteInvoice);
router.patch('/invoices/:id/paid', billingController.markInvoiceAsPaid);

// Receipt routes
router.get('/receipts', billingController.getAllReceipts);
router.get('/receipts/:id', billingController.getReceiptById);
router.post('/receipts', billingController.createReceipt);
router.put('/receipts/:id', billingController.updateReceipt);
router.delete('/receipts/:id', billingController.deleteReceipt);
router.post('/receipts/:id/email', billingController.emailReceipt);

// Get all invoices for a customer
router.get('/customer/:customerId/invoices', billingController.getInvoicesByCustomer);

module.exports = router; 