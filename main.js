#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table';
// Class definitions
class Person {
    name;
    age;
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}
class Course {
    id;
    name;
    students = [];
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    addStudent(student) {
        this.students.push(student);
    }
}
class Student extends Person {
    studentID;
    courses = [];
    balance = 0;
    constructor(name, age, studentID) {
        super(name, age);
        this.studentID = studentID;
    }
    enroll(course) {
        this.courses.push(course);
        course.addStudent(this);
        this.balance += 1000; // Assuming each course costs $1000
    }
    viewBalance() {
        console.log(chalk.blue(`Current balance for ${this.name}: $${this.balance}`));
    }
    payTuition(amount) {
        this.balance -= amount;
        console.log(chalk.green(`Payment of $${amount} received. New balance: $${this.balance}`));
    }
    showStatus() {
        const courseNames = this.courses.map(course => course.name).join(', ');
        console.log(chalk.cyan(`Name: ${this.name}\nID: ${this.studentID}\nCourses: ${courseNames}\nBalance: $${this.balance}`));
    }
    static listStudents(students) {
        if (students.length === 0) {
            console.log(chalk.yellow('No students registered yet.'));
            return;
        }
        const table = new Table({
            head: ['ID', 'Name', 'Age', 'Courses', 'Balance'],
            colWidths: [15, 25, 10, 30, 10]
        });
        students.forEach(student => {
            const coursesEnrolled = student.courses.map(course => course.name).join(', ');
            table.push([student.studentID, student.name, student.age.toString(), coursesEnrolled, student.balance.toString()]);
        });
        console.log(chalk.cyan('List of Students:'));
        console.log(table.toString());
    }
}
// Initialize courses
const courses = [
    new Course(1, 'Intro to Programming'),
    new Course(2, 'Database Systems'),
    new Course(3, 'Calculus'),
    new Course(4, 'Linear Algebra'),
    new Course(5, 'Classical Mechanics'),
    new Course(6, 'Quantum Physics')
];
// Global student list
const students = [];
// Function to generate a unique student ID
function generateStudentID() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}
// Function to select a course
async function selectCourse() {
    const { course } = await inquirer.prompt({
        name: 'course',
        type: 'list',
        message: 'Choose a course:',
        choices: courses.map(course => ({ name: course.name, value: course }))
    });
    return course;
}
// Handlers for various operations
const handlers = {
    'Add Student': async () => {
        const { name, age } = await inquirer.prompt([
            { name: 'name', message: 'Enter student name:', type: 'input' },
            { name: 'age', message: 'Enter student age:', type: 'number' }
        ]);
        const studentID = generateStudentID();
        const student = new Student(name, age, studentID);
        students.push(student);
        const course = await selectCourse();
        student.enroll(course);
        console.log(chalk.green(`Student added: ${student.name} with ID: ${student.studentID}`));
        console.log(chalk.green(`Enrolled in course: ${course.name}`));
    },
    'View Balance': async () => {
        const { student } = await inquirer.prompt({
            name: 'student',
            type: 'list',
            message: 'Choose a student:',
            choices: students.map(student => ({ name: `${student.name} (ID: ${student.studentID})`, value: student }))
        });
        student.viewBalance();
    },
    'Pay Tuition': async () => {
        const { student } = await inquirer.prompt({
            name: 'student',
            type: 'list',
            message: 'Choose a student:',
            choices: students.map(student => ({ name: `${student.name} (ID: ${student.studentID})`, value: student }))
        });
        const { amount } = await inquirer.prompt({
            name: 'amount',
            message: 'Enter amount to pay:',
            type: 'number'
        });
        student.payTuition(amount);
    },
    'Show Student Status': async () => {
        const { student } = await inquirer.prompt({
            name: 'student',
            type: 'list',
            message: 'Choose a student:',
            choices: students.map(student => ({ name: `${student.name} (ID: ${student.studentID})`, value: student }))
        });
        student.showStatus();
    },
    'List Students': async () => {
        Student.listStudents(students);
    },
    'Exit': () => {
        console.log(chalk.magenta('Goodbye!'));
        process.exit();
    }
};
// Main function to run the application
async function main() {
    while (true) {
        const { action } = await inquirer.prompt({
            name: 'action',
            type: 'list',
            message: 'What do you want to do?',
            choices: Object.keys(handlers)
        });
        await handlers[action]();
    }
}
main();
