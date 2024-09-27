// ToDo.js

import { v4 as uuidv4 } from "uuid";

class ToDo {
  constructor(title, priority, project, dueDate, completed = false) {
    this.id = uuidv4();
    this.title = title;
    this.priority = priority;
    this.dueDate = dueDate;
    this.completed = completed;
    this.project = project;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  // Converts ToDo into JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      priority: this.priority,
      project: this.project,
      dueDate: this.dueDate,
      completed: this.completed
    };
  }

  // Creates a ToDo object from JSON
  static fromJSON(json) {
    return new ToDo(
      json.title,
      json.priority,
      json.project,
      json.dueDate,
      json.completed,
    );
  }
}

export default ToDo;
