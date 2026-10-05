/* Student Record Manager - Vanilla JavaScript + LocalStorage */

const STORAGE_KEY = "studentRecordManager";
let students = loadStudents();

const studentForm = document.getElementById("studentForm");
const modalStudentForm = document.getElementById("modalStudentForm");
const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const yearFilter = document.getElementById("yearFilter");
const sortFilter = document.getElementById("sortFilter");
const studentTableBody = document.getElementById("studentTableBody");
const emptyState = document.getElementById("emptyState");
const recordCount = document.getElementById("recordCount");
const studentModal = document.getElementById("studentModal");
const toast = document.getElementById("toast");

document.addEventListener("DOMContentLoaded", () => {
    renderStudents();
    updateDashboard();
    renderRecentStudents();
    document.getElementById("currentYear").textContent = new Date().getFullYear();
    setupTiltCards();
});

function loadStudents() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
        console.error("Unable to load student records:", error);
        return [];
    }
}

function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
        console.error("Unable to save student records:", error);
        showToast("Storage Error", "Unable to save student data.", "!");
    }
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^[0-9]{10}$/;

function validateStudent(data) {
    let isValid = true;

    const setError = (field, message) => {
        const element = document.getElementById(`${field}Error`);
        if (element) element.textContent = message;
        isValid = false;
    };

    ["studentId","fullName","email","phone","course","year","gender","dob","address"]
        .forEach(field => {
            const element = document.getElementById(`${field}Error`);
            if (element) element.textContent = "";
        });

    if (!data.studentId) setError("studentId", "Student ID is required.");
    else if (students.some((s, i) =>
        s.studentId.toLowerCase() === data.studentId.toLowerCase() &&
        i !== data.editIndex
    )) setError("studentId", "Student ID already exists.");

    if (!data.fullName) setError("fullName", "Full name is required.");
    else if (data.fullName.length < 2) setError("fullName", "Name must contain at least 2 characters.");

    if (!data.email) setError("email", "Email is required.");
    else if (!emailRegex.test(data.email)) setError("email", "Enter a valid email address.");

    if (!data.phone) setError("phone", "Phone number is required.");
    else if (!phoneRegex.test(data.phone)) setError("phone", "Enter a valid 10-digit phone number.");

    if (!data.course) setError("course", "Please select a course.");
    if (!data.year) setError("year", "Please select a year.");
    if (!data.gender) setError("gender", "Please select gender.");
    if (!data.dob) setError("dob", "Date of birth is required.");
    if (!data.address) setError("address", "Address is required.");

    return isValid;
}

function getFormData() {
    return {
        studentId: document.getElementById("studentId").value.trim(),
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        course: document.getElementById("course").value,
        year: document.getElementById("year").value,
        gender: document.getElementById("gender").value,
        dob: document.getElementById("dob").value,
        address: document.getElementById("address").value.trim()
    };
}

studentForm.addEventListener("submit", event => {
    event.preventDefault();
    const data = getFormData();
    data.editIndex = -1;

    if (!validateStudent(data)) {
        showToast("Validation Error", "Please correct the highlighted fields.", "!");
        return;
    }

    const student = {...data, createdAt: new Date().toISOString()};
    students.push(student);
    saveStudents();
    studentForm.reset();
    renderStudents();
    updateDashboard();
    renderRecentStudents();
    showToast("Student Added", `${student.fullName} was added successfully.`);
});

function openStudentModal(index = null) {
    studentModal.classList.add("active");
    document.body.style.overflow = "hidden";
    clearModalForm();

    if (index !== null) {
        const student = students[index];
        document.getElementById("modalTitle").textContent = "Edit Student";
        document.getElementById("modalSubmit").textContent = "Update Student";
        document.getElementById("editIndex").value = index;

        document.getElementById("modalStudentId").value = student.studentId;
        document.getElementById("modalFullName").value = student.fullName;
        document.getElementById("modalEmail").value = student.email;
        document.getElementById("modalPhone").value = student.phone;
        document.getElementById("modalCourse").value = student.course;
        document.getElementById("modalYear").value = student.year;
        document.getElementById("modalGender").value = student.gender;
        document.getElementById("modalDob").value = student.dob;
        document.getElementById("modalAddress").value = student.address;
    } else {
        document.getElementById("modalTitle").textContent = "Add Student";
        document.getElementById("modalSubmit").textContent = "Save Student";
        document.getElementById("editIndex").value = "-1";
    }
}

