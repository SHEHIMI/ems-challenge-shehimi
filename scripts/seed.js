import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, "../database.yaml");
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, "utf8"));

const { sqlite_path: sqlitePath } = dbConfig;

const db = new sqlite3.Database(sqlitePath);
const employees = [
  {
    full_name: "John Doe",
    email: "john.doe@gmail.com",
    phone_number: 81900482,
    date_of_birth: "1985-06-15",
    job_title: "Software Engineer",
    department: "Engineering",
    salary: 80000.0,
    start_date: "2020-01-15",
    end_date: null,
    father_name: "Robert Doe",
    cv: null,
    photo: null,
  },
  {
    full_name: "Jane Smith",
    email: "jane.smith@gmail.com",
    phone_number: 81700987,
    date_of_birth: "1990-09-20",
    job_title: "Project Manager",
    department: "Engineering",
    salary: 95000.0,
    start_date: "2018-03-22",
    end_date: null,
    father_name: "Michael Smith",
    cv: null,
    photo: null,
  },
  {
    full_name: "Alice Johnson",
    email: "alice.johnson@gmail.com",
    phone_number: 3458922,
    date_of_birth: "1992-11-05",
    job_title: "HR Manager",
    department: "HR",
    salary: 70000.0,
    start_date: "2019-06-10",
    end_date: null,
    father_name: "Henry Johnson",
    cv: null,
    photo: null,
  },
];

const timesheets = [
  {
    employee_id: 1,
    start_time: "2025-02-10 08:00:00",
    end_time: "2025-02-10 17:00:00",
    summary: "Fixed Bugs in webserver",
  },
  {
    employee_id: 2,
    start_time: "2025-02-11 12:00:00",
    end_time: "2025-02-11 17:00:00",
    summary: "Implemented AI Features",
  },
  {
    employee_id: 3,
    start_time: "2025-02-12 07:00:00",
    end_time: "2025-02-12 16:00:00",
    summary: "Handled HR interviews",
  },
  {
    employee_id: 1,
    start_time: "2025-02-13 09:00:00",
    end_time: "2025-02-13 18:00:00",
    summary: "Developed new features",
  },
];

const insertData = (table, data) => {
  const columns = Object.keys(data[0]).join(", ");
  const placeholders = Object.keys(data[0])
    .map(() => "?")
    .join(", ");

  const insertStmt = db.prepare(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
  );

  data.forEach((row) => {
    insertStmt.run(Object.values(row));
  });

  insertStmt.finalize();
};

db.serialize(() => {
  insertData("employees", employees);
  insertData("timesheets", timesheets);
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Database seeded successfully.");
  }
});
