import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 4000;
const saltRounds = 10;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "notes",
  password: "polska12",
  port: 5432,
});
db.connect();

//midllewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

async function getUsers() {
  const result = await db.query("SELECT * from users");
  console.log(result.rows);
}

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (checkResult.rows.length > 0) {
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const user = await db.query(
            "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *",
            [name, email, hash]
          );

          res.send({
            userId: user.id,
          });
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * from users where email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      const storedHashedPassword = user.password;
      bcrypt.compare(password, storedHashedPassword, (error, result) => {
        if (error) {
          console.error("Error comparing passwords: ", error);
        } else {
          if (result) {
            console.log(user);
            res.send({
              userId: user.id,
            });
          } else {
            res.json({
              error: "Invalid credentails",
            });
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/notes/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await db.query("Select * from notes where user_id=$1", [
      userId,
    ]);
    const notes = result.rows;
    res.json(notes);
  } catch (error) {
    console.log(error);
  }
});
app.post("/api/notes/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { title, content } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO notes (user_id,title,content) VALUES ($1,$2,$3) RETURNING *",
      [userId, title, content]
    );
    res.status(201).json({
      message: "Note created successfully",
      note: result.rows[0], // Zwracamy nowo utworzoną notatkę
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something wrong with db");
  }
});

app.delete("/api/notes/:noteId", async (req, res) => {
  const noteId = req.params.noteId;
  try {
    const result = await db.query(
      "Delete from notes where id = $1 RETURNING *",
      [noteId]
    );
    res.status(201).json({
      message: "Note deleted successfully",
      note: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("sth wrong with db");
  }
});

app.listen(port, () => {
  console.log(`on port ${port}`);
});
