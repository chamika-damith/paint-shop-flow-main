import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, FileText, Plus, Trash2, Check } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

// Product data type
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  discount: number;
  stock: number;
}

// Order Item type
interface OrderItem {
  productId: number;
  name: string;
  price: number;
  discount: number;
  quantity: number;
}

// Customer Order type
interface Order {
  id: number;
  customerName: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: "Pending" | "Completed" | "Cancelled";
}

const Orders = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  // New order state
  const [customerName, setCustomerName] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/billing/customer/${user.email}/invoices`);
        setOrders(res.data);
      } catch (err: any) {
        toast({ title: 'Error', description: 'Failed to fetch order history', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);
  
  // Function to add item to order
  const addItemToOrder = () => {
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    // Check if product is already in order
    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += selectedQuantity;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        quantity: selectedQuantity,
      };
      setOrderItems([...orderItems, newItem]);
    }
    
    // Reset selection
    setSelectedProductId(null);
    setSelectedQuantity(1);
    
    toast({
      title: "Item Added",
      description: `${product.name} has been added to the order.`,
    });
  };
  
  // Function to remove item from order
  const removeItemFromOrder = (index: number) => {
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
  };
  
  // Calculate the discounted price
  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount / 100);
  };
  
  // Calculate order total
  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => {
      const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
      return total + (discountedPrice * item.quantity);
    }, 0);
  };
  
  // Create new order
  const handleCreateOrder = () => {
    if (!customerName.trim() || orderItems.length === 0) {
      toast({
        title: "Invalid Order",
        description: "Please enter customer name and add at least one item.",
        variant: "destructive",
      });
      return;
    }
    
    const newOrder: Order = {
      id: Math.max(0, ...orders.map(o => o.id)) + 1,
      customerName,
      items: [...orderItems],
      total: calculateOrderTotal(orderItems),
      date: new Date().toISOString().split('T')[0],
      status: "Pending",
    };
    
    setOrders([...orders, newOrder]);
    
    toast({
      title: "Order Created",
      description: `Order #${newOrder.id} for ${customerName} has been created.`,
    });
    
    // Reset form
    setCustomerName("");
    setOrderItems([]);
    setIsNewOrderDialogOpen(false);
  };
  
  // View bill for an order
  const viewBill = (order: Order) => {
    setCurrentOrder(order);
    setIsBillDialogOpen(true);
  };
  
  // Mark order as completed
  const markOrderAsCompleted = (orderId: number) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: "Completed" as const } : order
    );
    setOrders(updatedOrders);
    
    toast({
      title: "Order Completed",
      description: `Order #${orderId} has been marked as completed.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <ShoppingCart className="mr-2" /> Order Management
            </h1>
            <p className="text-gray-500 mt-1">
              Create customer orders and generate bills
            </p>
          </div>
          <Button 
            className="bg-primary"
            onClick={() => setIsNewOrderDialogOpen(true)}
          >
            <Plus className="mr-1 h-5 w-5" /> New Order
          </Button>
        </div>

        <Card className="paint-card">
          <CardHeader>
            <CardTitle>Customer Orders</CardTitle>
            <CardDescription>
              View and manage all customer orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "Completed" ? "bg-green-100 text-green-800" : 
                            order.status === "Cancelled" ? "bg-red-100 text-red-800" : 
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => viewBill(order)}
                              className="h-8"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            {order.status !== "Completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markOrderAsCompleted(order.id)}
                                className="h-8 text-green-600"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center"
                      >
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Order Dialog */}
      <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Add customer information and products to create a new order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="customerName" className="text-sm font-medium">
                Customer Name
              </label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Add Products</h4>
              <div className="flex gap-2">
                <Select
                  value={selectedProductId?.toString() || ""}
                  onValueChange={(value) => setSelectedProductId(Number(value))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - ${product.price.toFixed(2)}
                        {product.discount > 0 ? ` (-${product.discount}%)` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  className="w-20"
                />
                <Button onClick={addItemToOrder} disabled={!selectedProductId}>
                  Add
                </Button>
              </div>
            </div>

            {orderItems.length > 0 && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-[80px]">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item, index) => {
                      const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
                      const itemTotal = discountedPrice * item.quantity;
                      
                      return (
                        <TableRow key={`${item.productId}-${index}`}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            ${discountedPrice.toFixed(2)}
                            {item.discount > 0 && (
                              <span className="text-xs text-green-600 ml-1">
                                (-{item.discount}%)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">${itemTotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemFromOrder(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {orderItems.length > 0 && (
              <div className="flex justify-end gap-4 items-center">
                <span className="font-medium">Total:</span>
                <span className="text-xl font-bold">
                  ${calculateOrderTotal(orderItems).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill/Invoice Dialog */}
      <Dialog open={isBillDialogOpen} onOpenChange={setIsBillDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>
              Order #{currentOrder?.id} - {currentOrder?.date}
            </DialogDescription>
          </DialogHeader>

          {currentOrder && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h4 className="font-medium">Customer</h4>
                <p>{currentOrder.customerName}</p>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrder.items.map((item, index) => {
                      const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
                      const itemTotal = discountedPrice * item.quantity;
                      
                      return (
                        <TableRow key={`bill-${item.productId}-${index}`}>
                          <TableCell>
                            {item.name}
                            {item.discount > 0 && (
                              <div className="text-xs text-green-600">
                                Discount: {item.discount}%
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            ${discountedPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${itemTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-xl font-bold">
                      ${currentOrder.total.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-gray-500">
                Thank you for your business!
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => window.print()} className="mr-auto">
              Print Invoice
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Orders;
