import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
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
import { useI18n } from "@/components/i18n";

const getStatusColor = (status) => {
    const colors = {
        new:         'bg-blue-100 text-blue-800',
        accepted:    'bg-indigo-100 text-indigo-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        ready:       'bg-green-100 text-green-800',
        served:      'bg-gray-100 text-gray-800',
        closed:      'bg-gray-200 text-gray-600',
        cancelled:   'bg-red-100 text-red-800',
    };
    return colors[status] ?? 'bg-slate-100 text-slate-800';
};

const getStatusLabel = (status, t) => {
    const labels = {
        new:         t('order_details.status.new'),
        accepted:    t('order_details.status.accepted'),
        in_progress: t('order_details.status.in_progress'),
        ready:       t('order_details.status.ready'),
        served:      t('order_details.status.served'),
        closed:      t('order_details.status.closed'),
        cancelled:   t('order_details.status.cancelled'),
    };
    return labels[status] ?? status;
};

const formatPrice = (value) => Number(value ?? 0).toFixed(2);

export default function OrderDetails() {
    const { t } = useI18n();
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    const { data: orders, isLoading: isLoadingOrder, isError: isOrderError } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => base44.entities.Order.filter({ id: orderId }),
        enabled: !!orderId
    });

    const order = orders?.[0];

    const { data: items, isLoading: isLoadingItems, isError: isItemsError } = useQuery({
        queryKey: ['orderItems', orderId],
        queryFn: () => base44.entities.OrderItem.filter({ order: orderId }),
        enabled: !!orderId
    });

    if (!orderId) return <div className="p-8">{t('order_details.error.no_id')}</div>;
    if (isLoadingOrder) return <div className="p-8 flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div>;
    if (isOrderError) return (
        <div className="p-8 flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" /> {t('order_details.error.load_failed')}
        </div>
    );
    if (!order) return <div className="p-8">{t('order_details.error.not_found')}</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <Link to="/orderslist">
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t('order_details.back_to_orders')}
                </Button>
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('order_details.title')} #{order.order_number}</h1>
                    <p className="text-slate-500 mt-1">
                        {t('order_details.placed_on')} {order.created_date ? format(new Date(order.created_date), 'PPP p') : '-'}
                    </p>
                </div>
                <Badge variant="secondary" className={getStatusColor(order.status) + " text-lg px-4 py-1"}>
                    {getStatusLabel(order.status, t)}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">{t('order_details.card.order_info')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">{t('order_details.field.order_type')}</span>
                            <span className="font-medium capitalize">{order.order_type}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">{t('order_details.field.payment_status')}</span>
                            <span className="font-medium capitalize">{order.payment_status}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">{t('order_details.field.partner_id')}</span>
                            <span className="font-medium text-sm">{order.partner || '-'}</span>
                        </div>
                        {order.comment && (
                             <div className="pt-1">
                                <span className="text-slate-500 block text-sm mb-1">{t('order_details.field.comment')}</span>
                                <p className="text-sm bg-slate-50 p-2 rounded">{order.comment}</p>
                             </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">{t('order_details.card.client_info')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">{t('order_details.field.name')}</span>
                            <span className="font-medium">{order.client_name || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">{t('order_details.field.phone')}</span>
                            <span className="font-medium">{order.client_phone || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-slate-500">{t('order_details.field.email')}</span>
                            <span className="font-medium">{order.client_email || '-'}</span>
                        </div>
                        {order.delivery_address && (
                             <div className="pt-1">
                                <span className="text-slate-500 block text-sm mb-1">{t('order_details.field.delivery_address')}</span>
                                <p className="text-sm bg-slate-50 p-2 rounded">{order.delivery_address}</p>
                             </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('order_details.card.order_items')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">{t('order_details.table.dish')}</TableHead>
                                <TableHead>{t('order_details.table.comment')}</TableHead>
                                <TableHead className="text-right">{t('order_details.table.price')}</TableHead>
                                <TableHead className="text-right">{t('order_details.table.qty')}</TableHead>
                                <TableHead className="text-right">{t('order_details.table.total')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingItems ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> {t('common.loading')}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : isItemsError ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-red-500">
                                        {t('order_details.error.items_load_failed')}
                                    </TableCell>
                                </TableRow>
                            ) : items && items.length > 0 ? (
                                items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.dish_name}</TableCell>
                                        <TableCell className="text-slate-500 text-sm">{item.comment || '-'}</TableCell>
                                        <TableCell className="text-right text-slate-600">${formatPrice(item.dish_price)}</TableCell>
                                        <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                                        <TableCell className="text-right font-bold">${formatPrice(item.line_total)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-slate-500">{t('order_details.items.empty')}</TableCell></TableRow>
                            )}
                            <TableRow className="bg-slate-50/50 font-bold border-t-2">
                                <TableCell colSpan={4} className="text-right text-lg align-middle">{t('order_details.total_amount')}</TableCell>
                                <TableCell className="text-right text-xl text-indigo-600">${formatPrice(order.total_amount)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
