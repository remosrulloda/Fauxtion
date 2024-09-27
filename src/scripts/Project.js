// Project.js
import ToDo from "./ToDo.js";

class Project {
  constructor(name) {
    this.name = name;
    this.todos = [];
  }

  addTodo(todo) {
    this.todos.push(todo);
  }

  removeTodo(todo) {
    this.todos = this.todos.filter(t => t.id !== todo.id);
  }

  // Convert Project object to JSON
  toJSON() {
    return {
      name: this.name,
      todos: this.todos.map((todo) => todo.toJSON()),
    };
  }

  static fromJSON(json) {
    const project = new Project(json.name);
    project.todos = json.todos.map((todoJson) => ToDo.fromJSON(todoJson));
    return project;
  }

  renameProject(newName) {
    this.name = newName;
  }
}

export default Project;
