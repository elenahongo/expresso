const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = require('./timesheets');

  employeesRouter.param('employeeId', (req, res, next, id) => {
    db.get(`SELECT * FROM employee WHERE id=$id`, {$id: id}, (err, row) => {
      if(err){
        next(err);
      } else if (row){
      req.employee = row;
      next();
      } else {
        return res.sendStatus(404);
      }    
    });
  });

  employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

  employeesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * from employee WHERE is_current_employee=1`, (err, rows) => {
      if(err){
        next(err);
      }
      res.status(200).send({employees: rows});  
    });
  });

  employeesRouter.post('/', (req, res, next) => {
    let newEmployee = req.body.employee;
    if (!newEmployee.name || 
      !newEmployee.position || 
      !newEmployee.wage){
        return res.sendStatus(400);
      }
    let employee = newEmployee.isCurrentEmployee === 0 ? 0 : 1;
    db.run(`INSERT INTO employee (name, position, wage, is_current_employee) 
            VALUES ($name, $position, $wage, $employee)`, 
            {
              $name: newEmployee.name, 
              $position: newEmployee.position, 
              $wage: newEmployee.wage, 
              $employee: employee
            }, function(err){
              if(err){
                next(err);
              }
              db.get(`SELECT * FROM employee WHERE id=$lastId`, {$lastId: this.lastID}, (err, row) => {
                res.status(201).send({employee: row});
              });
            });
  });

  employeesRouter.get('/:employeeId', (req, res, next)=> {
    res.status(200).send({employee: req.employee});
  });

  employeesRouter.put('/:employeeId', (req, res, next) => {
    let updateReq = req.body.employee;
    let employee = updateReq.isCurrentEmployee === 0? 0 : 1;
    if (!updateReq.name || 
      !updateReq.position || 
      !updateReq.wage) {
        return res.sendStatus(400);
      } 
      
    db.run(`UPDATE employee SET name=$name, 
    position=$position, 
    wage=$wage, 
    is_current_employee=$employee WHERE id=$id`, {
      $name: updateReq.name, 
      $position: updateReq.position, 
      $wage: updateReq.wage, 
      $employee: employee,
      $id: req.params.employeeId
      }, (err, row) => {
        if(err){
          next(err);
        } 
        db.get(`SELECT * FROM employee WHERE id=$id`, {$id: req.params.employeeId}, (err, row) => {
          res.status(200).send({employee: row});
        });
      });
  });

  employeesRouter.delete('/:employeeId', (req, res, next) => {
    db.run(`UPDATE employee SET is_current_employee=0 WHERE id=$id`, {$id: req.params.employeeId}, (err) => {
      if(err){
        next(err);
      }
      db.get(`SELECT * FROM employee WHERE id=$id`, {$id: req.params.employeeId}, (err, row)=> {
      res.status(200).send({employee: row});
    });
    });
  });

module.exports = employeesRouter;