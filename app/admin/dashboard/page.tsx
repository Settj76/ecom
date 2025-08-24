import { DollarSign, Users, ShoppingBag, CreditCard } from 'lucide-react';
import pb from '@/lib/pocketbase'; // Assuming you have your pocketbase client setup

/**
 * --- MOCK DATA FETCHING FUNCTIONS ---
 * In a real application, these functions would fetch live data from your PocketBase collections.
 * For now, they return mock data to illustrate the dashboard's structure.
 * You would replace the logic inside with actual `pb.collection(...)` calls.
 */

// Fetches summary statistics for the dashboard cards.
async function getSummaryStats() {
    // Example of what a real implementation could look like:
    // const totalRevenue = await pb.collection('orders').getFullList({ filter: 'status = "completed"' });
    // const userCount = await pb.collection('users').getList(1, 1);
    // return { totalRevenue: ..., newUserCount: ..., totalOrders: ..., pendingTopups: ... };
    return {
        totalRevenue: 71897,
        newUserCount: 24,
        totalOrders: 1320,
        pendingTopups: 3,
    };
}

// Fetches a list of recent orders.
async function getRecentOrders() {
    // Example of a real implementation:
    // const orders = await pb.collection('orders').getList(1, 5, { sort: '-created', expand: 'user' });
    // return orders.items;
    return [
        { id: 'ORD-001', user: { name: 'John Doe' }, total: 150.00, status: 'Completed', created: new Date().toISOString() },
        { id: 'ORD-002', user: { name: 'Jane Smith' }, total: 45.50, status: 'Processing', created: new Date().toISOString() },
        { id: 'ORD-003', user: { name: 'Sam Wilson' }, total: 89.99, status: 'Completed', created: new Date().toISOString() },
        { id: 'ORD-004', user: { name: 'Alice Brown' }, total: 250.00, status: 'Shipped', created: new Date().toISOString() },
        { id: 'ORD-005', user: { name: 'Bob Johnson' }, total: 12.00, status: 'Cancelled', created: new Date().toISOString() },
    ];
}


/**
 * --- STAT CARD COMPONENT ---
 * A reusable component to display a single statistic on the dashboard.
 */
const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description: string }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-slate-100 text-slate-600">
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">{description}</p>
        </div>
    );
};


/**
 * --- ADMIN DASHBOARD PAGE ---
 * This is an async Server Component that fetches and displays dashboard data.
 */
export default async function Page() {
    const stats = await getSummaryStats();
    const recentOrders = await getRecentOrders();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

            {/* Grid of statistics cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    description="All-time sales"
                />
                <StatCard
                    title="New Users"
                    value={`+${stats.newUserCount}`}
                    icon={Users}
                    description="In the last 30 days"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    description="All-time orders"
                />
                <StatCard
                    title="Pending Top-ups"
                    value={stats.pendingTopups}
                    icon={CreditCard}
                    description="Awaiting approval"
                />
            </div>

            {/* Section for recent orders */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {recentOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
