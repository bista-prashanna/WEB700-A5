const fs = require("fs");

class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/courses.json', 'utf8', (err, courseData) => {
            if (err) {
                reject(`Unable to load courses: ${err.message}`);
                return;
            }

            fs.readFile('./data/students.json', 'utf8', (err, studentData) => {
                if (err) {
                    reject(`Unable to load students: ${err.message}`);
                    return;
                }

                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
};

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        if (!dataCollection || !dataCollection.students || dataCollection.students.length === 0) {
            reject("No students found in the database.");
            return;
        }

        resolve(dataCollection.students);
    });
};

module.exports.getTAs = function () {
    return new Promise(function (resolve, reject) {
        const filteredStudents = dataCollection.students.filter(student => student.TA === true);

        if (filteredStudents.length === 0) {
            reject("No teaching assistants found.");
            return;
        }

        resolve(filteredStudents);
    });
};

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        if (!dataCollection || !dataCollection.courses || dataCollection.courses.length === 0) {
            reject("No courses found in the database.");
            return;
        }

        resolve(dataCollection.courses);
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        const foundStudent = dataCollection.students.find(student => student.studentNum == num);

        if (!foundStudent) {
            reject(`No student found with number ${num}`);
            return;
        }

        resolve(foundStudent);
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        const filteredStudents = dataCollection.students.filter(student => student.course == course);

        if (filteredStudents.length === 0) {
            reject(`No students found for course ${course}`);
            return;
        }

        resolve(filteredStudents);
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Input validation
        if (!studentData.firstName || !studentData.lastName || !studentData.email) {
            reject("First Name, Last Name, and Email are required fields.");
            return;
        }

        // Set TA property based on checkbox input
        studentData.TA = studentData.TA === undefined ? false : true;

        // Set studentNum based on the current length of the students array
        studentData.studentNum = dataCollection.students.length + 261; // Assuming studentNum starts from 261

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
            reject("Invalid email format.");
            return;
        }

        // Add the new student to the data collection
        dataCollection.students.push(studentData);

        // Save the updated students array back to the JSON file
        fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students, null, 2), (err) => {
            if (err) {
                reject(`Unable to save student data: ${err.message}`);
                return;
            }

            // Return the newly added student
            resolve(studentData);
        });
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        console.log("Updating student with studentNum:", studentData.studentNum);  // Log the student being updated
        const studentIndex = dataCollection.students.findIndex(student => student.studentNum === studentData.studentNum);

        if (studentIndex === -1) {
            reject(`Student with studentNum ${studentData.studentNum} not found.`);
            return;
        }

        // Validate the input fields
        if (!studentData.firstName || !studentData.lastName || !studentData.email) {
            reject("First Name, Last Name, and Email are required fields.");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
            reject("Invalid email format.");
            return;
        }

        // Update the student data
        dataCollection.students[studentIndex] = { ...dataCollection.students[studentIndex], ...studentData };

        // Save the updated students array back to the JSON file
        fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students, null, 2), (err) => {
            if (err) {
                reject(`Unable to save student data: ${err.message}`);
                return;
            }

            console.log("Student updated successfully:", dataCollection.students[studentIndex]);  // Log updated student data
            resolve(dataCollection.students[studentIndex]);
        });
    });
};

// New Method: getCourseById
module.exports.getCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        // Find the course with the provided ID
        const foundCourse = dataCollection.courses.find(course => course.courseId == id);

        if (!foundCourse) {
            reject(`No course found with ID ${id}`);
            return;
        }

        resolve(foundCourse);
    });
};
