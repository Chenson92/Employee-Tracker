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
      // console.log(answer);
      switch (answer.options) {
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

// Show the employee table
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
    if (error) console.log(error);
    console.table(results);
    main();
  });
};

// Show the role table
const displayRoles = () => {
  let dbQuery = `SELECT * FROM role
  JOIN department ON role.department_id=department.id;`;
  db.query(dbQuery, function (error, results) {
    if (error) console.log(error);
    console.table(results);
    main();
  });
};

// Show the department table
const displayDepartments = () => {
  let dbQuery = `SELECT * FROM department;`;
  db.query(dbQuery, function (error, results) {
    if (error) console.log(error);
    console.table(results);
    main();
  });
};

// Add departments
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
        VALUES('${data.departmentName}');`;
      db.query(dbQuery, function (error, results) {
        console.table(results);
        if (error) console.log(error);
      });
      console.log(`Added ${data.departmentName} to the database`);
      main();
    });
};

// Add new roles
const addRole = () => {
  db.query("SELECT * FROM department", (err, departments) => {
    if (err) console.log(err);
    departments = departments.map((department) => {
      return {
        name: department.name,
        value: department.id,
      };
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
          choices: departments,
        },
      ])
      .then((data) => {
        let dbQuery = `INSERT INTO role(title, salary, department_id)
      VALUES('${data.roleName}','${data.salary}','${data.departmentName}');`;
        db.query(dbQuery, function (error, results) {
          console.table(results);
          if (error) console.log(error);
        });
        console.log(`Added a new role to the database`);
        main();
      });
  });
};

// Add new employees
const addEmployees = () => {
  db.query("SELECT * FROM role", (err, roles) => {
    if (err) console.log(err);
    roles = roles.map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
    db.query(
      "SELECT * FROM employee WHERE manager_id IS NULL",
      (err, managers) => {
        if (err) console.log(err);
        managers = managers.map((manager) => {
          return {
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id,
          };
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
              message: "What is the employee’s last name?",
            },
            {
              type: "list",
              name: "roleId",
              message: " What is the employee’s role?",
              choices: roles,
            },
            {
              type: "list",
              name: "manager",
              message: "what is the employee’s manager?",
              choices: managers,
            },
          ])
          .then((data) => {
            let dbQuery = `INSERT INTO employee(first_name, last_name, role_id, manager_id)
      VALUES('${data.firstName}','${data.lastName}','${data.roleId}', '${data.manager}');`;
            db.query(dbQuery, function (error, results) {
              console.table(results);
              if (error) console.log(error);
            });
            console.log(`Added a new employee to the database`);
            main();
          });
      }
    );
  });
};

//Update employee role
const updateEmployeeRole = () => {
  db.query("SELECT * FROM employee", (err, employees) => {
    if (err) console.log(err);
    const employees2 = employees.map((employee) => {
      return {
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      };
    });

    db.query("SELECT * FROM role", (err, roles) => {
      if (err) console.log(err);
      const roles2 = roles.map((role) => {
        return {
          name: role.title,
          value: role.id,
        };
      });

      inquirer
        .prompt([
          {
            type: "list",
            name: "employeeId",
            message: "Which employee’s role do you want to update?",
            choices: employees2,
          },
          {
            type: "list",
            name: "roleId",
            message: " Which role do you want to assign the selected employee?",
            choices: roles2,
          },
        ])
        .then((data) => {
          const employeeId = data.employeeId;
          const roleId = data.roleId;
          db.query(
            `UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId}`,
            (err, results) => {
              if (err) console.log(err);
              console.log(`Updated employee's role successfully!`);
              main();
            }
          );
        });
    });
  });
};
main();
