const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.body;
  const userExists = users.some((user) => user.username === username);
  if(userExists){
    return response.status(400).json({ error: 'User already exist'});
  }
  
  return next();
}

app.post('/users', checksExistsUserAccount, (request, response) => {
  const {name, username} = request.body;

  const data = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }

  users.push(data);

  return response.status(201).json(data);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const {title, deadline} = request.body;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date(),
  }

  const newUsers = users.map((user) => {
    if(user.username === username){
      return {
        ...user,
        todos: [...user.todos, todo]
      }
    }
    return user;
  });

  users = newUsers;

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = users.find(user => user.username === username);
  const recoverTodo = user.todos.find((todo) => todo.id === id)

  if(!recoverTodo) {
    return response.status(404).json({error: 'todo not found!.'})
  }

  recoverTodo.title = title;
  recoverTodo.deadline = deadline;

  return response.status(201).json(recoverTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id} = request.params;

  const user = users.find(user => user.username === username);
  const recoverTodo = user.todos.find((todo) => todo.id === id)

  if(!recoverTodo) {
    return response.status(404).json({error: 'todo not found!.'})
  }

  recoverTodo.done = true;

  

  return response.status(201).json(recoverTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id} = request.params;

  const user = users.find(user => user.username === username);
  const recoverTodo = user.todos.find((todo) => todo.id === id)

  if(!recoverTodo) {
    return response.status(404).json({error: 'todo not found!.'})
  }

  user.todos.splice(recoverTodo, 1);

  return response.status(204).send();
});

module.exports = app;