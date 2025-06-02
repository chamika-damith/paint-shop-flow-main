"use client";

import { useEffect, useState } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/config";

interface Order {
  _id: string;
  date: string;
  amount: number;
  status: string;
  items?: any[];
}

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Updated API endpoint to match the backend route
        const res = await api.get(`/customers/${user.email}/orders`);
        const data = res.data;
        console.log(data);
        
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error('Unexpected response format:', data);
          toast({
            title: 'Unexpected Response',
            description: 'Order data was not in the expected format.',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        const errorMessage = err.response?.data?.message || 'Failed to fetch order history.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatAmount = (amount: number) => {
    return typeof amount === 'number' ? amount.toFixed(2) : '0.00';
  };

  const getProductNames = (items: any[]) => {
    if (!Array.isArray(items) || items.length === 0) {
      return 'No items';
    }
    return items
      .map(item => item.name || item.item?.name || 'Unknown item')
      .filter(name => name !== 'Unknown item')
      .join(', ') || 'No product details';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Product</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((order, idx) => (
                <TableRow key={order._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>${formatAmount(order.amount)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{getProductNames(order.items)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}