const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5500;
const DATA_FILE = path.join(__dirname, "data/students.json");

app.use(cors());
app.use(express.json());

// Read data
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// Write data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Get all students
app.get("/students", (req, res) => {
  res.json(readData());
});

// Add a new student
app.post("/students", (req, res) => {
  const { name, roll } = req.body;
  const data = readData();
  data.push({ name, roll, attendance: null });
  writeData(data);
  res.json({ message: "Student added successfully." });
});

// Update a student's attendance
app.put("/attendance", (req, res) => {
  const { roll, attendance } = req.body;
  const data = readData();
  const student = data.find((s) => s.roll === roll);
  if (student) {
    student.attendance = attendance;
    writeData(data);
    res.json({ message: "Attendance updated successfully." });
  } else {
    res.status(404).json({ message: "Student not found." });
  }
});

// Delete a student
app.delete("/students/:roll", (req, res) => {
  const roll = req.params.roll;
  let data = readData();
  data = data.filter((s) => s.roll !== roll);
  writeData(data);
  res.json({ message: "Student deleted successfully." });
});

// Submit attendance
app.get("/submit", (req, res) => {
  const data = readData();
  const today = new Date().toISOString().slice(0, 10);
  const csv = data
    .map((s) => `${s.roll},${s.name},${s.attendance === true ? 1 : 0}`)
    .join("\n");

  const filename = `attendance_${today}.csv`;
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, csv);

  res.download(filepath, () => {
    fs.unlinkSync(filepath); // Delete after sending
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
