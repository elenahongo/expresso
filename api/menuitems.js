const express = require('express');
const itemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

    itemsRouter.param('menuItemId', (req, res, next, id)=>{
        db.get(`SELECT * FROM menuitem WHERE id=$id`, {$id: id}, (err, row)=>{
            if(err){
                next(err);
            }
            else if (row) {
                req.menuItem = row;
                next();
            } else {
                return res.sendStatus(404);
            }
        });
    });

    itemsRouter.get('/', (req, res, next)=>{
        db.all(`SELECT * FROM menuitem WHERE menu_id=$menuId`, {
            $menuId: req.params.menuId
        }, (err, rows)=>{
            if(err){
                next(err);
            }
            res.status(200).json({menuItems: rows})
        });
    });

    itemsRouter.post('/', (req, res, next)=>{
        let newItem = req.body.menuItem;
        if(!newItem.name 
           || !newItem.description
           ||  !newItem.inventory
           ||  !newItem.price){
               return res.sendStatus(400);
           } 
        db.run(`INSERT INTO menuitem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`, {
            $name: newItem.name, 
            $description: newItem.description, 
            $inventory: newItem.inventory, 
            $price: newItem.price, 
            $menuId: req.params.menuId
        }, function(err){
            if(err){
                next(err);
            }
            db.get(`SELECT * FROM menuitem WHERE id=$id`, {$id: this.lastID}, (err, row)=>{
                res.status(201).json({menuItem: row});
            });
        });
    });

    itemsRouter.put('/:menuItemId', (req, res, next)=>{
        let newItem = req.body.menuItem;
        if(!newItem.name 
           || !newItem.description
           ||  !newItem.inventory
           ||  !newItem.price){
               return res.sendStatus(400);
           } 
        db.run(`UPDATE menuitem SET name=$name, description=$description, inventory=$inventory, price=$price WHERE id=$id`,{
            $name: newItem.name,
            $description: newItem.description,
            $inventory: newItem.inventory,
            $price: newItem.price,
            $id: req.params.menuItemId
        }, (err)=>{
                if(err){
                    next();
                }
                db.get(`SELECT * FROM menuitem WHERE id=$id`, {$id: req.params.menuItemId}, (err, row)=>{
                    res.status(200).json({menuItem: row})
                });
            });
        });

        itemsRouter.delete('/:menuItemId', (req, res, next)=>{
            db.run(`DELETE FROM menuitem WHERE id=$id`, {
                $id: req.params.menuItemId
            }, (err)=>{
                if(err){
                    next(err);
                }
               res.sendStatus(204);
            });
        });

module.exports = itemsRouter;