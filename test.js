const inquirer = require("inquirer");
const mysql = require("mysql2");
require("console.table");
require("dotenv").config();

const db = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

function main() {
  inquirer
    .prompt(
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
      }
    )
    .then((answer) => {
      console.log(answer);
      switch (answer) {
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

const displayEmployees = () => {
  let dbQuery = `
  SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary,department.name,CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee
  LEFT JOIN employee as manager
  ON employee.manager_id = manager.id
  INNER JOIN role
  ON employee.role_id=role.id
  INNER JOIN department
  ON role.department_id=department.id;
  `;
  db.query(dbQuery, function (error, results) {
    // console.log(results);
    console.table(results);
  });
};
// Similiar to db.connect.then, or fetch.then.. because there may be a slight delay and we wait at then
db.connect(function () {
  displayEmployees();
});

const displayRoles = () => {
  let dbQuery = `SELECT * FROM role
  JOIN department ON role.department_id=department.id;`;
  db.query(dbQuery, function (error, results) {
    // console.log(results);
    console.table(results);
  });
};
db.connect(function () {
  displayRoles();
});

const displayDepartments = () => {
  let dbQuery = `SELECT * FROM department;`;
  db.query(dbQuery, function (error, results) {
    // console.log(results);
    console.table(results);
  });
};
db.connect(function () {
  displayDepartments();
});

const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "departmentName",
        message: "What is the name of the department?",
      },
    ])
    .then((data) => {
      let dbQuery = `INSERT INTO department (name)
        VALUES(${data.departmentName});`;
    });

  console.log(`Added ${data.departmentName} to the database`);

  db.connect(function () {
    addDepartment();
  });
};

db.connect((err) => {
  if (err) throw err;
  main();
});
