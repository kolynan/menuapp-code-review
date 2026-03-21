import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function OrderDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    const { data: orders, isLoading: isLoadingOrder } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => base44.entities.Order.filter({ id: orderId }),
        enabled: !!orderId
    });

    const order = orders?.[0];

    const { data: items, isLoading: isLoadingItems } = useQuery({
        queryKey: ['orderItems', orderId],
        queryFn: () => base44.entities.OrderItem.filter({ order: orderId }),
        enabled: !!orderId
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'accepted': return 'bg-indigo-100 text-indigo-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'ready': return 'bg-green-100 text-green-800';
            case 'served': return 'bg-gray-100 text-gray-800';
            case 'closed': return 'bg-gray-200 text-gray-600';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    if (!orderId) return <div className="p-8">No order ID provided</div>;
    if (isLoadingOrder) return <div className="p-8 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading order...</div>;
    if (!order) return <div className="p-8">Order not found</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <Link to="/orderslist">
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
                </Button>
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Order #{order.order_number}</h1>
                    <p className="text-slate-500 mt-1">
                        Placed on {order.created_date ? format(new Date(order.created_date), 'PPP p') : '-'}
                    </p>
                </div>
                <Badge variant="secondary" className={getStatusColor(order.status) + " text-lg px-4 py-1"}>
                    {order.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Order Type</span>
                            <span className="font-medium capitalize">{order.order_type}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Payment Status</span>
                            <span className="font-medium capitalize">{order.payment_status}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Partner ID</span>
                            <span className="font-medium text-sm">{order.partner || '-'}</span>
                        </div>
                        {order.comment && (
                             <div className="pt-1">
                                <span className="text-slate-500 block text-sm mb-1">Order Comment</span>
                                <p className="text-sm bg-slate-50 p-2 rounded">{order.comment}</p>
                             </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Name</span>
                            <span className="font-medium">{order.client_name || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Phone</span>
                            <span className="font-medium">{order.client_phone || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">Email</span>
                            <span className="font-medium">{order.client_email || '-'}</span>
                        </div>
                        {order.delivery_address && (
                             <div className="pt-1">
                                <span className="text-slate-500 block text-sm mb-1">Delivery Address</span>
                                <p className="text-sm bg-slate-50 p-2 rounded">{order.delivery_address}</p>
                             </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Dish</TableHead>
                                <TableHead>Comment</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingItems ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Loading items...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : items && items.length > 0 ? (
                                items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.dish_name}</TableCell>
                                        <TableCell className="text-slate-500 text-sm">{item.comment || '-'}</TableCell>
                                        <TableCell className="text-right text-slate-600">${Number(item.dish_price).toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                                        <TableCell className="text-right font-bold">${Number(item.line_total).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-slate-500">No items found for this order.</TableCell></TableRow>
                            )}
                            <TableRow className="bg-slate-50/50 font-bold border-t-2">
                                <TableCell colSpan={4} className="text-right text-lg align-middle">Total Amount</TableCell>
                                <TableCell className="text-right text-xl text-indigo-600">${Number(order.total_amount).toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
