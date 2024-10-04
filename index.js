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
          const result = await db.query(
            "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *",
            [name, email, hash]
          );
          // const token = jwt.sign({ email: result.email }, "secretKey", {
          //   expires: "24h",
          // });
          res.json({
            token: "test",
            userId: result.id,
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
            console.log(result);
            res.json({
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

app.listen(port, () => {
  console.log(`on port ${port}`);
});
