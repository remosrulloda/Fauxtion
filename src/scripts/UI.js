// UI.js

import ProjectManager from "./ProjectManager.js";
import Project from "./Project.js";
import ToDo from "./ToDo.js";
import flatpickr from 'flatpickr';
import confirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate';

import { formatDistance, compareDesc } from 'date-fns';

document.addEventListener('DOMContentLoaded', () => {
  flatpickr('.flatpickr-date', {
    altInput: true,
    enableTime: true,
    minDate: 'today',
    static: true,
    "plugins": [
      new confirmDatePlugin({})
    ],
  });
});


// Returns the caption for each todo due date
function formatDate(time) {
  const now = new Date();
  const dueDate = new Date(time);

  const firstPart = formatDistance(now, time);
  const result = compareDesc(now, dueDate);

  let secondPart = '';

  if (result === -1) {
    secondPart = ' ago';
  } else if (result === 1) {
    secondPart = ' left';
  }

  return firstPart + secondPart;
}

class UI {
  constructor(projectManager) {
    this.projectManager = projectManager;
    this.projectList = document.querySelector(".project-container");
    this.projectToDos = document.querySelector(".todo-container");

    this.addProjectBtn = document.querySelector(".add-project");
    this.addProjectForm = document.querySelector(".add-project-form");
    this.cancelProjectBtn = document.querySelector("#hideProjectForm");

    this.addToDoBtn = document.querySelector(".add-todo");
    this.addToDoForm = document.querySelector(".add-todo-form");
    this.cancelToDoBtn = document.querySelector("#hideToDoForm");

    this.cancelEditBtn = document.querySelector('#hideEditForm');

    this.editToDoForm = document.querySelector('.edit-todo-form');

    // Bind Methods
    this.handleAddProjectFormSubmit = this.handleAddProjectFormSubmit.bind(this);
    this.handleAddToDoFormSubmit = this.handleAddToDoFormSubmit.bind(this);

    // Event Listeners
    // Add Project Button Function
    this.addProjectBtn.addEventListener("click", this.toggleProjectForm.bind(this));
    this.cancelProjectBtn.addEventListener("click", this.hideProjectForm.bind(this));

    this.addToDoBtn.addEventListener("click", this.toggleToDoForm.bind(this));
    this.cancelToDoBtn.addEventListener("click", this.hideToDoForm.bind(this));

    this.cancelEditBtn.addEventListener('click', this.hideEditForm.bind(this));

    // Handle Form Submission
    this.addProjectForm.querySelector(".submit").addEventListener("click", this.handleAddProjectFormSubmit);
    this.addToDoForm.querySelector(".submit").addEventListener("click", this.handleAddToDoFormSubmit);

    this.autoUpdateInterval = null;
  }

  // Displays add new project form
  toggleProjectForm() {
    if (this.addProjectForm.style.display === "none" || this.addProjectForm.style.display === "") {
      this.addProjectForm.style.display = "block";

      // Focuses on input
      const input = this.addProjectForm.querySelector('form').elements['project-name'];
      input.focus();

      this.addProjectBtn.style.display = "none";

      document.addEventListener('keydown', this.handleEscapePress.bind(this));
    }
  }

  // Hides project form
  hideProjectForm() {
    this.addProjectForm.style.display = "none";
    this.addProjectBtn.style.display = "block";

    const input = this.addProjectForm.querySelector('form').elements['project-name'];

    input.value = '';

    document.removeEventListener('keydown', this.handleEscapePress.bind(this));
  }

  // Escape press
  handleEscapePress(event) {
    if (event.key === 'Escape') {
      this.hideToDoForm();
      this.hideProjectForm();
      this.hideEditForm();
    }
  }


  // Displays add to do form
  toggleToDoForm() {
    this.addToDoForm.showModal();

    // Focuses on input
    const input = this.addToDoForm.querySelector('form').elements['todo-title'];
    input.focus();

    const select = this.addToDoForm.querySelector('form').elements['project'];
    let size = this.projectManager.getProjectsSize();

    if (select) {
      select.innerHTML = '';

      for (let i = 0; i < size; i++) {
        let opt = this.projectManager.projects[i];
        let el = document.createElement('option');
        el.text = String(opt.name);
        el.value = String(opt.name);
        select.add(el);
      }

      select.selectedIndex = this.projectManager.getCurrentProjectIndex();
    }
  }

  // Hides the to do form
  hideToDoForm() {
    this.addToDoForm.close();
  }

  // Hides edit form
  hideEditForm() {
    if (this.editToDoForm) {
      this.editToDoForm.close();
    }
  }

