import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, AlertCircle } from "lucide-react";
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
        new:         t('orders_list.status.new'),
        accepted:    t('orders_list.status.accepted'),
        in_progress: t('orders_list.status.in_progress'),
        ready:       t('orders_list.status.ready'),
        served:      t('orders_list.status.served'),
        closed:      t('orders_list.status.closed'),
        cancelled:   t('orders_list.status.cancelled'),
    };
    return labels[status] ?? status;
};

const getTypeLabel = (type, t) => {
    const labels = {
        hall:     t('orders_list.type.hall'),
        pickup:   t('orders_list.type.pickup'),
        delivery: t('orders_list.type.delivery'),
    };
    return labels[type] ?? type;
};

export default function OrdersList() {
    const { t } = useI18n();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("all");
    const navigate = useNavigate();

    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => base44.auth.me(),
        retry: false
    });

    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ['orders'],
        queryFn: () => base44.entities.Order.list('-created_date', 100),
    });

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (
            (order.order_number && String(order.order_number).toLowerCase().includes(search.toLowerCase())) ||
            (order.client_name && String(order.client_name).toLowerCase().includes(search.toLowerCase()))
        );
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        const matchesType = typeFilter === "all" || order.order_type === typeFilter;

        const matchesTab = activeTab === 'all' || (activeTab === 'mine' && currentUser && order.created_by === currentUser.email);

        return matchesSearch && matchesStatus && matchesType && matchesTab;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('orders_list.title')}</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {t('orders_list.description')}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 text-sm font-medium transition-all border-b-2 ${
                        activeTab === 'all'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    {t('orders_list.tab.all')}
                </button>
                <button
                    onClick={() => setActiveTab('mine')}
                    className={`pb-3 text-sm font-medium transition-all border-b-2 ${
                        activeTab === 'mine'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    {t('orders_list.tab.mine')}
                </button>
            </div>

            <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder={t('orders_list.search.placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder={t('orders_list.filter.status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('orders_list.filter.all_status')}</SelectItem>
                            <SelectItem value="new">{t('orders_list.status.new')}</SelectItem>
                            <SelectItem value="accepted">{t('orders_list.status.accepted')}</SelectItem>
                            <SelectItem value="in_progress">{t('orders_list.status.in_progress')}</SelectItem>
                            <SelectItem value="ready">{t('orders_list.status.ready')}</SelectItem>
                            <SelectItem value="served">{t('orders_list.status.served')}</SelectItem>
                            <SelectItem value="closed">{t('orders_list.status.closed')}</SelectItem>
                            <SelectItem value="cancelled">{t('orders_list.status.cancelled')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder={t('orders_list.filter.type')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('orders_list.filter.all_types')}</SelectItem>
                            <SelectItem value="hall">{t('orders_list.type.hall')}</SelectItem>
                            <SelectItem value="pickup">{t('orders_list.type.pickup')}</SelectItem>
                            <SelectItem value="delivery">{t('orders_list.type.delivery')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('orders_list.header.order_number')}</TableHead>
                                <TableHead>{t('orders_list.header.date')}</TableHead>
                                <TableHead>{t('orders_list.header.client')}</TableHead>
                                <TableHead>{t('orders_list.header.type')}</TableHead>
                                <TableHead>{t('orders_list.header.status')}</TableHead>
                                <TableHead className="text-right">{t('orders_list.header.total')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isError ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-red-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {t('orders_list.error.load_failed')}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {t('common.loading')}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        {activeTab === 'mine' ? t('orders_list.empty.mine') : t('orders_list.empty.all')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => navigate(createPageUrl(`OrderDetails?id=${order.id}`))}
                                    >
                                        <TableCell className="font-medium text-indigo-600">{order.order_number || '-'}</TableCell>
                                        <TableCell>
                                            {order.created_date ? format(new Date(order.created_date), 'PP p') : '-'}
                                        </TableCell>
                                        <TableCell>{order.client_name || t('orders_list.client.guest')}</TableCell>
                                        <TableCell>{getTypeLabel(order.order_type, t)}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={getStatusColor(order.status)}>
                                                {getStatusLabel(order.status, t)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${Number(order.total_amount ?? 0).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
