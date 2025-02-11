import { useLoaderData, useNavigate, Link } from "react-router-dom";
import type { LoaderFunction } from "@remix-run/node";
import { getDB } from "~/db/getDB";

export const loader: LoaderFunction = async ({ params }) => {
  const db = await getDB();
  const employee = await db.get(
    "SELECT id, full_name FROM employees WHERE id = ?",
    [params.employeeId]
  );
  if (!employee) {
    throw new Response("Employee not found", { status: 404 });
  }
  const timesheets = await db.all(
    "SELECT * FROM timesheets WHERE employee_id = ? ORDER BY id DESC",
    [params.employeeId]
  );
  return { employee, timesheets };
};

export default function EmployeeTimesheetsPage() {
  const { employee, timesheets } = useLoaderData<{
    employee: any;
    timesheets: any[];
  }>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Timesheets for {employee.full_name}
        </h1>
        <div className="flex space-x-4">
          <Link to="/employees" className="text-blue-600 hover:underline">
            Employees
          </Link>
          <Link to="/timesheets" className="text-blue-600 hover:underline">
            All Timesheets
          </Link>
          <Link
            to={`/employees/${employee.id}/timesheets/new`}
            className="text-blue-600 hover:underline"
          >
            New Timesheet
          </Link>
        </div>
      </div>
      {/* Timesheet Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-blue-500">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-4 py-2 border border-blue-500">ID</th>
              <th className="px-4 py-2 border border-blue-500">Start Time</th>
              <th className="px-4 py-2 border border-blue-500">End Time</th>
              <th className="px-4 py-2 border border-blue-500">Summary</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map((ts) => (
              <tr
                key={ts.id}
                className="hover:bg-blue-50 cursor-pointer"
                onClick={() => navigate(`/timesheets/${ts.id}`)}
              >
                <td className="px-4 py-2 border border-blue-500">{ts.id}</td>
                <td className="px-4 py-2 border border-blue-500">
                  {ts.start_time}
                </td>
                <td className="px-4 py-2 border border-blue-500">
                  {ts.end_time}
                </td>
                <td className="px-4 py-2 border border-blue-500">
                  {ts.summary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
