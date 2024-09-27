// ProjectManager.js
import ToDo from "./ToDo.js";
import Project from "./Project.js";

class ProjectManager {
  constructor() {
    this.projects = [];
    this.currentProject = null;
    this.storageKey = "projectData";
  }

  addProject(project) {
    this.projects.push(project);
    this.currentProject = project;
    this.saveToLocalStorage();
  }

  removeProject(project) {
    this.projects = this.projects.filter(p => p !== project);

    // Update current project
    if (this.projects.length > 0) {
      this.currentProject = this.projects[this.projects.length - 1];
    } else {
      this.currentProject = null;
    }

    this.saveToLocalStorage();
  }

  addToDo(todo) {
    this.currentProject.addTodo(todo);
    this.saveToLocalStorage();
  }

  setCurrentProject(project) {
    this.currentProject = project;
    this.saveToLocalStorage();
  }

  getProjectByName(name) {
    return this.projects.find((project) => project.name === name);
  }

  // Load data from localstorage
  loadFromLocalStorage() {
    const jsonData = localStorage.getItem(this.storageKey);
    if (jsonData) {
      const pmData = ProjectManager.fromJSON(JSON.parse(jsonData));
      this.projects = pmData.projects;
      this.currentProject = pmData.currentProject;
    }
  }

  // Save data to localStorage
  saveToLocalStorage() {
    const jsonData = JSON.stringify(this.toJSON());
    localStorage.setItem(this.storageKey, jsonData);
  }

  // Returns ProjectManager object as JSON data
  toJSON() {
    return {
      projects: this.projects.map((project) => project.toJSON()),
      currentProject: this.currentProject ? this.currentProject.name : null,
    };
  }

  // Translates JSON to ProjectManager object
  static fromJSON(json) {
    const pm = new ProjectManager();
    pm.projects = json.projects.map((projectJson) =>
      Project.fromJSON(projectJson),
    );
    // Restore the current project
    if (json.currentProject) {
      pm.currentProject = pm.getProjectByName(json.currentProject);
    }
    return pm;
  }

  getProjectsSize() {
    return this.projects.length;
  }

  getCurrentProject() {
    return this.currentProject;
  }

  getCurrentProjectIndex() {
    return this.projects.indexOf(this.currentProject);
  }

}

export default ProjectManager;