  // Load Default project
  loadDefaultProject() {
    const defaultProject = new Project("Default Project");
    this.projectManager.addProject(defaultProject);
    this.projectManager.setCurrentProject(defaultProject);
    this.loadProjectUI();
    this.renderToDos();
  }

  // Load Project UI
  loadProjectUI() {
    this.projectList.innerHTML = "";
    this.projectManager.projects.forEach((project) => {
      let currentProject = this.projectManager.getCurrentProject();

      // Creates Project List Element
      const projectDiv = document.createElement("div");
      projectDiv.classList.add("project");
      projectDiv.innerHTML = `
                <p class='project-title'>${project.name}</p>
                <div class='project-buttons'>
                    <button class='rename svg'><span class="renameSvg material-symbols-outlined">edit_square</span></button>
                    <button class='delete svg'><span class="deleteSvg material-symbols-outlined">delete</span></button>                    
                </div>
      `;

      // Attach functionality to buttons
      const deleteBtn = projectDiv.querySelector('.delete');
      const renameBtn = projectDiv.querySelector('.rename');

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteCurrentProject(project);
      });

      renameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.renameCurrentProject(projectDiv);
      });

      if (project === currentProject) this.setActiveProject(projectDiv);

      projectDiv.addEventListener("click", () => {
        this.projectManager.setCurrentProject(project);
        this.renderToDos();
        this.setActiveProject(projectDiv);
      });

      this.projectList.appendChild(projectDiv);
    });
  }

  // Shows all Todos for a project
  renderToDos() {

    this.projectToDos.innerHTML = "";

    let todos = [];
    let currentProject = this.projectManager.getCurrentProject();

    if (!currentProject) {
      this.projectToDos.innerHTML = '';
      return;
    };

    todos = currentProject.todos;

    // Render todos
    todos.forEach((todo) => {

      const toDoDiv = document.createElement("div");
      toDoDiv.classList.add('todo');
      toDoDiv.classList.add(`${todo.priority}`);

      toDoDiv.innerHTML = `
        <div class='todo-grouping'> 
          <div class='todo-check-section'> 
              <input type='checkbox' ${todo.completed ? "checked" : ""}>
          </div>
          <div class="todo-text-section-${todo.completed}"> 
              <p class="todo-title">${todo.title}</p>
              <p id='time-until' class="todo-${todo.priority}"></p>
          </div>
        </div>
        <div class="todo-action-${todo.priority}">
            <button class='editToDo svg'><span class="renameSvg material-symbols-outlined">edit_square</span></button>
        </div>
            `;

      const priority = toDoDiv.querySelector('#time-until');
      priority.textContent = formatDate(todo.dueDate);

      const checkbox = toDoDiv.querySelector("input[type='checkbox']");
      checkbox.addEventListener("click", () => {
        todo.toggleComplete();
        this.renderToDos();
        this.projectManager.saveToLocalStorage();
      });

      const editTask = toDoDiv.querySelector('.editToDo');
      editTask.addEventListener('click', () => {
        this.showEditDialog(todo);
      });

      this.projectToDos.append(toDoDiv);
    });
  }

  showEditDialog(todo) {
    const editToDoForm = document.querySelector('.edit-todo-form');
    const form = editToDoForm.querySelector('form');

    form.elements["todo-title"].value = todo.title;
    form.elements["project"].value = todo.project;
    form.elements["priority"].value = todo.priority;
    form.elements["date"].val = todo.dueDate;

    console.log(todo.project);

    const projectSelect = form.elements["project"];
    projectSelect.innerHTML = '';
    this.projectManager.projects.forEach(project => {
      let option = document.createElement("option");
      option.value = project.name;
      option.textContent = project.name;
      if (project.name === todo.project) {
        option.selected = true;
      }
      projectSelect.appendChild(option);
    });

    editToDoForm.showModal();

    // Event listener for delete button
    const deleteBtn = editToDoForm.querySelector("#edit-task-delete");
    deleteBtn.addEventListener("click", () => {
      this.deleteToDo(todo);
      editToDoForm.close();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleEditToDoFormSubmit(todo);
      editToDoForm.close();
    });

  }

  // Handles edit form for task
  handleEditToDoFormSubmit(todo) {
    const editToDoForm = document.querySelector(".edit-todo-form");
    const form = editToDoForm.querySelector("form");

    const title = form.elements["todo-title"].value;
    const project = form.elements["project"].value;
    const priority = form.elements["priority"].value;
    const dueDate = form.elements["date"].value;

    if (title && project && priority && dueDate) {
      // Update ToDo
      todo.title = title;
      todo.project = project;
      todo.priority = priority;
      todo.dueDate = dueDate;

      // Refresh UI
      this.renderToDos();
      this.projectManager.saveToLocalStorage();
    }
  }

  deleteToDo(todo) {
    const projectName = todo.project;

    const currentProject = this.projectManager.getProjectByName(projectName);

    if (currentProject) {

      // Check if the specific ToDo exists in the currentProject.todos
      const todoExists = currentProject.todos.some(t => t.id === todo.id);
      console.log(`ToDo Exists: ${todoExists}`);

      if (todoExists) {
        const confirmation = confirm(`Are you sure you want to delete "${todo.title}"?`);

        if (confirmation) {
          // Remove the specific ToDo item
          currentProject.removeTodo(todo);
          // Render updated todos
          this.renderToDos();
          // Save updated data to localStorage
          this.projectManager.saveToLocalStorage();
        }
      } else {
        console.error(`ToDo with title "${todo.title}" not found in the project "${projectName}".`);
      }
    } else {
      console.error(`Project with name "${projectName}" not found.`);
    }
  }

  // Toggles active project
  setActiveProject(selectedProject) {
    const projectElements = document.querySelectorAll(".project");
    projectElements.forEach((projectElement) => {
      projectElement.classList.remove("active");
    });
    selectedProject.classList.add("active");
  }

  // Add Project Form Submission
  handleAddProjectFormSubmit(event) {
    event.preventDefault();
    const form = this.addProjectForm.querySelector("form");
    const input = form.elements['project-name'];

    const projectName = input.value.trim();
    const displayName = projectName || 'Untitled Project';

    if (displayName) {
      const newProject = new Project(displayName);
      this.projectManager.addProject(newProject);
      this.projectManager.setCurrentProject(newProject);
      this.loadProjectUI();
      this.renderToDos();
      this.projectManager.saveToLocalStorage();
      form.reset();
      this.hideProjectForm();
    }
  }

  // Add To Do Form Submission
  handleAddToDoFormSubmit(event) {
    event.preventDefault();
    const form = this.addToDoForm.querySelector("form");

    const inputs = form.elements;

    if (form.checkValidity()) {
      // Get other fields as needed
      const title = inputs["todo-title"].value;
      const project = inputs['project'].value;
      const duedate = inputs["date"].value;
      const priority = inputs["priority"].value;

      if (title && duedate && priority) {
        const newToDo = new ToDo(title, priority, project, duedate);
        const targetProject = this.projectManager.getProjectByName(project);

        targetProject.addTodo(newToDo);

        this.renderToDos();
        this.projectManager.saveToLocalStorage();
        form.reset();
        this.hideToDoForm();
      }
    }
  }

  // Delete Current Project
  deleteCurrentProject(project) {
    if (this.projectManager.currentProject) {
      const confirmation = confirm(`Are you sure you want to delete "${project.name}"?`);
      if (confirmation) {
        this.projectManager.removeProject(project);
        this.loadProjectUI();
        this.renderToDos();
        this.projectManager.saveToLocalStorage();
      }
    }
  }

  // Rename Current Project
  renameCurrentProject(projectDiv) {
    const projectName = projectDiv.querySelector('.project-title');

    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('renameInput');
    input.value = projectName.textContent;

    projectDiv.replaceChild(input, projectName);

    projectDiv.querySelector('.project-buttons').innerHTML = `
    <button class='cancelTitle svg'><span class="saveSvg material-symbols-outlined">close</span></button>
    <button class='saveTitle svg'><span class="saveSvg material-symbols-outlined">check</span></button>
    `;

    const saveBtn = projectDiv.querySelector('.saveTitle');
    const cancelBtn = projectDiv.querySelector('.cancelTitle');

    const saveChanges = () => {
      const newName = input.value.trim();
      const currentProject = this.projectManager.getCurrentProject();

      if (newName && currentProject) {
        currentProject.renameProject(newName);
        this.loadProjectUI();
        this.renderToDos();
        this.projectManager.saveToLocalStorage();
      }
    };

    const discardChanges = () => {
      this.loadProjectUI();
      this.renderToDos();
    }

    saveBtn.addEventListener('click', () => {
      setTimeout(saveChanges, 0);
    });

    cancelBtn.addEventListener('click', () => {
      setTimeout(discardChanges, 0);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveChanges();
      } else if (e.key === 'Escape') {
        discardChanges();
      }
    });

    input.focus();
  }
}

export default UI;
