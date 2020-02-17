const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const itemsRouter = require('./menuitems');

  menusRouter.param('menuId', (req, res, next, id) => {
    db.get(`SELECT * FROM menu WHERE id=$id`, {$id: id}, (err, row) => {
      if(err){
        next(err);
      } else if (row){
        req.menu = row;
        next();
      } else {
        return res.sendStatus(404);
      }
    });
  });

  menusRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM menu`, (err, rows) => {
      if(err){
        next(err);
      }
      res.status(200).json({menus: rows})
    }); 
  });

  menusRouter.post('/', (req, res, next) => {
    let newMenu = req.body.menu;
    if(!newMenu.title) {
      return res.sendStatus(400);
    }
    db.run(`INSERT INTO menu (title) VALUES ($title)`, {
      $title: newMenu.title
    }, function(err){
      if(err){
        next(err);
      }
        db.get(`SELECT * FROM menu WHERE id=$id`, {$id: this.lastID}, (err, row)=> {
          res.status(201).json({menu: row});
        });
    });
  });

  menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
  });


  menusRouter.put('/:menuId', (req, res, next)=>{
    let updateMenu = req.body.menu;
    if(!updateMenu.title){
      return res.sendStatus(400);
    }
    db.run(`UPDATE menu SET title=$title WHERE menu.id = $menuId`, {$title: updateMenu.title, $menuId: req.params.menuId}, (err)=>{  
      if(err){
        next(err);
      }
      db.get(`SELECT * FROM menu WHERE id=$id`, {
        $id: req.params.menuId
      }, 
      (err, row)=>{
        res.status(200).json({menu: row});
      });
    })
  });

  menusRouter.delete('/:menuId', (req, res, next)=>{
    db.get(`SELECT * FROM menuItem WHERE menu_id=$menuId`, {
      $menuId: req.params.menuId
    }, (err, row)=> {
      if(err) {
        next(err);
      } else if (row) {
        return res.sendStatus(400);
      } else {
    db.run(`DELETE FROM menu WHERE id=$id`, {$id: req.params.menuId}, (err) => {
      if(err){
        next(err);
      }
      return res.sendStatus(204)
      }
    )};
  });
  });

  menusRouter.use('/:menuId/menu-items', itemsRouter);

module.exports = menusRouter;