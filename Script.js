// Initialize variables
const dateInput = document.getElementById("attendance-date");
const studentNameInput = document.getElementById("student-name");
const studentRollInput = document.getElementById("student-roll");
const addStudentButton = document.getElementById("add-student");
const studentTableBody = document.querySelector("#student-table tbody");
const markAllPresentButton = document.getElementById("mark-all-present");
const markAllAbsentButton = document.getElementById("mark-all-absent");
const submitAttendanceButton = document.getElementById("submit-attendance");

// Modal elements
const modal = document.getElementById("confirmation-modal");
const downloadYesButton = document.getElementById("download-yes");
const downloadNoButton = document.getElementById("download-no");

let students = [];

// Load students from localStorage
function loadStudents() {
  const storedStudents = localStorage.getItem("students");
  students = storedStudents ? JSON.parse(storedStudents) : [];
}

// Save students to localStorage
function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students));
}

// Set today's date by default
dateInput.valueAsDate = new Date();

// Add a student
addStudentButton.addEventListener("click", () => {
  const name = studentNameInput.value.trim();
  const roll = studentRollInput.value.trim();

  if (!name || !roll) {
    alert("Please enter both name and roll number.");
    return;
  }

  students.push({ name, roll, attendance: null });
  studentNameInput.value = "";
  studentRollInput.value = "";
  saveStudents();
  renderStudentTable();
});

// Render the student table
function renderStudentTable() {
  studentTableBody.innerHTML = "";
  students.forEach((student, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.roll}</td>
      <td>${student.name}</td>
      <td>
        <select onchange="updateAttendance(${index}, this.value)">
          <option value="" ${student.attendance === null ? "selected" : ""}>Mark</option>
          <option value="1" ${student.attendance === true ? "selected" : ""}>Present</option>
          <option value="0" ${student.attendance === false ? "selected" : ""}>Absent</option>
        </select>
      </td>
      <td><button onclick="deleteStudent(${index})">Delete</button></td>
    `;
    studentTableBody.appendChild(row);
  });
}

// Update attendance for a specific student
function updateAttendance(index, value) {
  students[index].attendance = value === "1";
  saveStudents();
}

// Delete a student from the list
function deleteStudent(index) {
  students.splice(index, 1);
  saveStudents();
  renderStudentTable();
}

// Mark all students as present
markAllPresentButton.addEventListener("click", () => {
  students.forEach(student => student.attendance = true);
  saveStudents();
  renderStudentTable();
});

// Mark all students as absent
markAllAbsentButton.addEventListener("click", () => {
  students.forEach(student => student.attendance = false);
  saveStudents();
  renderStudentTable();
});

// Submit attendance and show modal for confirmation
submitAttendanceButton.addEventListener("click", () => {
  if (!dateInput.value) {
    alert("Please select a date.");
    return;
  }

  if (students.length === 0) {
    alert("No students to submit attendance for.");
    return;
  }

  // Show confirmation modal
  modal.classList.remove("hidden");
});

// Download CSV when user chooses "Yes"
downloadYesButton.addEventListener("click", () => {
  const date = dateInput.value;
  const attendanceData = students.map(student => ({
    roll: student.roll,
    name: student.name,
    attendance: student.attendance === true ? 1 : 0,
  }));

  downloadCSV(attendanceData, `attendance_${date}.csv`);
  alert("Attendance submitted and downloaded successfully!");
  modal.classList.add("hidden");
});

// Close modal and submit attendance without download when user chooses "No"
downloadNoButton.addEventListener("click", () => {
  alert("Attendance submitted successfully without downloading!");
  modal.classList.add("hidden");
});

// CSV Download function
function downloadCSV(data, filename) {
  const csvRows = [
    ["Roll Number", "Name", "Attendance"],
    ...data.map(row => [row.roll, row.name, row.attendance]),
  ];

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(row => row.join(",")).join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Load students and render the table on page load
loadStudents();
renderStudentTable();
