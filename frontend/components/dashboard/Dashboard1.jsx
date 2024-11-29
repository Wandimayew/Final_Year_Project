"use client"

// pages/dashboard.js
import { useState } from 'react';
import Link from 'next/link';
import { 
  FiGrid, 
  FiBook, 
  FiPlus, 
  FiDollarSign,
  FiClock,
  FiPackage,
  FiPlusCircle,
  FiSettings,
  FiMenu,
  FiUser
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const subscriptionData = [
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 0 },
  { month: 'Apr', amount: 0 },
  { month: 'May', amount: 0 },
  { month: 'Jun', amount: 0 },
  { month: 'Jul', amount: 0 },
  { month: 'Aug', amount: 0 },
  { month: 'Sep', amount: 0 },
  { month: 'Oct', amount: 0 },
  { month: 'Nov', amount: 1200 },
  { month: 'Dec', amount: 0 },
];

const Dashboard1 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen top-20 relative bg-gray-50 p-6">     

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-30 px-8">
        <div className="mb-8 bg-white p-3 rounded-md">
          <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
          <p className="text-gray-600">Home / Dashboard</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Schools</h3>
              <button>−</button>
            </div>
            <div className="flex items-center">
              <div>
                <h4 className="text-4xl font-bold mb-2">4</h4>
                <p className="text-gray-600">Total Schools</p>
              </div>
              <div className="ml-auto">
                <div className="bg-blue-100 p-4 rounded-full">
                  <FiBook className="text-blue-500" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Subscription</h3>
              <button>−</button>
            </div>
            <div className="flex items-center">
              <div>
                <h4 className="text-4xl font-bold mb-2">1</h4>
                <p className="text-gray-600">Total Active Subscription</p>
              </div>
              <div className="ml-auto">
                <div className="bg-yellow-100 p-4 rounded-full">
                  <FiDollarSign className="text-yellow-500" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Subscription Payment</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={subscriptionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#00bcd4"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ icon, text, active }) => (
  <Link href="#" className={`flex items-center space-x-3 p-2 rounded mb-2 ${active ? 'bg-blue-500' : 'hover:bg-gray-700'}`}>
    {icon}
    <span>{text}</span>
  </Link>
);

export default Dashboard1;