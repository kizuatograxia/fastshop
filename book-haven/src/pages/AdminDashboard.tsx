import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, BookOpen, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock Data
const data = [
    { name: 'Mon', revenue: 4000, orders: 24 },
    { name: 'Tue', revenue: 3000, orders: 18 },
    { name: 'Wed', revenue: 2000, orders: 12 },
    { name: 'Thu', revenue: 2780, orders: 30 },
    { name: 'Fri', revenue: 1890, orders: 20 },
    { name: 'Sat', revenue: 2390, orders: 25 },
    { name: 'Sun', revenue: 3490, orders: 35 },
];

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    fetch('/api/stats', {
                        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
                    }),
                    fetch('/api/orders', {
                        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
                    })
                ]);
                const statsData = await statsRes.ok ? await statsRes.json() : {};
                const ordersData = await ordersRes.ok ? await ordersRes.json() : [];

                if (isMounted) {
                    setStats(statsData);
                    setRecentOrders(Array.isArray(ordersData) ? ordersData : []);
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                if (isMounted) {
                    setRecentOrders([]); // Fallback
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDashboardData();

        // Polling interval every 5 seconds for real-time updates
        const intervalId = setInterval(fetchDashboardData, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    if (loading && !stats) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    const chartData = stats?.chartData || data;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                    <p className="text-gray-500 mt-2">Overview of your store's performance.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">Download Report</Button>
                    <Button>Settings</Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Live from database
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Orders
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Processed successfully
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Books Sold (Units)
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUnitsSold || 0}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            From successful orders
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Library Titles
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalInventoryBooks || 0}</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" />
                            Total items in store
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Revenue Over Time</CardTitle>
                        <CardDescription>
                            Daily revenue for the past 7 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#111827' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Orders by Day</CardTitle>
                        <CardDescription>
                            Number of orders processed daily.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                    <Bar dataKey="orders" fill="#1e293b" radius={[4, 4, 0, 0]} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-gray-500" />
                            Recent Orders
                        </CardTitle>
                        <CardDescription>Latest 20 orders from the store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {recentOrders.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No orders yet.</p>
                            ) : (
                                recentOrders.map((order, i) => (
                                    <div key={order.id} className="flex items-center gap-4 text-sm border-b pb-3 last:border-0 last:pb-0">
                                        <div className={`h-2 w-2 rounded-full ${order.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{order.customerName}</p>
                                            <p className="text-xs text-gray-500">
                                                {order.paymentMethod} • ${order.totalAmount.toFixed(2)} • {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
