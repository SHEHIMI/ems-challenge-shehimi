import { useEffect, useState } from "react";
import { Link, useActionData, useNavigate } from "react-router-dom";
import type { ActionFunction } from "@remix-run/node";

// helper
async function streamToString(
  readable: NodeJS.ReadableStream
): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export const action: ActionFunction = async ({ request }) => {
  const { unstable_parseMultipartFormData } = await import("@remix-run/node");
  const fs = await import("fs");
  const path = await import("path");

  async function customUploadHandler(part: any) {
    if (!part.filename) {
      return await streamToString(part.data);
    }
    // For file parts:
    const uploadsDir = path.join(process.cwd(), "app", "public");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const fieldName = part.fieldName || part.name || "file";
    const fileName = `${fieldName}_${Date.now()}_${part.filename}`;
    const filePath = path.join(uploadsDir, fileName);
    const chunks: Buffer[] = [];
    for await (const chunk of part.data) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    fs.writeFileSync(filePath, buffer);
    return `/public/${fileName}`;
  }

  let formData;
  try {
    formData = await unstable_parseMultipartFormData(
      request,
      customUploadHandler
    );
  } catch (error) {
    console.error("Error parsing multipart form data:", error);
    return new Response("Could not parse form data.", { status: 400 });
  }

  // Required Fields
  const full_name = formData.get("full_name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone_number = formData.get("phone_number")?.toString().trim();
  const date_of_birth = formData.get("date_of_birth")?.toString().trim();
  const job_title = formData.get("job_title")?.toString().trim();
  const department = formData.get("department")?.toString().trim();
  const salary = formData.get("salary")?.toString().trim();
  const start_date = formData.get("start_date")?.toString().trim();
  const father_name = formData.get("father_name")?.toString().trim();

  // Optional Fields
  const end_date = formData.get("end_date")?.toString().trim();
  const photoField = formData.get("photo");
  const cvField = formData.get("cv");

  // Validate required fields
  if (
    !full_name ||
    !email ||
    !phone_number ||
    !date_of_birth ||
    !job_title ||
    !department ||
    !salary ||
    !start_date
  ) {
    return new Response("Missing required fields", { status: 400 });
  }

  const salaryNum = parseFloat(salary);
  if (isNaN(salaryNum)) {
    return new Response("Invalid salary value", { status: 400 });
  }

  let photoPath: string | null = null;
  let cvPath: string | null = null;

  if (typeof photoField === "string" && photoField.trim() !== "") {
    photoPath = photoField;
  }
  if (typeof cvField === "string" && cvField.trim() !== "") {
    cvPath = cvField;
  }

  const payload = [
    full_name,
    email,
    phone_number,
    date_of_birth,
    job_title,
    department,
    salaryNum,
    start_date,
    end_date || null,
    father_name || null,
    photoPath,
    cvPath,
  ];

  try {
    const { getDB } = await import("~/db/getDB");
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
        photo,
        cv
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      payload
    );
    return new Response("Employee created successfully", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    console.error("DB Error:", error);
    return new Response(error.message, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

export default function NewEmployeePage() {
  const actionData = useActionData<string>();
  const navigate = useNavigate();
  const [maxDOB, setMaxDOB] = useState("");

  useEffect(() => {
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    const formatted = eighteenYearsAgo.toISOString().split("T")[0];
    setMaxDOB(formatted);
  }, []);

  // If user enters a age < 18
  const handleDOBBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const maxDate = new Date(maxDOB);
    if (selectedDate > maxDate) {
      alert("Employee must be at least 18 years old.");
      e.target.value = "";
    }
  };

  // If user enters a salary < $12000
  const handleSalaryBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const salaryValue = parseFloat(e.target.value);
    if (salaryValue < 12000) {
      alert("Minimum salary is 12,000");
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (actionData) {
      alert(actionData);
      if (actionData === "Employee created successfully") {
        setTimeout(() => {
          navigate("/employees");
        }, 1000);
      }
    }
  }, [actionData, navigate]);

  return (
    <div className="container mx-auto p-4 w-auto h-full">
      <div className="grid grid-cols-2 items-center mb-6">
        <h1 className="text-3xl font-bold mb-6">Create New Employee</h1>
        <ul className="flex justify-end space-x-4">
          <Link to={"/employees"} className="text-blue-600 hover:underline">
            Employees
          </Link>
          <Link to={"/timesheets"} className="text-blue-600 hover:underline">
            Timesheets
          </Link>
        </ul>
      </div>
      <form
        method="post"
        encType="multipart/form-data"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Full Name */}
        <div>
          <label
            htmlFor="full_name"
            className="block text-md font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            id="full_name"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-md font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone_number"
            className="block text-md font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="number"
            name="phone_number"
            id="phone_number"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Date of Birth */}
        <div>
          <label
            htmlFor="date_of_birth"
            className="block text-md font-medium text-gray-700 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          >
            Date of Birth
          </label>
          <input
            type="date"
            name="date_of_birth"
            id="date_of_birth"
            required
            max={maxDOB}
            onBlur={handleDOBBlur}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Job Title */}
        <div>
          <label
            htmlFor="job_title"
            className="block text-md font-medium text-gray-700"
          >
            Job Title
          </label>
          <input
            type="text"
            name="job_title"
            id="job_title"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Department */}
        <div>
          <label
            htmlFor="department"
            className="block text-md font-medium text-gray-700"
          >
            Department
          </label>
          <input
            type="text"
            name="department"
            id="department"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Salary */}
        <div>
          <label
            htmlFor="salary"
            className="block text-md font-medium text-gray-700 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          >
            Salary
          </label>
          <input
            type="number"
            step="0.01"
            name="salary"
            id="salary"
            min="12000"
            onBlur={handleSalaryBlur}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Start Date */}
        <div>
          <label
            htmlFor="start_date"
            className="block text-md font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            id="start_date"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Father's Name */}
        <div>
          <label
            htmlFor="father_name"
            className="block text-md font-medium text-gray-700"
          >
            Father's Name (optional)
          </label>
          <input
            type="text"
            name="father_name"
            id="father_name"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Optional: End Date */}
        <div>
          <label
            htmlFor="end_date"
            className="block text-md font-medium text-gray-700"
          >
            End Date (optional)
          </label>
          <input
            type="date"
            name="end_date"
            id="end_date"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Optional: Upload CV */}
        <div>
          <label
            htmlFor="cv"
            className="block text-md font-medium text-gray-700"
          >
            Upload CV (optional)
          </label>
          <input
            type="file"
            name="cv"
            id="cv"
            accept=".pdf,.doc,.docx,image/*"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Optional: Upload Photo */}
        <div>
          <label
            htmlFor="photo"
            className="block text-md font-medium text-gray-700"
          >
            Upload Photo (optional)
          </label>
          <input
            type="file"
            name="photo"
            id="photo"
            accept="image/*"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-md p-2 h-10 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
          />
        </div>
        {/* Submit Button */}
        <div className="col-span-1 md:col-span-3 flex justify-center">
          <button
            type="submit"
            className="w-auto py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Create Employee
          </button>
        </div>
      </form>
      <hr className="my-6" />
    </div>
  );
}
