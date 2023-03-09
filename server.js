var express = require("express")
var app = express()
var db = require("./database.js")

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server port
var HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

//get all jokes
app.get("/api/jokes", (req, res, next) => {
    var sql =
    `SELECT j.id, joke, likes, dislikes, category FROM jokes j 
     JOIN joke_category jc ON j.id = jc.joke_id
     JOIN categories c ON c.id = jc.category_id
     ORDER BY j.id ASC`
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//get joke by id
app.get("/api/jokes/:id", (req, res, next) => {
    var sql = 
    `SELECT j.id, joke, likes, dislikes, category FROM jokes j
     JOIN joke_category jc ON jc.joke_id = j.id
     JOIN categories c ON c.id = jc.category_id 
     WHERE j.id = ?`
    var params = [req.params.id]
    db.all(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

//get all jokes of specific category
app.get("/api/jokes/categories/:category", (req, res, next) => {
    var sql = 
    `SELECT j.id, joke, category FROM jokes j
     JOIN joke_category jc ON jc.joke_id = j.id
     JOIN categories c ON c.id = jc.category_id 
     WHERE c.category = ?`
    var params = [req.params.category]
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//get list of categories
app.get("/api/jokes/category/list/all", (req, res, next) => {
    var sql = 
    `SELECT *
     FROM categories`
    var params = [req.params.gategory]
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//get random one from all
app.get("/api/jokes/random/all", (req, res, next) => {
    var sql = 
    `SELECT j.id, joke, likes, dislikes, category FROM jokes j
     JOIN joke_category jc ON j.id = jc.joke_id
     JOIN categories c ON jc.category_id = c.id
     ORDER BY random() limit 1`
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//select random one from specific category
app.get("/api/jokes/random/:category", (req, res, next) => {
    var sql = 
    `SELECT j.id, joke, likes, dislikes, category FROM jokes j
     JOIN joke_category jc ON j.id = jc.joke_id
     JOIN categories c ON jc.category_id = c.id
     WHERE c.category = ? 
     ORDER BY RANDOM() LIMIT 1`
    var params = [req.params.category]
    
    db.all(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

//show all jokes in order of likes
app.get("/api/jokes/likes/order", (req, res, next) => {
    var sql =
    `SELECT * FROM jokes 
     ORDER BY likes DESC`
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

//add with category name or category_id?
/*
app.post("/api/joke/", (req, res, next) => {
    var errors=[]
    if (!req.body.joke){
        errors.push("No joke specified");
    }
    if (!req.body.category_id){
        errors.push("No category_id specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        joke: req.body.joke,
        likes: 0,
        dislikes: 0,
        category_id: req.body.category_id
        }

    var sql1 = 'INSERT INTO jokes (joke, likes, dislikes) VALUES (?,?,?)'
    var params1 = [data.joke, data.likes, data.dislikes]
    var sql2 = 'INSERT INTO joke_category (joke_id, category_id) VALUES (?,?)'
    var params2 = []

    db.run(sql1, params1, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }

        jokesID = this.lastID
        params2.push( jokesID.toString(), data.category_id)
        
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
        
        db.run(sql2, params2, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
    });

    });
})
*/

//add new joke to a category with category_id
//key: joke
app.post("/api/joke/category/:id", (req, res, next) => {
    var errors = []
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        joke: req.body.joke,
        likes: 0,
        dislikes: 0,
        jokeid: 0
    }
    var sql ='INSERT INTO jokes (joke, likes, dislikes) VALUES (?,?,?)'
    var sql1 ='INSERT INTO joke_category (category_id, joke_id) VALUES (?,?)'
    var params =[data.joke, data.likes, data.dislikes]
    var params1 = []
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        jokesId = this.lastID
        params1.push(req.params.id, jokesId.toString())

        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })

        db.run(sql1, params1, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }

    });

    })

})

//add category
//key: category
app.post("/api/joke/category", (req, res, next) => {
    var errors=[]
    if (!req.body.category){
        errors.push("No category specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        category: req.body.category
    }
    var sql ='INSERT INTO categories (category) VALUES (?)'
    var params =[data.category]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

//modify joke with id: not working
/*
app.patch("/api/jokes/:id", (req, res, next) => {
    var data = {
        joke: req.body.joke
    }
    db.run(
        `UPDATE jokes set 
           joke = COALESCE(?,joke), 
           WHERE id = ?`,
        [data.joke, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})
*/

//add category to joke with joke_id
//key: joke_id, category_id
app.post("/api/joke/jc/add", (req, res, next) => {
    var errors=[]
    if (!req.body.joke_id){
        errors.push("No id specified");
    }
    if (!req.body.category_id){
        errors.push("No category specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        joke_id: req.body.joke_id,
        category_id: req.body.category_id
    }
    var sql ='INSERT INTO joke_category (joke_id, category_id) VALUES (?,?)'
    var params =[data.joke_id, data.category_id]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

//give vote
//key: likes, dislikes
app.put("/api/jokes/vote/:id", (req, res, next) => {

    var data = {
        likes: req.body.likes,
        dislikes: req.body.dislikes,
        //modified: new Date().toLocaleString()
    }
    var voted = {
        like: 0,
        dislike: 0
    }
    if (!data.likes&& !data.dislikes){
        console.log("No votes given!");
    }else {
        if (data.likes){
            voted.like = 1;
        }
        if (data.dislikes){
            voted.dislike = 1;
        }
        db.run(
            `UPDATE jokes SET 
               likes = likes + ?,
               dislikes = dislikes + ?
               where id=?
               `,
            [voted.like, voted.dislike, req.params.id],
            function (err, result) {
                if (err){
                    res.status(400).json({"error": res.message})
                    return;
                }
                res.json({
                    message: "success",
                    data: data,
                    changes: this.changes
                })
        });
    }

})

app.delete("/api/joke/:id", (req, res, next) => {
    db.run(
        'DELETE FROM jokes WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

app.delete("/api/jc/:id", (req, res, next) => {
    db.run(
        'DELETE FROM joke_category WHERE joke_id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

app.use(function(req, res){
    res.status(404);
});