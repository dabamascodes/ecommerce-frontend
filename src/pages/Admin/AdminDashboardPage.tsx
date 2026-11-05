import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Users, 
  ClipboardList, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Calendar,
  AlertOctagon,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api, usersService } from '../../services';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
  });

  const [salesByMonth, setSalesByMonth] = useState<Array<{ month: string; revenue: number; orders: number }>>([]);
  const [lowStockList, setLowStockList] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, ordersRes, usersData] = await Promise.all([
        api.get<any>('/products', { params: { limit: 500, offset: 0, includeInactive: true } }).catch(() => ({ data: [] })),
        api.get<any>('/orders/admin/all', { params: { limit: 500, offset: 0 } }).catch(() => ({ data: [] })),
        usersService.findAll().catch(() => [])
      ]);

      const prodData = productsRes.data;
      const products = Array.isArray(prodData) ? prodData : prodData.products || prodData.data || [];

      const orderData = ordersRes.data;
      const orders = Array.isArray(orderData) ? orderData : orderData.orders || orderData.data || [];

      const users = Array.isArray(usersData) ? usersData : [];

      const paidOrders = orders.filter((o: any) => o.status === 'PAID' || o.status === 'paid' || o.isPaid === true);
      const totalRevenue = paidOrders.reduce((acc: number, o: any) => acc + Number(o.total || 0), 0);

      const lowStock = products.filter((p: any) => Number(p.stock || 0) <= 5);

      const formattedRecentOrders = orders.slice(0, 5).map((o: any) => {
        const orderUser = o.user;
        const customerName = orderUser ? (orderUser.fullName || orderUser.name || orderUser.email) : 'Guest / Unnamed';
        return {
          id: o.id ? `#${String(o.id).substring(0, 8)}` : '#N/A',
          customer: customerName,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A',
          total: Number(o.total || 0),
          status: o.status || 'pending',
        };
      });

      const monthlyMap: { [key: string]: { revenue: number; orders: number } } = {};
      orders.forEach((o: any) => {
        if (o.createdAt) {
          const date = new Date(o.createdAt);
          const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { revenue: 0, orders: 0 };
          }
          if (o.status === 'PAID' || o.status === 'paid' || o.isPaid === true) {
            monthlyMap[monthKey].revenue += Number(o.total || 0);
          }
          monthlyMap[monthKey].orders += 1;
        }
      });

      const formattedSalesByMonth = Object.keys(monthlyMap).map((month) => ({
        month,
        revenue: monthlyMap[month].revenue,
        orders: monthlyMap[month].orders,
      }));

      setStats({
        totalRevenue,
        completedOrders: paidOrders.length,
        totalUsers: users.length,
        lowStockProducts: lowStock.length,
      });

      setLowStockList(lowStock);
      setRecentOrders(formattedRecentOrders);
      setSalesByMonth(formattedSalesByMonth);

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load dashboard metrics';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Synchronizing with live database records...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">
            Control panel synchronized with live database records.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
              ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <span className="inline-flex items-center text-xs font-medium text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Verified payments
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Completed Orders</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.completedOrders}</h3>
            <span className="text-xs text-gray-400 mt-2 block">Paid orders</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Registered Users</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.totalUsers}</h3>
            <span className="text-xs text-gray-400 mt-2 block">System accounts</span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Low Stock Alert</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats.lowStockProducts}</h3>
            <span className="inline-flex items-center text-xs font-medium text-amber-600 mt-2">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Stock &le; 5
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sales Analytics Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-2">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Sales Analytics by Month & Year
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Historical revenue distribution based on actual orders</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" /> Live Database Active
          </div>
        </div>

        {salesByMonth.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No transactions registered to display in the chart.
          </div>
        ) : (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-6 gap-4">
            {salesByMonth.map((item, index) => {
              const maxRevenue = Math.max(...salesByMonth.map(s => s.revenue), 100);
              const heightPercentage = Math.min(Math.round((item.revenue / maxRevenue) * 100), 100);

              return (
                <div key={index} className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 flex flex-col justify-between items-center text-center">
                  <span className="text-xs font-bold text-indigo-600">${item.revenue.toLocaleString()}</span>
                  <div className="w-full bg-gray-200 rounded-full h-32 my-3 flex items-end p-1">
                    <div 
                      className="w-full bg-indigo-600 rounded-full transition-all duration-500" 
                      style={{ height: `${heightPercentage}%` }}
                      title={`${item.orders} orders`}
                    ></div>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-800">{item.month}</span>
                    <span className="text-[10px] text-gray-400">{item.orders} orders</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-amber-50/40">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-gray-900">Low Stock Inventory Warning</h3>
              <p className="text-xs text-gray-500 mt-0.5">Critical inventory in database</p>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
            {lowStockList.length} Alerts
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {lowStockList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 text-xs">
                    No products with low stock.
                  </td>
                </tr>
              ) : (
                lowStockList.map((product) => (
                  <tr key={product.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{product.name || product.title}</td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-xs">{product.sku || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-gray-600">{product.category?.name || product.category || 'General'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        {product.stock} units
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
            <p className="text-xs text-gray-500 mt-0.5">Latest transactions recorded on the server</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400 text-xs">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-indigo-600 font-mono text-xs">{order.id}</td>
                    <td className="py-3.5 px-4 text-gray-800">{order.customer}</td>
                    <td className="py-3.5 px-4 text-gray-500">{order.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        order.status === 'paid' || order.status === 'PAID'
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};