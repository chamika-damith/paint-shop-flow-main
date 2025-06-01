import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchInvoices,
  fetchReceipts,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid,
  addReceipt,
  updateReceipt,
  deleteReceipt,
  emailReceipt,
} from "@/redux/slices/billingSlice";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, FileCheck, Search, ArrowUpDown, MoreVertical, Mail, Printer, Loader2, Filter, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const invoiceStatuses = ["All", "Paid", "Pending", "Overdue"];
const customerTypes = ["All", "Regular", "VIP", "Corporate"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Billing = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { invoices, receipts, loading, error } = useAppSelector((state) => state.billing);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false);
  const [isEditReceiptOpen, setIsEditReceiptOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCustomerType, setSelectedCustomerType] = useState("All");
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchReceipts());
  }, [dispatch]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All");
    setSelectedCustomerType("All");
  };

  const filteredInvoices = (invoices || []).filter(
    (invoice) => {
      const matchesSearch = 
        (invoice.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (invoice.customer?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (invoice.status?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === "All" || invoice.status === selectedStatus;
      const matchesCustomerType = selectedCustomerType === "All" || invoice.customer === selectedCustomerType;
      
      return matchesSearch && matchesStatus && matchesCustomerType;
    }
  );

  const filteredReceipts = (receipts || []).filter(
    (receipt) =>
      (receipt.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (receipt.customer?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (item: any) => {
    try {
      setIsDeleteDialogOpen(false);
      await dispatch(deleteInvoice(item._id)).unwrap();
      toast.success(`Invoice ${item._id} has been deleted.`);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invoice');
    }
  };

  const handleEmail = (item: any) => {
    setSelectedItem(item);
    setIsEmailDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (selectedItem._id) {
        if (selectedItem.type === 'invoice') {
          await dispatch(deleteInvoice(selectedItem._id)).unwrap();
          toast.success(`Invoice ${selectedItem._id} has been deleted.`);
        } else {
          await dispatch(deleteReceipt(selectedItem._id)).unwrap();
          toast.success(`Receipt ${selectedItem._id} has been deleted.`);
        }
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const sendEmail = async () => {
    try {
      await dispatch(emailReceipt({ id: selectedItem.id, email: 'customer@example.com' })).unwrap();
      toast.success(`Receipt ${selectedItem.id} has been sent via email.`);
      setIsEmailDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const handlePrint = (invoice: any) => {
    // Format the invoice data for printing
    const printContent = `
      Invoice #${invoice.id}
      Customer: ${invoice.customer}
      Date: ${new Date(invoice.date).toLocaleDateString()}
      Status: ${invoice.status}
      Amount: $${invoice.amount.toFixed(2)}
      
      Items:
      ${invoice.items?.map((item: any) => 
        `- ${item.item && item.item.name ? item.item.name : 'Unknown'}: ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`
      ).join('\n')}
      
      Total: $${invoice.amount.toFixed(2)}
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${invoice.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .details { margin-bottom: 20px; }
              .items { margin-bottom: 20px; }
              .total { text-align: right; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Invoice #${invoice.id}</h1>
            </div>
            <div class="details">
              <p><strong>Customer:</strong> ${invoice.customer}</p>
              <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${invoice.status}</p>
            </div>
            <div class="items">
              <h2>Items:</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Item</th>
                    <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Quantity</th>
                    <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Price</th>
                    <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items?.map((item: any) => `
                    <tr>
                      <td style="text-align: left; padding: 8px;">${item.item && item.item.name ? item.item.name : 'Unknown'}</td>
                      <td style="text-align: right; padding: 8px;">${item.quantity}</td>
                      <td style="text-align: right; padding: 8px;">$${item.price.toFixed(2)}</td>
                      <td style="text-align: right; padding: 8px;">$${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="total">
              <h3>Total: $${invoice.amount.toFixed(2)}</h3>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const markAsPaid = async (invoice: any) => {
    try {
      if (!invoice._id) {
        throw new Error('Invalid invoice ID');
      }
      await dispatch(markInvoiceAsPaid(invoice._id)).unwrap();
      toast.success(`Invoice has been marked as paid.`);
      setIsViewDetailsOpen(false);
    } catch (error: any) {
      console.error('Error marking invoice as paid:', error);
      toast.error(error.message || 'Failed to mark invoice as paid');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedItem(invoice);
    setIsEditInvoiceOpen(true);
    setIsViewDetailsOpen(false);
  };

  const handleEditReceipt = (receipt: any) => {
    setSelectedItem(receipt);
    setIsEditReceiptOpen(true);
  };

  const handleUpdateInvoice = async (updatedInvoice: any) => {
    try {
      if (!selectedItem?._id) {
        throw new Error('Invalid invoice ID');
      }

      // Ensure status is one of the valid values
      const status = updatedInvoice.status as 'Paid' | 'Pending' | 'Overdue';
      if (!['Paid', 'Pending', 'Overdue'].includes(status)) {
        throw new Error('Invalid status');
      }

      // Create the update payload
      const updatePayload = {
        customer: updatedInvoice.customer,
        date: updatedInvoice.date,
        dueDate: updatedInvoice.dueDate,
        notes: updatedInvoice.notes,
        status: status
      };

      await dispatch(updateInvoice({ 
        id: selectedItem._id, 
        invoice: updatePayload 
      })).unwrap();
      
      setIsEditInvoiceOpen(false);
      setSelectedItem(null);
      toast.success(`Invoice has been updated successfully.`);
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      toast.error(error.message || 'Failed to update invoice');
    }
  };

  const handleUpdateReceipt = async (updatedReceipt: any) => {
    try {
      await dispatch(updateReceipt({ id: selectedItem.id, receipt: updatedReceipt })).unwrap();
      setIsEditReceiptOpen(false);
      setSelectedItem(null);
      toast.success(`Receipt ${updatedReceipt.id} has been updated.`);
    } catch (error) {
      toast.error('Failed to update receipt');
    }
  };

  const handleViewDetails = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsViewDetailsOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="relative">
          {/* Background image with overlay */}
          <div className="absolute inset-0 -z-10 bg-paint-splash bg-cover bg-center opacity-5"></div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <FileText className="mr-2" /> Billing Management
              </h1>
              <p className="text-gray-500 mt-1">
                Create and manage invoices and receipts
              </p>
            </div>
            <Button 
              className="bg-primary"
              onClick={() => navigate("/billing/create-invoice")}
            >
              <Plus className="mr-1 h-5 w-5" /> Create New Invoice
            </Button>
          </div>

          <Tabs defaultValue="invoices" className="mt-6">
            <TabsList className="grid w-full max-w-md grid-cols-1">
              <TabsTrigger value="invoices" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Invoices
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="invoices" className="mt-4">
              <Card className="paint-card">
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>
                    Manage customer invoices and payment status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                          placeholder="Search invoices..." 
                          className="pl-8" 
                          value={searchTerm} 
                          onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={resetFilters}
                      >
                        Clear Filters
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Invoice Status</label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {invoiceStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      <span>
                        {filteredInvoices.length} invoices found
                        {(selectedStatus !== "All" || selectedCustomerType !== "All" || searchTerm) && " with current filters"}
                      </span>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              <div className="flex items-center">
                                Invoice ID
                                <ArrowUpDown className="ml-1 h-3 w-3" />
                              </div>
                            </TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow key="loading-row">
                              <TableCell colSpan={6} className="h-24 text-center">
                                <div className="flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
                                  <span>Loading...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : error ? (
                            <TableRow key="error-row">
                              <TableCell colSpan={6} className="h-24 text-center text-red-500">
                                {error}
                              </TableCell>
                            </TableRow>
                          ) : filteredInvoices.length === 0 ? (
                            <TableRow key="empty-row">
                              <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                No invoices found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredInvoices.map((invoice) => (
                              <TableRow key={invoice._id}>
                                <TableCell className="font-medium">INV-{invoice._id.substr(-6)}</TableCell>
                                <TableCell>{invoice.customer}</TableCell>
                                <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                  {getStatusBadge(invoice.status)}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleViewDetails(invoice)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit Invoice
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDelete(invoice)} className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Invoice
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice {selectedItem?.id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(selectedItem)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditInvoiceOpen} onOpenChange={setIsEditInvoiceOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update invoice information
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer</label>
                  <Input 
                    value={selectedItem.customer}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      customer: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input 
                    type="date"
                    value={selectedItem.dueDate ? new Date(selectedItem.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      dueDate: e.target.value
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={selectedItem.status} 
                  onValueChange={(value) => setSelectedItem({
                    ...selectedItem,
                    status: value as 'Paid' | 'Pending' | 'Overdue'
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  value={selectedItem.notes || ''}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    notes: e.target.value
                  })}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditInvoiceOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateInvoice(selectedItem)}>
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Complete information about the invoice
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Invoice Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="font-medium">Invoice ID:</span>
                    <span>{selectedInvoice.id}</span>
                    <span className="font-medium">Date:</span>
                    <span>{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                    <span className="font-medium">Due Date:</span>
                    <span>{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</span>
                    <span className="font-medium">Status:</span>
                    <span>{getStatusBadge(selectedInvoice.status)}</span>
                    <span className="font-medium">Total Amount:</span>
                    <span>${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="font-medium">Customer:</span>
                    <span>{selectedInvoice.customer}</span>
                    <span className="font-medium">Payment Terms:</span>
                    <span>{selectedInvoice.paymentTerms || 'N/A'}</span>
                    <span className="font-medium">Payment Method:</span>
                    <span>{selectedInvoice.paymentMethod || 'N/A'}</span>
                    <span className="font-medium">Payment Date:</span>
                    <span>{selectedInvoice.paymentDate ? new Date(selectedInvoice.paymentDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Invoice Items</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedInvoice.items || []).map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.item ? item.item.name : 'Unknown'}</TableCell>
                          <TableCell>{item.item && item.item.description ? item.item.description : 'N/A'}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Notes</h3>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePrint(selectedInvoice)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleEditInvoice(selectedInvoice)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Invoice
                </Button>
                {selectedInvoice.status !== "Paid" && (
                  <Button 
                    onClick={() => markAsPaid(selectedInvoice)}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </DashboardLayout>
  );
};

export default Billing;
