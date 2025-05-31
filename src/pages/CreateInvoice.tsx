import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCustomers } from "@/redux/slices/customerSlice";
import { fetchInventory } from "@/redux/slices/inventorySlice";
import { addInvoice } from "@/redux/slices/billingSlice";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

// Remove these hardcoded arrays as we'll fetch real data
// const customers = [...]
// const products = [...]

type InvoiceItem = {
  id?: string;  // Local ID for frontend management
  productId: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
};

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const CreateInvoice = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [customer, setCustomer] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [paymentTerms, setPaymentTerms] = useState("net30");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Get customers and inventory items from Redux store
  const { customers } = useAppSelector((state) => state.customers);
  const { items: inventoryItems } = useAppSelector((state) => state.inventory);

  // Fetch customers and inventory items on component mount
  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchInventory());
  }, [dispatch]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: generateUniqueId(),
      productId: "",
      description: "",
      quantity: 1,
      price: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If we're updating a product, set the description and price automatically
        if (field === 'productId') {
          const selectedProduct = inventoryItems.find(p => p._id === value);
          if (selectedProduct) {
            updatedItem.description = selectedProduct.name;
            updatedItem.price = selectedProduct.price;
          }
        }
        
        // Recalculate total whenever quantity or price changes
        if (field === 'quantity' || field === 'price' || field === 'productId') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.07; // Assuming 7% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer) {
      toast({
        title: "Missing customer",
        description: "Please select a customer for this invoice.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    // Check for incomplete items
    const incompleteItems = items.filter(
      item => !item.productId || item.quantity <= 0
    );

    if (incompleteItems.length > 0) {
      toast({
        title: "Incomplete items",
        description: "Please complete all item details before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Format items for the backend
      const formattedItems = items.map(item => ({
        item: item.productId, // MongoDB ID of the inventory item
        quantity: item.quantity,
        price: item.price
      }));

      // Calculate total amount
      const totalAmount = formattedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

      // Create invoice data
      const invoiceData = {
        customer: customer, // This is the customer's MongoDB ID
        date: new Date().toISOString(),
        dueDate: dueDate,
        amount: totalAmount,
        status: 'Pending' as const, // Type assertion to match the enum
        items: formattedItems,
        notes: notes,
        paymentTerms: paymentTerms
      };

      console.log('Submitting invoice data:', invoiceData);

      // Dispatch the addInvoice action
      await dispatch(addInvoice(invoiceData)).unwrap();

      const selectedCustomer = customers.find(c => c._id === customer);
      toast({
        title: "Invoice created",
        description: `Invoice for ${selectedCustomer?.name || 'Unknown'} has been created successfully.`,
      });
      
      navigate("/billing");
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error creating invoice",
        description: error.message || "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="relative p-6 space-y-6">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0 bg-paint-colorful bg-cover bg-center opacity-10 dark:opacity-5"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <FileText className="mr-2" /> Create New Invoice
              </h1>
              <p className="text-muted-foreground mt-1">
                Fill in the details to create a new invoice for NT Color House
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate("/billing")}>
                Cancel
              </Button>
              <Button className="bg-primary" onClick={handleSubmit}>
                Create Invoice
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Customer and Invoice Details */}
            <Card className="lg:col-span-1 paint-card">
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>
                  Enter the basic invoice information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={customer} onValueChange={setCustomer}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={format(new Date(), "yyyy-MM-dd")}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <RadioGroup
                    value={paymentTerms}
                    onValueChange={setPaymentTerms}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="net15" id="net15" />
                      <Label htmlFor="net15">Net 15 Days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="net30" id="net30" />
                      <Label htmlFor="net30">Net 30 Days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="net60" id="net60" />
                      <Label htmlFor="net60">Net 60 Days</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card className="lg:col-span-2 paint-card">
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
                <CardDescription>
                  Add the products or services for this invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-12 sm:col-span-4">
                      <Select
                        value={item.productId}
                        onValueChange={(value) => updateItem(item.id, 'productId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((product) => (
                            <SelectItem
                              key={product._id}
                              value={product._id}
                            >
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-3">
                      <div className="text-right font-medium">
                        ${item.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={addItem}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Item
                </Button>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (7%):</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="lg:col-span-3 paint-card">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes or payment instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t p-4">
                <Button variant="outline" onClick={() => navigate("/billing")}>
                  Cancel
                </Button>
                <Button className="bg-primary" onClick={handleSubmit}>
                  Create Invoice
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateInvoice;
