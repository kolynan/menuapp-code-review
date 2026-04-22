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
import { Loader2, Search } from "lucide-react";
import { format } from "date-fns";

export default function OrdersList() {
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

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: () => base44.entities.Order.list('-created_date', 100),
        initialData: []
    });

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (
            (order.order_number && order.order_number.toLowerCase().includes(search.toLowerCase())) ||
            (order.client_name && order.client_name.toLowerCase().includes(search.toLowerCase()))
        );
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        const matchesType = typeFilter === "all" || order.order_type === typeFilter;

        const matchesTab = activeTab === 'all' || (activeTab === 'mine' && currentUser && order.created_by === currentUser.email);

        return matchesSearch && matchesStatus && matchesType && matchesTab;
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

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">История заказов</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        История заказов с фильтрами по статусу и типу. Удобно для проверки истории и отчётности.
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
                    Все заказы
                </button>
                <button
                    onClick={() => setActiveTab('mine')}
                    className={`pb-3 text-sm font-medium transition-all border-b-2 ${
                        activeTab === 'mine'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    Мои заказы
                </button>
            </div>

            <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search order # or client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="served">Served</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Order Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="hall">Hall</SelectItem>
                            <SelectItem value="pickup">Pickup</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading orders...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        {activeTab === 'mine' ? 'У тебя пока нет заказов.' : 'Нет заказов.'}
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
                                        <TableCell>{order.client_name || 'Guest'}</TableCell>
                                        <TableCell className="capitalize">{order.order_type}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${Number(order.total_amount || 0).toFixed(2)}
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
