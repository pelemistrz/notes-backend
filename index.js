import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";

const app = express();
const port = 3100;
const saltRounds = 10;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

//midllewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

async function getUsers() {
  const result = await db.query("SELECT * from users");
}

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

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
          const result = await db.query(
            "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *",
            [name, email, hash]
          );
          const userId = result.rows[0].id;
          res.send({
            userId: userId,
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
    } else {
      res.json({
        error: "Invalid credentails",
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

app.put("/api/notes/:noteId", async (req, res) => {
  const noteId = req.params.noteId;
  const { newTitle, newContent } = req.body;
  try {
    const result = await db.query(
      "UPDATE notes SET title = $2, content=$3 where id = $1 RETURNING *",
      [noteId, newTitle, newContent]
    );
    res.status(201).json({
      message: "Note updatet successfully",
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
