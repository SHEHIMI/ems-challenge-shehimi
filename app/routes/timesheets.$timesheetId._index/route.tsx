// app/routes/timesheets/$timesheetId.tsx
import { useLoaderData, Link } from "react-router-dom";
import type { LoaderFunction } from "@remix-run/node";
import { getDB } from "~/db/getDB";

export const loader: LoaderFunction = async ({ params }) => {
  const db = await getDB();
  // Fetch the timesheet record and join with the employees table for the employee name.
  const timesheet = await db.get(
    `SELECT t.*, e.full_name AS employee_name 
     FROM timesheets t
     LEFT JOIN employees e ON t.employee_id = e.id
     WHERE t.id = ?`,
    [params.timesheetId]
  );
  if (!timesheet) {
    throw new Response("Timesheet not found", { status: 404 });
  }
  return { timesheet };
};

export default function TimesheetView() {
  const { timesheet } = useLoaderData<{ timesheet: any }>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Timesheet Details</h1>
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4">
          <p className="mb-2">
            <strong>ID:</strong> {timesheet.id}
          </p>
          <p className="mb-2">
            <strong>Employee:</strong>{" "}
            {timesheet.employee_name || timesheet.employee_id}
          </p>
          <p className="mb-2">
            <strong>Start Time:</strong> {timesheet.start_time}
          </p>
          <p className="mb-2">
            <strong>End Time:</strong> {timesheet.end_time}
          </p>
          {timesheet.summary && (
            <p className="mb-2">
              <strong>Summary:</strong> {timesheet.summary}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-4">
        <Link to="/employees" className="text-blue-600 hover:underline">
          Employees
        </Link>
        <Link to="/timesheets" className="text-blue-600 hover:underline">
          Timesheets
        </Link>
        <Link
          to={`/timesheets/${timesheet.id}/edit`}
          className="text-blue-600 hover:underline"
        >
          Edit Timesheet
        </Link>
      </div>
    </div>
  );
}
