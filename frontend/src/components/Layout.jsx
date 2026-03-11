import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <div className="w-60 bg-green-700 text-white p-5 space-y-4">
        <h1 className="text-2xl font-bold">WealthTrack</h1>

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/goals">Goals</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/reports">Reports</Link>
      </div>

      {/* CONTENT */}
      <div className="flex-1 bg-gray-100 p-8">
        <Outlet />
      </div>

    </div>
  );
}