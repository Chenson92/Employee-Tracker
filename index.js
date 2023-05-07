const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();
const employeeData = require("./config/employee");
require("console.table");

const db = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// TODO: Have multiple functions. Each function shows its own inquirer.

// TODO: Receive inputs from user and build the MySQL query (INSERT INTO, SELECT * FROM...)

// Eg.  Update Employee List..
// Choose the employee to update: ["John Doe", ...]
// Choose the employee's new role title: ["Legal analyst", "Software Engineer",...]
// Then you convert answer.employee_name into {id} (for employee table)
// Then you convert answer.role_title into a {role_id}
// dbQuery = `UPDATE employee SET role_id={role_id} WHERE id={id}`
// Then you run the dbQuery and console table it, then call the function to ask the main inquirer questions

function main() {
  inquirer
    .prompt([
      // questions for users
      {
        type: "list",
        name: "options",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "Add employees",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "Add Department",
          "Update Employee Role",
        ],
      },
    ])
    .then((answer) => {
      console.log(answer);
      let choice;
      switch ((choice = answer)) {
        case "View All Employees":
          displayEmployees();
          break;

        case "Add employees":
          addEmployees();
          break;

        case "View All Roles":
          displayRoles();
          break;

        case "Add Role":
          addRole();
          break;

        case "View All Departments":
          displayDepartments();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;
      }
    });
}
