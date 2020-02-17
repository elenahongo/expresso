const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetsRouter = express.Router({mergeParams: true});
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

  timesheetsRouter.param('timesheetId', (req, res, next) => {
    db.get(`SELECT * FROM timesheet WHERE id=$timeId`, {
      $timeId: req.params.timesheetId
    }, (err, row) => {
      if(err){
        next(err)
      } else if (row) {
      req.timesheet = row;
      next();
    } else {
      return res.sendStatus(404);
    }
    });
  });

  timesheetsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM timesheet WHERE employee_id=$employeeId`, {$employeeId: req.params.employeeId}, (err, rows) => {
      if(err){
        next(err);
      }
      res.status(200).send({timesheets: rows})
    });
  });
  
  timesheetsRouter.post('/', (req, res, next) => {
    let newTime = req.body.timesheet;
    if(!newTime.hours ||
      !newTime.rate ||
      !newTime.date) {
        return res.sendStatus(400);
      } 

    db.run(`INSERT INTO timesheet (hours, rate, date, employee_id) 
    VALUES ($hours, $rate, $date, $employee_id)`, {
      $hours: newTime.hours, 
      $rate: newTime.rate, 
      $date: newTime.date, 
      $employee_id: req.params.employeeId
    }, function(err){
      if(err){
        next(err);
      }
      db.get(`SELECT * FROM timesheet WHERE id=$id`, {
        $id: this.lastID
      }, (err, row) => {
        res.status(201).send({timesheet: row});
      });
    });
  });


  timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    let updateTime = req.body.timesheet;
    if(!updateTime.hours || 
      !updateTime.rate ||
      !updateTime.date) {
        return res.sendStatus(400);
      }
    db.run(`UPDATE timesheet SET hours=$hours, rate=$rate, date=$date WHERE id=$timeId`, {
      $hours: updateTime.hours,
      $rate: updateTime.rate,
      $date: updateTime.date,
      $timeId: req.params.timesheetId
    }, function (err) {
      if(err){
        next(err);
      }
      db.get(`SELECT * FROM timesheet WHERE id=$id`, {$id: req.params.timesheetId}, (err, row)=> {
       res.status(200).json({timesheet:row}); 
      });
    });
  });

timesheetsRouter.delete('/:timesheetId', (req, res, next)=>{
  db.run(`DELETE FROM timesheet WHERE id=$id`, {$id: req.params.timesheetId}, (err)=>{
    if(err){
      next(err)
    }
     res.sendStatus(204);
  });
});


module.exports = timesheetsRouter;