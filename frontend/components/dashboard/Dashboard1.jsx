"use client";
import { useMemo } from "react";
import { FiBook, FiDollarSign, FiUsers } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSchoolCount } from "@/lib/api/tenantService/school";
import { useUserCounts } from "@/lib/api/userManagementService/user";
import { useAuthStore } from "@/lib/auth";

const subscriptionData = [
  { month: "Jan", amount: 0 },
  { month: "Feb", amount: 0 },
  { month: "Mar", amount: 0 },
  { month: "Apr", amount: 0 },
  { month: "May", amount: 0 },
  { month: "Jun", amount: 0 },
  { month: "Jul", amount: 0 },
  { month: "Aug", amount: 0 },
  { month: "Sep", amount: 0 },
  { month: "Oct", amount: 0 },
  { month: "Nov", amount: 1200 },
  { month: "Dec", amount: 0 },
];

const StatCard = ({ title, value, subtext, icon: Icon, colorScheme }) => (
  <div className="bg-white p-6 rounded-lg shadow-md transition-all hover:shadow-lg">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <button className="text-gray-400 hover:text-gray-600">−</button>
    </div>
    <div className="flex items-center">
      <div>
        <h4 className="text-3xl font-bold text-gray-900">
          {value !== undefined ? value : "Loading..."}
        </h4>
        <p className="text-gray-600 text-sm mt-1">{subtext}</p>
      </div>
      <div className={`ml-auto p-3 rounded-full ${colorScheme}`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  </div>
);

const Dashboard1 = () => {
  const authData = useMemo(() => useAuthStore.getState(), []);
  const user = authData?.user;
  const userRole = user?.roles || [];
  const schoolId = user?.schoolId;
  const isSuperAdmin = userRole.includes("ROLE_SUPERADMIN");

  // Fetch school count for super admins
  const {
    data: schoolCount,
    isLoading: schoolLoading,
    error: schoolError,
  } = useSchoolCount();

  // Fetch user counts for non-super admins
  const {
    data: userCounts,
    isLoading: userLoading,
    error: userError,
  } = useUserCounts(schoolId, {
    enabled: !isSuperAdmin && !!schoolId,
  });

  const totalUsers = useMemo(() => {
    if (!userCounts) return 0;
    return (
      (userCounts.students || 0) +
      (userCounts.teachers || 0) +
      (userCounts.parents || 0) +
      (userCounts.staff || 0)
    );
  }, [userCounts]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600 text-sm">Home / Dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isSuperAdmin ? (
            <StatCard
              title="Schools"
              value={
                schoolLoading
                  ? undefined
                  : schoolError
                  ? "Error"
                  : schoolCount?.activeCount
              }
              subtext="Total Active Schools"
              icon={FiBook}
              colorScheme="bg-blue-500"
            />
          ) : (
            <>
              <StatCard
                title="Students"
                value={
                  userLoading
                    ? undefined
                    : userError
                    ? "Error"
                    : userCounts?.students
                }
                subtext="Total Students"
                icon={FiUsers}
                colorScheme="bg-green-500"
              />
              <StatCard
                title="Teachers"
                value={
                  userLoading
                    ? undefined
                    : userError
                    ? "Error"
                    : userCounts?.teachers
                }
                subtext="Total Teachers"
                icon={FiUsers}
                colorScheme="bg-purple-500"
              />
              <StatCard
                title="Parents"
                value={
                  userLoading
                    ? undefined
                    : userError
                    ? "Error"
                    : userCounts?.parents
                }
                subtext="Total Parents"
                icon={FiUsers}
                colorScheme="bg-orange-500"
              />
              <StatCard
                title="Staff"
                value={
                  userLoading
                    ? undefined
                    : userError
                    ? "Error"
                    : userCounts?.staff
                }
                subtext="Total Staff"
                icon={FiUsers}
                colorScheme="bg-teal-500"
              />
              <StatCard
                title="All Users"
                value={
                  userLoading ? undefined : userError ? "Error" : totalUsers
                }
                subtext="Total Users"
                icon={FiUsers}
                colorScheme="bg-indigo-500"
              />
            </>
          )}

          <StatCard
            title="Subscription"
            value="1"
            subtext="Total Active Subscriptions"
            icon={FiDollarSign}
            colorScheme="bg-yellow-500"
          />
        </div>

        {/* Chart */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-800 mb-4">
            Subscription Payment
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subscriptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#00bcd4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard1;