function closeStudentModal() {
    studentModal.classList.remove("active");
    document.body.style.overflow = "";
    clearModalForm();
}

function clearModalForm() {
    modalStudentForm.reset();
    document.querySelectorAll("#modalStudentForm .error").forEach(element => element.textContent = "");
}

studentModal.addEventListener("click", event => {
    if (event.target === studentModal) closeStudentModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && studentModal.classList.contains("active")) closeStudentModal();
});

function getModalFormData() {
    return {
        studentId: document.getElementById("modalStudentId").value.trim(),
        fullName: document.getElementById("modalFullName").value.trim(),
        email: document.getElementById("modalEmail").value.trim(),
        phone: document.getElementById("modalPhone").value.trim(),
        course: document.getElementById("modalCourse").value,
        year: document.getElementById("modalYear").value,
        gender: document.getElementById("modalGender").value,
        dob: document.getElementById("modalDob").value,
        address: document.getElementById("modalAddress").value.trim()
    };
}

modalStudentForm.addEventListener("submit", event => {
    event.preventDefault();

    const data = getModalFormData();
    const index = Number(document.getElementById("editIndex").value);

    const valid =
        data.studentId &&
        data.fullName &&
        emailRegex.test(data.email) &&
        phoneRegex.test(data.phone) &&
        data.course &&
        data.year &&
        data.gender &&
        data.dob &&
        data.address &&
        !students.some((s, i) =>
            s.studentId.toLowerCase() === data.studentId.toLowerCase() && i !== index
        );

    document.getElementById("modalStudentIdError").textContent =
        !data.studentId ? "Student ID is required." :
        students.some((s, i) => s.studentId.toLowerCase() === data.studentId.toLowerCase() && i !== index)
            ? "Student ID already exists." : "";

    document.getElementById("modalFullNameError").textContent =
        !data.fullName ? "Full name is required." : "";

    document.getElementById("modalEmailError").textContent =
        !data.email ? "Email is required." :
        !emailRegex.test(data.email) ? "Enter a valid email address." : "";

    document.getElementById("modalPhoneError").textContent =
        !data.phone ? "Phone number is required." :
        !phoneRegex.test(data.phone) ? "Enter a valid 10-digit phone number." : "";

    if (!valid) {
        showToast("Validation Error", "Please correct the highlighted fields.", "!");
        return;
    }

    const oldStudent = students[index];

    if (index >= 0) {
        students[index] = {
            ...data,
            createdAt: oldStudent.createdAt,
            updatedAt: new Date().toISOString()
        };
        showToast("Record Updated", `${data.fullName}'s record was updated.`);
    } else {
        students.push({...data, createdAt: new Date().toISOString()});
        showToast("Student Added", `${data.fullName} was added successfully.`);
    }

    saveStudents();
    closeStudentModal();
    renderStudents();
    updateDashboard();
    renderRecentStudents();
});

function deleteStudent(index) {
    const student = students[index];
    if (!student) return;

    if (!confirm(`Delete ${student.fullName}'s record?\n\nThis action cannot be undone.`)) return;

    students.splice(index, 1);
    saveStudents();
    renderStudents();
    updateDashboard();
    renderRecentStudents();
    showToast("Record Deleted", `${student.fullName}'s record was deleted.`);
}

function getFilteredStudents() {
    let filtered = [...students];

    const search = searchInput.value.trim().toLowerCase();
    const course = courseFilter.value;
    const year = yearFilter.value;

    if (search) {
        filtered = filtered.filter(student =>
            student.fullName.toLowerCase().includes(search) ||
            student.studentId.toLowerCase().includes(search)
        );
    }

    if (course) filtered = filtered.filter(student => student.course === course);
    if (year) filtered = filtered.filter(student => student.year === year);

    switch (sortFilter.value) {
        case "newest": filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
        case "oldest": filtered.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
        case "nameAsc": filtered.sort((a,b) => a.fullName.localeCompare(b.fullName)); break;
        case "nameDesc": filtered.sort((a,b) => b.fullName.localeCompare(a.fullName)); break;
        case "idAsc": filtered.sort((a,b) => a.studentId.localeCompare(b.studentId)); break;
        case "idDesc": filtered.sort((a,b) => b.studentId.localeCompare(a.studentId)); break;
    }

    return filtered;
}

