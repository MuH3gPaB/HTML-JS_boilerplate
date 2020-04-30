import { UTIL } from './utils.js';
const mandatory = UTIL.mandatoryAttribute;

export class Task {
  constructor({
    id = null,
    text = mandatory(),
    createdDate = new Date(),
    dueDate = null,
    status = Task.STATUS.OPEN,
  } = {}) {
    this.id = id;
    this.text = text;
    this.createdDate = createdDate;
    this.dueDate = dueDate;
    this.status = status;
  }

  markAsDone() {
    this.status = Task.STATUS.DONE;
    this.dueDate = new Date();
  }

  reOpen() {
    this.status = Task.STATUS.OPEN;
    this.dueDate = null;
  }

  isDone() {
    return this.status === Task.STATUS.DONE;
  }

  isOpen() {
    return this.status === Task.STATUS.OPEN;
  }

  static JSON_PARSER(key, value) {
    if (UTIL.isNumber(key)) {
      value.id = key;
      value.createdDate = new Date(value.createdDate);
      if (value.dueDate) value.dueDate = new Date(value.dueDate);
      return new Task(value);
    }
    return value;
  }

  static get STATUS() {
    return {
      OPEN: 'Open',
      DONE: 'Done',
    };
  }
}

export class TaskStorage {
  constructor({ tasksItemName = 'SAVED_TASKS' } = {}) {
    this.tasksItemName = tasksItemName;
  }

  loadTasks({ filter = () => true } = {}) {
    let tasks =
      JSON.parse(localStorage.getItem(this.tasksItemName), Task.JSON_PARSER) ||
      [];
    return tasks.filter(filter);
  }

  storeTasks(tasks) {
    localStorage.setItem(
      this.tasksItemName,
      JSON.stringify(tasks, ['text', 'createdDate', 'dueDate', 'status']),
    );
  }

  addTask({ taskText = mandatory() } = mandatory()) {
    let tasks = this.loadTasks();
    let task = new Task({ text: taskText, id: tasks.length });
    tasks.push(task);
    this.storeTasks(tasks);
  }

  updateTask({ id = mandatory(), newText = mandatory() } = mandatory()) {
    let tasks = this.loadTasks();
    tasks[id].text = newText;
    this.storeTasks(tasks);
  }

  deleteTask({ id = mandatory() } = mandatory()) {
    let tasks = this.loadTasks();
    tasks.splice(id, 1);
    this.storeTasks(tasks);
  }

  clearDoneTasks() {
    let tasks = this.loadTasks({ filter: t => t.status !== Task.STATUS.DONE });
    this.storeTasks(tasks);
  }

  clearOpenTasks() {
    let tasks = this.loadTasks({ filter: t => t.status !== Task.STATUS.OPEN });
    this.storeTasks(tasks);
  }

  setStatus({ id = mandatory(), status = mandatory() } = mandatory()) {
    let tasks = this.loadTasks();
    let task = tasks[id];
    if (status === Task.STATUS.OPEN) {
      task.reOpen();
    } else {
      task.markAsDone();
    }
    this.storeTasks(tasks);
  }
}

export const TASKS_STORAGE = new TaskStorage();
