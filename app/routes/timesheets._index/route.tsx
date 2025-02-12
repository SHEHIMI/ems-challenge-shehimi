import { useLoaderData, useNavigate, Link } from "react-router-dom";
import type { LoaderFunction } from "@remix-run/node";
import { getDB } from "~/db/getDB";
import { useState, useEffect } from "react";
import "@schedule-x/theme-default/dist/index.css";
import { createCalendar, createViewMonthGrid } from "@schedule-x/calendar";
import { useRef } from "react";

function ScheduleCalendar({ events }: { events: any[] }) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarInstanceRef = useRef<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.innerHTML = "";
    }

    const formatDateTime = (date: Date): string => {
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      const hours = ("0" + date.getHours()).slice(-2);
      const minutes = ("0" + date.getMinutes()).slice(-2);
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const calendarEvents = events.map((ev) => ({
      ...ev,
      start: typeof ev.start === "string" ? ev.start : formatDateTime(ev.start),
      end: typeof ev.end === "string" ? ev.end : formatDateTime(ev.end),
    }));

    const calendar = createCalendar({
      views: [createViewMonthGrid()],
      events: calendarEvents,
      callbacks: {
        onEventClick: (event: any) => {
          // When an event is clicked navigate to the specific timesheet
          navigate(`/timesheets/${event.id}`);
        },
      },
    });

    calendarInstanceRef.current = calendar;

    const timer = setTimeout(() => {
      if (calendarRef.current) {
        calendar.render(calendarRef.current);
      }
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (calendarInstanceRef.current && calendarInstanceRef.current.destroy) {
        calendarInstanceRef.current.destroy();
        calendarInstanceRef.current = null;
      }
      if (calendarRef.current) {
        calendarRef.current.innerHTML = "";
      }
    };
  }, [events]);

  return <div id="calendar" ref={calendarRef} />;
}

export const loader: LoaderFunction = async () => {
  const db = await getDB();
  // Join timesheets with employees
  const timesheets = await db.all(`
    SELECT t.*, e.full_name AS employee_name
    FROM timesheets t
    JOIN employees e ON t.employee_id = e.id
    ORDER BY t.start_time ASC
  `);
  // Get employees for filter.
  const employees = await db.all("SELECT id, full_name FROM employees;");
  return { timesheets, employees };
};

export default function TimesheetsListPage() {
  const { timesheets, employees } = useLoaderData<{
    timesheets: any[];
    employees: any[];
  }>();
  const navigate = useNavigate();

  // States
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Filter timesheets
  const filteredTimesheets = timesheets.filter((ts) => {
    const matchesSearch = ts.summary
      ? ts.summary.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesEmployee =
      selectedEmployee === "" || ts.employee_id.toString() === selectedEmployee;
    return matchesSearch && matchesEmployee;
  });

  const calendarEvents = filteredTimesheets.map((ts) => ({
    id: ts.id,
    title: ts.summary || `Timesheet #${ts.id} (${ts.employee_name})`,
    start: new Date(ts.start_time),
    end: new Date(ts.end_time),
  }));

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Timesheets</h1>
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("calendar")}
              className={`py-2 px-4 rounded ${
                viewMode === "calendar"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`py-2 px-4 rounded ${
                viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Table View
            </button>
          </div>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by summary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-blue-500 rounded-md p-2"
          />
          {/* Employee Filter Dropdown */}
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="border border-blue-500 rounded-md p-2"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="bg-white p-4 shadow rounded">
          <ScheduleCalendar key="calendar-view" events={calendarEvents} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-blue-500">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-2 border border-blue-500">ID</th>
                <th className="px-4 py-2 border border-blue-500">Employee</th>
                <th className="px-4 py-2 border border-blue-500">Start Time</th>
                <th className="px-4 py-2 border border-blue-500">End Time</th>
                <th className="px-4 py-2 border border-blue-500">Summary</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.map((ts) => (
                <tr
                  key={ts.id}
                  className="hover:bg-blue-50 cursor-pointer"
                  onClick={() => navigate(`/timesheets/${ts.id}`)}
                >
                  <td className="px-4 py-2 border border-blue-500">{ts.id}</td>
                  <td className="px-4 py-2 border border-blue-500">
                    {ts.employee_name}
                  </td>
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
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-center space-x-4">
        <Link to="/employees" className="text-blue-600 hover:underline">
          Employees
        </Link>
        <Link to="/timesheets" className="text-blue-600 hover:underline">
          All Timesheets
        </Link>
      </div>
    </div>
  );
}
