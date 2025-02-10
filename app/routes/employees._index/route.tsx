// app/routes/employees/index.tsx
import { useLoaderData, useNavigate, Link } from "react-router-dom";
import type { LoaderFunction } from "@remix-run/node";
import { getDB } from "~/db/getDB";

export const loader: LoaderFunction = async () => {
  const db = await getDB();
  const employees = await db.all("SELECT * FROM employees;");
  return { employees };
};

export default function EmployeesPage() {
  const { employees } = useLoaderData<{ employees: any[] }>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Employees</h1>

      {/* Table with blue outline */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-blue-500">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-4 py-2 border border-blue-500">ID</th>
              <th className="px-4 py-2 border border-blue-500">Full Name</th>
              <th className="px-4 py-2 border border-blue-500">Email</th>
              <th className="px-4 py-2 border border-blue-500">Phone</th>
              <th className="px-4 py-2 border border-blue-500">Job Title</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="hover:bg-blue-50 cursor-pointer"
                onClick={() => navigate(`/employees/${employee.id}`)}
              >
                <td className="px-4 py-2 border border-blue-500">
                  {employee.id}
                </td>
                <td className="px-4 py-2 border border-blue-500">
                  {employee.full_name}
                </td>
                <td className="px-4 py-2 border border-blue-500">
                  {employee.email}
                </td>
                <td className="px-4 py-2 border border-blue-500">
                  {employee.phone_number}
                </td>
                <td className="px-4 py-2 border border-blue-500">
                  {employee.job_title}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Navigation Links */}
      <div className="mt-6 flex justify-center space-x-4">
        <Link to="/employees/new" className="text-blue-600 hover:underline">
          New Employee
        </Link>
        <Link to="/timesheets" className="text-blue-600 hover:underline">
          Timesheets
        </Link>
      </div>
    </div>
  );
}
