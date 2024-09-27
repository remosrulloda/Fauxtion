// css import
import "../assets/styles.css";
import "../assets/project.css";
import "../assets/todo.css";

import { format, formatDistanceToNow, formatRelative, subDays } from 'date-fns';

// scripts
import ProjectManager from "./ProjectManager";
import ToDo from "./ToDo";
import UI from "./UI";
import Project from "./Project";

let pm = new ProjectManager();
pm.loadFromLocalStorage(); // Load Saved Data

// Loads default project
if (pm.projects.length === 0) {

  const date = new Date();
  const twoDaysLater = new Date();
  twoDaysLater.setDate(date.getDate() + 2); // Add 2 days to the current date

  const defaultToDoJSON = {
    name: 'Default Project',
    todos: [
      {
        title: 'Finish homework',
        priority: 'high',
        dueDate: twoDaysLater,
        project: 'Default Project',
        completed: false,
      },
    ],
  };

  const defaultProject = Project.fromJSON(defaultToDoJSON);

  pm.projects.push(defaultProject);
  pm.currentProject = defaultProject;

  pm.saveToLocalStorage();
}

let ui = new UI(pm);
ui.loadProjectUI();

// Function to render todos
function fn60sec() {
  try {
    ui.renderToDos();
  } catch (error) {
    console.error('Error rendering todos:', error);
  }
}

// Initial call and interval setup
fn60sec();
setInterval(fn60sec, 60 * 1000);