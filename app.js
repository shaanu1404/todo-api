const express = require("express");
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {});
const host = server.address().address;

app.get("/", async (req, res) => {
  const allTodos = await prisma.todo.findMany();
  return res.status(200).json(
    allTodos.map((todo) => {
      return {
        ...todo,
        absoluteUrl: `${host}/${todo.id}`,
      };
    })
  );
});

app.post("/", async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(422).json({
      message: "Invalid data.",
      errors: ["Title is required."],
    });
  }
  try {
    const todo = await prisma.todo.create({
      data: { title, description },
    });
    return res.status(200).json(todo);
  } catch (e) {
    return res.status(500).json({
      message: "Unable to create todo.",
      errors: [e.message],
    });
  }
});

app.get("/:id", async (req, res) => {
  const id = +req.params.id;
  const todo = await prisma.todo.findUnique({ where: { id: id } });
  if (!todo)
    return res.status(404).json({
      message: "Not found.",
      errors: ["Invalid todo id."],
    });
  return res.status(200).json(todo);
});
