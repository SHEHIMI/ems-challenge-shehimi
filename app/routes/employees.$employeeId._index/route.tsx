import { useLoaderData } from "react-router-dom";
import type { LoaderFunction } from "@remix-run/node";

// Loader functionse
export const loader: LoaderFunction = async ({ params }) => {
  const { getDB } = await import("~/db/getDB");
  const db = await getDB();

  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [
    params.employeeId,
  ]);

  if (!employee) {
    throw new Response("Employee not found", { status: 404 });
  }

  return { employee };
};

export default function EmployeePage() {
  // Retrieve employeefrom loader
  const { employee } = useLoaderData<{ employee: any }>();

  return (
    <div className="container mx-auto p-4">
      {/* Card Container */}
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">{employee.full_name}</h2>
          <p className="text-gray-700 mb-2">
            <strong>Email:</strong> {employee.email}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Phone:</strong> {employee.phone_number}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Date of Birth:</strong> {employee.date_of_birth}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Job Title:</strong> {employee.job_title}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Department:</strong> {employee.department}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Salary:</strong> ${employee.salary}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Start Date:</strong> {employee.start_date}
          </p>
          {employee.end_date && (
            <p className="text-gray-700 mb-2">
              <strong>End Date:</strong> {employee.end_date}
            </p>
          )}
          <p className="text-gray-700 mb-2">
            <strong>Father's Name:</strong> {employee.father_name}
          </p>
        </div>
        {/* Images Section */}
        <div className="flex flex-col md:flex-row">
          {employee.photo && (
            <div className="w-full md:w-1/2 p-4">
              <img
                src={employee.photo}
                alt={`${employee.full_name} Photo`}
                className="object-cover w-full h-48 rounded-lg"
              />
              <p className="text-center mt-2 font-medium">Photo</p>
            </div>
          )}
          {employee.cv && (
            <div className="w-full md:w-1/2 p-4">
              <img
                src={employee.cv}
                alt={`${employee.full_name} CV`}
                className="object-cover w-full h-48 rounded-lg"
              />
              <p className="text-center mt-2 font-medium">CV Document</p>
            </div>
          )}
        </div>
      </div>
      {/* Navigation Links */}
      <ul className="flex space-x-4 mt-6 justify-center">
        <li>
          <a href="/employees" className="text-blue-600 hover:underline">
            Employees
          </a>
        </li>
        <li>
          <a href="/employees/new" className="text-blue-600 hover:underline">
            New Employee
          </a>
        </li>
        <li>
          <a href="/timesheets" className="text-blue-600 hover:underline">
            Timesheets
          </a>
        </li>
      </ul>
    </div>
  );
}
