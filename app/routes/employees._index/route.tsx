import { useLoaderData, useNavigate, Link } from "react-router-dom";
import type { LoaderFunction } from "@remix-run/node";
import { getDB } from "~/db/getDB";
import { useEffect, useState } from "react";

export const loader: LoaderFunction = async () => {
  const db = await getDB();
  const employees = await db.all("SELECT * FROM employees;");
  return { employees };
};

export default function EmployeesPage() {
  const { employees } = useLoaderData<{ employees: any[] }>();
  const navigate = useNavigate();
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"id" | "full_name">("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredEmployees = employees.filter((employee) =>
    employee.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let cmp = 0;
    if (sortField === "id") {
      cmp = a.id - b.id;
    } else if (sortField === "full_name") {
      cmp = a.full_name.localeCompare(b.full_name);
    }
    return sortDirection === "asc" ? cmp : -cmp;
  });

  // Determine total pages
  const totalItems = sortedEmployees.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: "id" | "full_name") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="container mx-auto p-4">
      {/* Navigation */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">EMS</h1>
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search by full name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-blue-500 rounded-md p-2"
          />
          <div className="flex space-x-4">
            <ul>
              <li>
                <a
                  href="/employees/new"
                  className="text-blue-600 hover:underline"
                >
                  New Employee
                </a>
              </li>
            </ul>
            <ul>
              <li>
                <a
                  href="/timesheets/new"
                  className="text-blue-600 hover:underline"
                >
                  New Timesheet
                </a>
              </li>
            </ul>
            <ul>
              <li>
                <a href="/timesheets" className="text-blue-600 hover:underline">
                  All Timesheets
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-blue-500">
          <thead>
            <tr className="bg-blue-100">
              <th
                className="px-4 py-2 border border-blue-500 cursor-pointer"
                onClick={() => handleSort("id")}
              >
                ID {sortField === "id" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="px-4 py-2 border border-blue-500 cursor-pointer"
                onClick={() => handleSort("full_name")}
              >
                Full Name{" "}
                {sortField === "full_name" &&
                  (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-4 py-2 border border-blue-500">Email</th>
              <th className="px-4 py-2 border border-blue-500">Phone</th>
              <th className="px-4 py-2 border border-blue-500">Job Title</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.map((employee) => (
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Prev
        </button>
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
