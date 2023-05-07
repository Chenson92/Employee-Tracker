const { default: inquirer } = require("inquirer");
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

const addEmployees = () => {
  db.query("SELECT * FROM role", (err, roles) => {
    if (err) console.log(err);
    roles = roles.map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
  });
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What is the employee’s first name?",
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee’s role?",
      },
      {
        type: "list",
        name: "role",
        message: " What is the employee’s role?",
        choices: [
          "Sales Lead",
          "Salesperson",
          "Lead Engineer",
          "Soft Engineer",
          "Account Manager",
          "Accountant",
          "Legal Team Lead",
          "Lawyer",
        ], // how to add new role
      },
      {
        type: "list",
        name: "manager",
        message: "what is the employee’s manager?",
        choices: [
          "null",
          "John Doe",
          "Mike Chan",
          "Ashley Rod",
          "Kevin Tupik",
          "Kunal Singh",
          "Malia Brown",
        ],
      },
    ])
    .then((data) => {
      let dbQuery = `INSERT INTO employee(first_name, last_name, role_id, manager_id)
  VALUES('${data.firstName}','${data.lastName}','${data.manager}');`;
    });

  console.log(`Added ${data.firstName}' '${data.lastName} to the database`);

  db.connect(function () {
    addEmployees();
  });
};

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

const addRole = () => {
  db.query("SELECT * FROM department", (err, departments) => {
    if (err) console.log(err);
    departments = departments.map((department) => {
      return {
        name: department.name,
        value: department.id,
      };
    });
  });
  inquirer
    .prompt([
      {
        type: "input",
        name: "roleName",
        message: "What is the name of the role?",
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of the role",
      },
      {
        type: "list",
        name: "departmentName",
        message: "Which department does the role belong to?",
        choices: ["Engineering", "Finance", "Sales", "Legal"],
      }, // how to update the new department in
    ])
    .then((data) => {
      let dbQuery = `INSERT INTO role(title, salary, department_id)
        VALUES('${data.roleName}','${data.salary}','${data.departmentName}');`;
    });

  console.log(`Added ${data.roleName} to the database`);

  db.connect(function () {
    addRole();
  });
};

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

const updateEmployeeRole = () => {
  db.query("SELECT * FROM employee", (err, employees) => {
    if (err) console.log(err);
    employees = employees.map((employee) => {
      return {
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      };
    });
    db.query("SELECT * FROM role", (err, roles) => {
      if (err) console.log(err);
      roles = roles.map((role) => {
        return {
          name: role.title,
          value: role.id,
        };
      });
      inquirer
        .prompt([
          {
            type: "list",
            name: "selectEmployee",
            message: "Which employee’s role do you want to update?",
            choices: employees,
          },
          {
            type: "list",
            name: "selectRole",
            message: "Which role do you want to assign the selected employee?",
            choices: roles,
          },
        ])
        .then((data) => {
          let dbQuery = `UPDATE employee
            SET role_id='${data.selectRole}'
            WHERE id=${data.selectEmployee};`;
        });
      console.log("Updated emplyee’s role");
      displayRoles();
    });
  });
};

{
}
db.connect(function () {
  updateEmployeeRole();
});

db.connect((err) => {
  if (err) throw err;
  main();
});
