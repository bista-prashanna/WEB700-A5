/*********************************************************************************
WEB700 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
of this assignment has been copied manually or electronically from any other source
(including 3rd party web sites) or distributed to other students.
Name: Prashanna Bista Student ID: 140790239 Date: 2025/03/26 - Wednesday
Online (Vercel) Link: 
********************************************************************************/

const express = require('express');
const fs = require('fs');
const path = require('path');
const collegeData = require('./MODULES/collegeData');
const killPort = require('kill-port');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.use(express.static('public'));  // Serve static files (CSS, JS, images)
app.use(expressLayouts);  // Enable EJS layouts
app.set('view engine', 'ejs');  // Set EJS as the templating engine
app.set('views', path.join(__dirname, 'views'));  // Ensure Express finds the views directory
app.set('layout', 'layouts/main');  // Use 'layouts/main.ejs' as the default layout
app.use(express.urlencoded({ extended: true }));  // Parse form data
app.use(express.json());  // Handle JSON data

// Middleware to set activeRoute
app.use(function(req, res, next) {
    app.locals.activeRoute = req.path;  // Set the active route based on the current URL
    next();
});

// Add this code to pass the current URL to the view context
app.use(function(req, res, next) {
    res.locals.currentPath = req.path;  // Add current path to the locals
    next();
});

// Custom EJS helper for navigation links
app.locals.navLink = function(url, text, currentPath) {
    const isActive = currentPath === url || currentPath.startsWith(url + "/");
    return `<li class="nav-item ${isActive ? 'active' : ''}"><a class="nav-link" href="${url}">${text}</a></li>`;
};

// Custom EJS helper for equality checks
app.locals.equal = function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Ejs Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
};

// Load student data from JSON file
async function loadStudentData() {
    const filePath = path.join(__dirname, 'data', 'students.json');
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("❌ Error reading student data:", error);
        return [];
    }
}

// Start Server
async function startServer() {
    try {
        await collegeData.initialize();  // Ensure data is loaded before serving requests

        // Home Page
        app.get("/", (req, res) => {
            res.render("home", { title: "Home" });
        });

        // About Page
        app.get("/about", (req, res) => {
            res.render("about", { title: "About Us" });
        });

        // HTML Demo Page
        app.get("/htmlDemo", (req, res) => {
            res.render("htmlDemo", { title: "HTML Demo" });
        });

        // Students List Page (Fixed part)
        app.get("/students", async (req, res) => {
            try {
                const students = await loadStudentData();  // Fetch students using the correct function
                console.log(students);  // Log the students data to verify it's loaded correctly
        
                if (students.length === 0) {
                    return res.render("studentsList", { title: "Students", students, message: "No students found." });
                }
        
                res.render("studentsList", { title: "Students", students });  // Pass the students array to the view
            } catch (error) {
                console.error("❌ Error fetching students:", error);
                res.status(500).render("500", { title: "Error", message: "Internal Server Error" });
            }
        });
        
        // Student Edit Page
        app.get("/student/edit/:num", async (req, res) => {
            try {
                const studentNum = req.params.num;
                const student = await collegeData.getStudentByNum(studentNum);  // Fetch student by number
                const courses = await collegeData.getCourses();  // Fetch available courses
        
                if (!student) {
                    return res.status(404).render("404", { title: "Not Found", message: "Student not found." });
                }
        
                res.render("student", { title: "Edit Student", student, courses });  // Render the student edit form
            } catch (err) {
                console.error(err);
                res.status(500).render("500", { title: "Error", message: "Internal Server Error" });
            }
        });        

        // Update Student (POST)
        app.post('/student/update', async (req, res) => {
            try {
                const updatedStudent = {
                    studentNum: req.body.studentNum,  // The student number to identify the student
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    addressStreet: req.body.addressStreet,
                    addressCity: req.body.addressCity,
                    addressProvince: req.body.addressProvince,
                    status: req.body.status
                };
        
                // Assuming you have a function to update the student in the database:
                const result = await collegeData.updateStudent(updatedStudent);
        
                // Redirect to the students list or show a success message
                res.redirect('/students'); // or a success message page
            } catch (err) {
                console.error(err);
                res.status(500).send("Error updating student data.");
            }
        });
        
        // Add Student Page
        app.get("/students/add", async (req, res) => {
            try {
                const courses = await collegeData.getCourses();
                res.render("addStudent", { title: "Add Student", courses });
            } catch (err) {
                console.error(err);
                res.render("addStudent", { title: "Add Student", courses: [], message: "Error loading courses." });
            }
        });

        // Add New Student (POST)
        app.post("/students/add", async (req, res) => {
            try {
                await collegeData.addStudent(req.body);
                res.redirect("/students");
            } catch (err) {
                console.error(err);
                res.status(500).render("500", { title: "Error", message: "Internal Server Error" });
            }
        });

        

        // Courses Page
        app.get("/courses", async (req, res) => {
            try {
                const courses = await collegeData.getCourses();
                res.render("courses", { title: "Courses", courses, message: courses.length ? null : "No courses available." });
            } catch (err) {
                console.error(err);
                res.status(500).render("500", { title: "Error", message: "Internal Server Error" });
            }
        });

        // Course Detail Page
        app.get("/course/:id", async (req, res) => {
            try {
                const courseId = req.params.id;
                const course = await collegeData.getCourseById(courseId);

                if (!course) {
                    return res.status(404).render("404", { title: "Not Found", message: "Course not found." });
                }

                res.render("course", { title: `Course: ${course.courseDescription}`, course });
            } catch (err) {
                console.error(err);
                res.status(500).render("500", { title: "Error", message: "Internal Server Error" });
            }
        });

        // 404 Page
        app.use((req, res) => {
            res.status(404).render("404", { title: "Not Found", message: "Sorry, the page you requested could not be found." });
        });

        // Start the server
        app.listen(HTTP_PORT, () => {
            console.log(`✅ Server running on port ${HTTP_PORT}`);
        });

    } catch (err) {
        console.error("❌ Failed to initialize data: ", err);
    }
}

// Free the port if needed and start the server
killPort(HTTP_PORT, 'tcp')
    .then(() => {
        console.log(`🔄 Freed port ${HTTP_PORT}, starting server...`);
        startServer();
    })
    .catch(() => {
        console.log(`🚀 Port ${HTTP_PORT} is free, starting server...`);
        startServer();
    });
