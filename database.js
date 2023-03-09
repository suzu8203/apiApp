var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')

        //jokes
        db.run(`CREATE TABLE jokes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            joke TEXT, 
            likes INTEGER,
            dislikes INTEGER
        )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                var insert = 'INSERT INTO jokes (joke, likes, dislikes) VALUES (?,?,?)'
                db.run(insert, ["What is the biggest lie in the entire universe? I have read and agree to the Terms & Conditions.",0,0])
                db.run(insert, ["Debugging is like being the detective in a crime movie where you are also the murderer.",0,0])
            }
        });
        
        //categories
        db.run(`CREATE TABLE categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT
        )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                var insert = 'INSERT INTO categories (category) VALUES (?)'
                db.run(insert, ["BadJokes"])
                db.run(insert, ["ComputerJokes"])
            }
        });

        //joke_category
        db.run(`CREATE TABLE joke_category (
            joke_id INTEGER,
            category_id INTEGER,
            FOREIGN KEY (joke_id) REFERENCES jokes(id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                var insert = 'INSERT INTO joke_category (joke_id, category_id) VALUES (?,?)'
                db.run(insert, [1,2])
                db.run(insert, [2,2])
            }
        });
    }
});


module.exports = db