import { Form, redirect, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // Required fields
  const full_name = formData.get("full_name");
  const email = formData.get("email");
  const phone_number = formData.get("phone_number");
  const date_of_birth = formData.get("date_of_birth");
  const job_title = formData.get("job_title");
  const department = formData.get("department");
  const salary = formData.get("salary");
  const start_date = formData.get("start_date");
  const father_name = formData.get("father_name");
  // Optional fields
  const end_date = formData.get("end_date");
  const cv_path = formData.get("cv_path");
  const photo_path = formData.get("photo_path");

  // Check if required fields are inserted
  if (
    !full_name ||
    !email ||
    !phone_number ||
    !date_of_birth ||
    !job_title ||
    !department ||
    !salary ||
    !start_date ||
    !father_name
  ) {
    return new Response("Missing required fields", { status: 400 });
  }

  const salaryNum = parseFloat(salary as string);
  if (isNaN(salaryNum)) {
    return new Response("Invalid salary value", { status: 400 });
  }

  const db = await getDB();
  await db.run(
    `INSERT INTO employees (
      full_name,
      email,
      phone_number,
      date_of_birth,
      job_title,
      department,
      salary,
      start_date,
      end_date,
      father_name,
      cv_path,
      photo_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      full_name,
      email,
      phone_number,
      date_of_birth,
      job_title,
      department,
      salaryNum,
      start_date,
      end_date || null,
      father_name,
      cv_path || null,
      photo_path || null,
    ]
  );

  return redirect("/employees");
};

export default function NewEmployeePage() {
  return (
    <div className="container mx-auto p-4 w-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Employee</h1>
      <Form method="post" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Full Name */}
        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            id="full_name"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="text"
            name="phone_number"
            id="phone_number"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Date of Birth */}
        <div>
          <label
            htmlFor="date_of_birth"
            className="block text-sm font-medium text-gray-700"
          >
            Date of Birth
          </label>
          <input
            type="date"
            name="date_of_birth"
            id="date_of_birth"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Job Title */}
        <div>
          <label
            htmlFor="job_title"
            className="block text-sm font-medium text-gray-700"
          >
            Job Title
          </label>
          <input
            type="text"
            name="job_title"
            id="job_title"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Department */}
        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700"
          >
            Department
          </label>
          <input
            type="text"
            name="department"
            id="department"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Salary */}
        <div>
          <label
            htmlFor="salary"
            className="block text-sm font-medium text-gray-700"
          >
            Salary
          </label>
          <input
            type="number"
            step="0.01"
            name="salary"
            id="salary"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Start Date */}
        <div>
          <label
            htmlFor="start_date"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            id="start_date"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Father's Name */}
        <div>
          <label
            htmlFor="father_name"
            className="block text-sm font-medium text-gray-700"
          >
            Father's Name
          </label>
          <input
            type="text"
            name="father_name"
            id="father_name"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Optional: End Date */}
        <div>
          <label
            htmlFor="end_date"
            className="block text-sm font-medium text-gray-700"
          >
            End Date (optional)
          </label>
          <input
            type="date"
            name="end_date"
            id="end_date"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Optional: CV Path */}
        <div>
          <label
            htmlFor="cv_path"
            className="block text-sm font-medium text-gray-700"
          >
            CV Path (optional)
          </label>
          <input
            type="text"
            name="cv_path"
            id="cv_path"
            placeholder="Path to CV file"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Optional: Photo Path */}
        <div>
          <label
            htmlFor="photo_path"
            className="block text-sm font-medium text-gray-700"
          >
            Photo Path (optional)
          </label>
          <input
            type="text"
            name="photo_path"
            id="photo_path"
            placeholder="Path to photo file"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Submit Button */}
        <div className="col-span-3 flex justify-center">
          <button
            type="submit"
            className="w-xs py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Create Employee
          </button>
        </div>
      </Form>
      <hr className="my-6" />
      <ul className="flex space-x-4">
        <li>
          <a href="/employees" className="text-blue-600 hover:underline">
            Employees
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
