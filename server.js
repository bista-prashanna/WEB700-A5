/*********************************************************************************
WEB700 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
of this assignment has been copied manually or electronically from any other source
(including 3rd party web sites) or distributed to other students.
Name: Prashanna Bista Student ID: 140790239 Date: 2025/03/04 - Tuesday
Online (Vercel) Link: https://web-700-a4-fknbrd36l-bista-prashannas-projects.vercel.app/
********************************************************************************/

const express = require("express");
const path = require("path");
const collegeData = require("./MODULES/collegeData"); // CollegeData Module
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Serve static assets from the Public folder
app.use(express.static(path.join(__dirname, "Public")));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Serve students.json from DATA folder
app.get("/students.json", (req, res) => {
    res.sendFile(path.join(__dirname, "DATA", "students.json"));
});

// Initialize college data
collegeData.initialize()
    .then(() => {
        // Setup routes
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "home.html"));
        });

        app.get("/about", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "about.html"));
        });

        app.get("/htmlDemo", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "htmlDemo.html"));
        });

        // Serve students.html instead of JSON
        app.get("/students", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "students.html"));
        });

        app.get("/tas", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "tas.html"));
        });

        app.get("/courses", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "courses.html"));
        });

        app.get("/student/:num", (req, res) => {
            const studentNum = req.params.num;
            collegeData.getStudentByNum(studentNum)
                .then(student => student 
                    ? res.json(student) 
                    : res.status(404).json({ message: "No results found" }))
                .catch(() => res.status(500).json({ message: "Internal Server Error" }));
        });

        // Add Student Form
        app.get("/students/add", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "addStudent.html"));
        });

        app.post("/students/add", (req, res) => {
            collegeData.addStudent(req.body)
                .then(() => {
                    res.redirect("/students");
                })
                .catch(() => res.status(500).json({ message: "Internal Server Error" }));
        });

        // 404 Handler
        app.use((req, res) => {
            res.status(404).send("Page Not Found");
        });

        // Start the server
        app.listen(HTTP_PORT, () => {
            console.log("Server listening on port: " + HTTP_PORT);
        });
    })
    .catch(err => {
        console.error("Failed to initialize data: ", err);
    });
