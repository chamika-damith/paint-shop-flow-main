const Invoice = require('../models/Invoice');
const Receipt = require('../models/Receipt');
const InventoryItem = require('../models/InventoryItem');

// Invoice Controllers
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('items.item');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('items.item');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    // Calculate total amount from items
    let totalAmount = 0;
    for (const item of req.body.items) {
      const inventoryItem = await InventoryItem.findById(item.item);
      if (!inventoryItem) {
        return res.status(404).json({ message: `Item ${item.item} not found` });
      }
      if (inventoryItem.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient quantity for item ${inventoryItem.name}` });
      }
      totalAmount += item.quantity * item.price;
    }

    const invoice = new Invoice({
      customer: req.body.customer,
      date: req.body.date || new Date(),
      dueDate: req.body.dueDate,
      amount: totalAmount,
      status: req.body.status || 'Pending',
      items: req.body.items,
      notes: req.body.notes,
      paymentTerms: req.body.paymentTerms
    });

    // Update inventory quantities
    for (const item of req.body.items) {
      await InventoryItem.findByIdAndUpdate(item.item, {
        $inc: { quantity: -item.quantity }
      });
    }

    const newInvoice = await invoice.save();
    const populatedInvoice = await Invoice.findById(newInvoice._id).populate('items.item');
    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // If items are being updated, recalculate total amount
    if (req.body.items) {
      let totalAmount = 0;
      for (const item of req.body.items) {
        const inventoryItem = await InventoryItem.findById(item.item);
        if (!inventoryItem) {
          return res.status(404).json({ message: `Item ${item.item} not found` });
        }
        totalAmount += item.quantity * item.price;
      }
      req.body.amount = totalAmount;
    }

    Object.assign(invoice, req.body);
    const updatedInvoice = await invoice.save();
    const populatedInvoice = await Invoice.findById(updatedInvoice._id).populate('items.item');
    res.json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Return items to inventory
    for (const item of invoice.items) {
      await InventoryItem.findByIdAndUpdate(item.item, {
        $inc: { quantity: item.quantity }
      });
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markInvoiceAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = 'Paid';
    invoice.paymentDate = new Date();
    const updatedInvoice = await invoice.save();
    const populatedInvoice = await Invoice.findById(updatedInvoice._id).populate('items.item');
    res.json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Receipt Controllers
exports.getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find().populate('invoice');
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate('invoice');
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReceipt = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.body.invoice);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const receipt = new Receipt({
      customer: invoice.customer,
      date: new Date(),
      amount: invoice.amount,
      invoice: invoice._id,
      items: invoice.items,
      paymentMethod: req.body.paymentMethod
    });

    // Update invoice status to paid
    invoice.status = 'Paid';
    invoice.paymentDate = new Date();
    await invoice.save();

    const newReceipt = await receipt.save();
    const populatedReceipt = await Receipt.findById(newReceipt._id).populate('invoice');
    res.status(201).json(populatedReceipt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    Object.assign(receipt, req.body);
    const updatedReceipt = await receipt.save();
    const populatedReceipt = await Receipt.findById(updatedReceipt._id).populate('invoice');
    res.json(populatedReceipt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // Update associated invoice status back to pending
    if (receipt.invoice) {
      const invoice = await Invoice.findById(receipt.invoice);
      if (invoice) {
        invoice.status = 'Pending';
        invoice.paymentDate = undefined;
        await invoice.save();
      }
    }

    await receipt.deleteOne();
    res.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.emailReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate('invoice');
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // TODO: Implement email sending logic here
    // For now, just simulate email sending
    res.json({ message: 'Receipt email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all invoices for a customer
exports.getInvoicesByCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    // If Invoice.customer is a string (email), use email; if ObjectId, use id
    const invoices = await Invoice.find({ customer: customerId }).populate('items.item');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 