import {
  useLoaderData,
  useActionData,
  useNavigate,
  Form,
  Link,
} from "react-router-dom";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { getDB } from "~/db/getDB";
import { useState, useEffect } from "react";

export const loader: LoaderFunction = async ({ params }) => {
  const db = await getDB();
  const timesheet = await db.get("SELECT * FROM timesheets WHERE id = ?", [
    params.timesheetId,
  ]);
  if (!timesheet) {
    throw new Response("Timesheet not found", { status: 404 });
  }
  // Fetch employees
  const employees = await db.all("SELECT id, full_name FROM employees;");
  return { timesheet, employees };
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const start_time = formData.get("start_time")?.toString().trim();
  const end_time = formData.get("end_time")?.toString().trim();
  const employee_id = formData.get("employee_id")?.toString().trim();
  const summary = formData.get("summary")?.toString().trim();

  if (!start_time || !end_time || !employee_id) {
    return new Response("Missing required fields", { status: 400 });
  }

  const startDate = new Date(start_time);
  const endDate = new Date(end_time);
  if (startDate >= endDate) {
    return new Response("Start time must be before end time", { status: 400 });
  }

  const db = await getDB();
  try {
    await db.run(
      `UPDATE timesheets SET 
          start_time = ?,
          end_time = ?,
          employee_id = ?,
          summary = ?
       WHERE id = ?`,
      [start_time, end_time, employee_id, summary || null, params.timesheetId]
    );
    return new Response("Timesheet updated successfully", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    console.error("DB Error:", error);
    return new Response(error.message, { status: 400 });
  }
};

export default function EditTimesheetPage() {
  const { timesheet, employees } = useLoaderData<{
    timesheet: any;
    employees: any[];
  }>();
  const actionData = useActionData<string>();
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState(timesheet.start_time);
  const [endTime, setEndTime] = useState(timesheet.end_time);

  // Validate times when focus leaves the time fields.
  const handleTimeBlur = () => {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (start >= end) {
        alert("Start time must be before end time");
      }
    }
  };

  useEffect(() => {
    if (actionData) {
      alert(actionData);
      if (actionData === "Timesheet updated successfully") {
        setTimeout(() => {
          navigate("/timesheets");
        }, 1000);
      }
    }
  }, [actionData, navigate]);

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Timesheet</h1>
        <div className="flex space-x-4">
          <Link to="/employees" className="text-blue-600 hover:underline">
            Employees
          </Link>
          <Link to="/timesheets" className="text-blue-600 hover:underline">
            All Timesheets
          </Link>
        </div>
      </div>
      <Form method="post" className="grid grid-cols-1 gap-6">
        <div>
          <label
            htmlFor="start_time"
            className="block text-md font-medium text-gray-700"
          >
            Start Time
          </label>
          <input
            type="datetime-local"
            name="start_time"
            id="start_time"
            required
            defaultValue={timesheet.start_time}
            onChange={(e) => setStartTime(e.target.value)}
            onBlur={handleTimeBlur}
            className="mt-1 block w-full border border-blue-500 rounded-md p-2"
          />
        </div>
        <div>
          <label
            htmlFor="end_time"
            className="block text-md font-medium text-gray-700"
          >
            End Time
          </label>
          <input
            type="datetime-local"
            name="end_time"
            id="end_time"
            required
            defaultValue={timesheet.end_time}
            onChange={(e) => setEndTime(e.target.value)}
            onBlur={handleTimeBlur}
            className="mt-1 block w-full border border-blue-500 rounded-md p-2"
          />
        </div>
        <div>
          <label
            htmlFor="employee_id"
            className="block text-md font-medium text-gray-700"
          >
            Employee
          </label>
          <select
            name="employee_id"
            id="employee_id"
            required
            defaultValue={timesheet.employee_id}
            className="mt-1 block w-full border border-blue-500 rounded-md p-2"
          >
            <option value="">Select an employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="summary"
            className="block text-md font-medium text-gray-700"
          >
            Summary (optional)
          </label>
          <input
            type="text"
            name="summary"
            id="summary"
            placeholder="Work done during this timesheet period"
            defaultValue={timesheet.summary || ""}
            className="mt-1 block w-full border border-blue-500 rounded-md p-2"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Update Timesheet
          </button>
        </div>
      </Form>
    </div>
  );
}