function renderStudents() {
    const filtered = getFilteredStudents();
    studentTableBody.innerHTML = "";
    recordCount.textContent = `${filtered.length} ${filtered.length === 1 ? "record" : "records"}`;

    if (filtered.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    filtered.forEach(student => {
        const originalIndex = students.indexOf(student);
        const row = document.createElement("tr");
        const initials = getInitials(student.fullName);

        row.innerHTML = `
            <td><div class="student-info">
                <div class="avatar">${escapeHTML(initials)}</div>
                <div><div class="student-name">${escapeHTML(student.fullName)}</div>
                <div class="student-id">${escapeHTML(student.studentId)}</div></div>
            </div></td>
            <td class="email-cell">${escapeHTML(student.email)}</td>
            <td class="phone-cell">${escapeHTML(student.phone)}</td>
            <td><span class="course-badge">${escapeHTML(student.course)}</span></td>
            <td><span class="year-badge">${escapeHTML(student.year)}</span></td>
            <td><div class="actions">
                <button class="action-btn edit-btn" title="Edit Student" onclick="openStudentModal(${originalIndex})">✎</button>
                <button class="action-btn delete-btn" title="Delete Student" onclick="deleteStudent(${originalIndex})">🗑</button>
            </div></td>
        `;

        studentTableBody.appendChild(row);
    });
}

searchInput.addEventListener("input", renderStudents);
courseFilter.addEventListener("change", renderStudents);
yearFilter.addEventListener("change", renderStudents);
sortFilter.addEventListener("change", renderStudents);

function updateDashboard() {
    document.getElementById("totalStudents").textContent = students.length;

    const courses = new Set(students.map(student => student.course));
    document.getElementById("totalCourses").textContent = courses.size;

    const today = new Date().toDateString();
    const todayCount = students.filter(student =>
        new Date(student.createdAt).toDateString() === today
    ).length;

    document.getElementById("studentsToday").textContent = todayCount;
}

function renderRecentStudents() {
    const container = document.getElementById("recentStudents");

    const recent = [...students]
        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0,3);

    if (!recent.length) {
        container.innerHTML = `
            <div class="recent-card">
                <div class="recent-avatar">+</div>
                <h3>No students yet</h3>
                <p>Add a student to see recent activity.</p>
            </div>`;
        return;
    }

    container.innerHTML = recent.map(student => `
        <div class="recent-card">
            <div class="recent-avatar">${escapeHTML(getInitials(student.fullName))}</div>
            <h3>${escapeHTML(student.fullName)}</h3>
            <p>${escapeHTML(student.email)}</p>
            <span class="recent-course">${escapeHTML(student.course)}</span>
        </div>
    `).join("");
}

function getInitials(name) {
    return name.split(" ").filter(Boolean).slice(0,2).map(word => word[0].toUpperCase()).join("");
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function showToast(title, message, icon = "✓") {
    document.getElementById("toastTitle").textContent = title;
    document.getElementById("toastMessage").textContent = message;
    document.getElementById("toastIcon").textContent = icon;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

function setupTiltCards() {
    document.querySelectorAll(".tilt-card").forEach(card => {
        card.addEventListener("mousemove", event => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rotateY = ((x - rect.width/2) / (rect.width/2)) * 5;
            const rotateX = ((rect.height/2 - y) / (rect.height/2)) * 5;

            card.style.transform =
                `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener("mouseleave", () => card.style.transform = "");
    });
}

const today = new Date().toISOString().split("T")[0];
document.getElementById("dob").max = today;
document.getElementById("modalDob").max = today;

["dob","modalDob"].forEach(id => {
    document.getElementById(id).addEventListener("change", function() {
        if (this.value > today) {
            this.value = "";
            showToast("Invalid Date", "Date of birth cannot be in the future.", "!");
        }
    });
});
