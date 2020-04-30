import '../css/bootstrap.min.css';
import '../css/style.css';
import { TASKS_STORAGE, Task } from './task.js';
import { SORT_STORAGE, SortStorage } from './sort.js';
import { UTIL } from './utils';

const mandatory = UTIL.mandatoryAttribute;

const QS = document.querySelector.bind(document);
const ID = document.getElementById.bind(document);

const SEARCH_INPUT = ID('search-input');
const OPEN_TASK_LIST = QS('.todo-list__open-list .list__body');
const DONE_TASK_LIST = QS('.todo-list__done-list .list__body');
const TASK_TEMPLATE = ID('list__task--template').content;

const OPEN_LIST_SORT = QS('.todo-list__open-list .list__sort-select');
const DONE_LIST_SORT = QS('.todo-list__done-list .list__sort-select');
const ADD_TASK_FORM = QS('.todo-list__add');

const OPEN_LIST_CLEAR = QS('.todo-list__open-list .todo-list__clear');
const DONE_LIST_CLEAR = QS('.todo-list__done-list .todo-list__clear');

const TIME_FORMAT = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

OPEN_LIST_CLEAR.addEventListener('click', clearOpenTasks);
DONE_LIST_CLEAR.addEventListener('click', clearDoneTasks);
ADD_TASK_FORM.addEventListener('submit', handleAddSubmit);
SEARCH_INPUT.addEventListener('input', delayedRenderTasks);
OPEN_LIST_SORT.addEventListener('change', handleSortChange);
DONE_LIST_SORT.addEventListener('change', handleSortChange);

document.addEventListener('DOMContentLoaded', () => {
  initSorts();
  delayedRenderTasks();
});

function clearOpenTasks() {
  TASKS_STORAGE.clearOpenTasks();
  delayedRenderTasks();
}

function clearDoneTasks() {
  TASKS_STORAGE.clearDoneTasks();
  delayedRenderTasks();
}

function handleAddSubmit(event) {
  event.preventDefault();
  let input = event.target.taskText;
  let newText = input.value;
  if (newText) {
    TASKS_STORAGE.addTask({ taskText: newText });
    input.value = '';
    delayedRenderTasks();
  }
}

function handleSortChange() {
  SORT_STORAGE.storeSorts({
    openSort: OPEN_LIST_SORT.value,
    doneSort: DONE_LIST_SORT.value,
  });
  delayedRenderTasks();
}

function initSorts() {
  for (let sortKey of SortStorage.AVAILABLE_SORT_KEYS) {
    let aSort = SortStorage.AVAILABLE_SORTS[sortKey];
    let sortStatus = aSort.status;

    let appendTo =
      sortStatus === Task.STATUS.OPEN
        ? [OPEN_LIST_SORT]
        : sortStatus === Task.STATUS.DONE
        ? [DONE_LIST_SORT]
        : [OPEN_LIST_SORT, DONE_LIST_SORT];

    createSortOption({
      key: sortKey,
      caption: aSort.caption,
      appendTo: appendTo,
    });
  }

  SORT_STORAGE.storeSorts();
}

function renderSavedTasks() {
  OPEN_TASK_LIST.innerHTML = '';
  DONE_TASK_LIST.innerHTML = '';

  let sorts = SORT_STORAGE.loadSorts();
  OPEN_LIST_SORT.value = sorts.openSort;
  DONE_LIST_SORT.value = sorts.doneSort;

  let tasks = TASKS_STORAGE.loadTasks({
    filter: searchFilter,
  });

  tasks
    .filter(t => t.isDone())
    .sort(SortStorage.AVAILABLE_SORTS[sorts.doneSort].sort)
    .forEach(task => renderTask(task));

  tasks
    .filter(t => t.isOpen())
    .sort(SortStorage.AVAILABLE_SORTS[sorts.openSort].sort)
    .forEach(task => renderTask(task));
}

function renderTask(task) {
  const taskNode = document.importNode(TASK_TEMPLATE, true);
  const qs = taskNode.querySelector.bind(taskNode);

  const listTask = qs('.list__task');
  const textParagraph = qs('.task__text');
  const createDate = qs('.task__time--created');
  const dueDate = qs('.task__time--completed');
  const textArea = qs('.task__text--input');
  const checkbox = qs('.task__checkbox');
  const deleteNode = qs('.task__delete');

  listTask.id = task.id;
  createDate.textContent = formatDate(task.createdDate);

  textParagraph.textContent = task.text;
  textParagraph.addEventListener('dblclick', handleDblClick);
  textParagraph.addEventListener('touchstart', handleDblClick);
  autosize(textParagraph);

  textArea.addEventListener('keydown', handleTextType);
  textArea.addEventListener('focusout', handleUpdate);

  checkbox.addEventListener('change', handleCheckbox);

  listTask.addEventListener('mouseenter', showDelete);
  listTask.addEventListener('mouseleave', hideDelete);

  deleteNode.addEventListener('click', handleDelete);

  if (task.isOpen()) {
    checkbox.checked = false;
    OPEN_TASK_LIST.appendChild(taskNode);
  } else {
    checkbox.checked = true;
    dueDate.textContent = formatDate(task.dueDate);
    DONE_TASK_LIST.appendChild(taskNode);
  }
}

function delayedRenderTasks() {
  requestAnimationFrame(renderSavedTasks);
}

function handleDblClick() {
  let element = this;
  let input = element.nextElementSibling;
  input.style.display = 'block';
  element.style.display = 'none';
  input.value = element.textContent;
  input.focus();
  input.selectionStart = input.selectionEnd = input.value.length;
  autosize(input);
}

function handleTextType(event) {
  const textArea = event.target;
  autosize(textArea);
  if (event.keyCode === 13) {
    handleUpdate(event);
  } else if (event.keyCode === 27) {
    textArea.value = '';
    delayedRenderTasks();
  }
}

function handleUpdate(event) {
  const taskElement = event.target;
  if (!taskElement.readOnly && taskElement.value) {
    taskElement.readOnly = true;
    taskElement.classList.remove('underlined--gray');
    let taskId = taskElement.closest('.list__task').id;

    TASKS_STORAGE.updateTask({ id: taskId, newText: taskElement.value });
    delayedRenderTasks();
  }
}

function handleDelete(event) {
  const taskElement = event.target;
  let taskId = taskElement.closest('.list__task').id;
  TASKS_STORAGE.deleteTask({ id: taskId });
  delayedRenderTasks();
}

function handleCheckbox(event) {
  let checkbox = event.target;
  let taskId = checkbox.closest('.list__task').id;
  let newStatus = checkbox.checked ? Task.STATUS.DONE : Task.STATUS.OPEN;

  TASKS_STORAGE.setStatus({ id: taskId, status: newStatus });

  delayedRenderTasks();
}

function createSortOption(
  {
    key = mandatory(),
    caption = mandatory(),
    appendTo = mandatory(),
  } = mandatory(),
) {
  appendTo.forEach(element => {
    let option = document.createElement('OPTION');
    option.value = key;
    option.textContent = caption;
    element.appendChild(option);
  });
}

function searchFilter(task) {
  return task.text.includes(SEARCH_INPUT.value);
}

function formatDate(date) {
  return date.toLocaleTimeString([], TIME_FORMAT).toUpperCase();
}

function showDelete(event) {
  let deleteNode = event.target.querySelector('.task__delete');
  deleteNode.style.display = 'block';
}

function hideDelete(event) {
  let deleteNode = event.target.querySelector('.task__delete');
  deleteNode.style.display = 'none';
}

function autosize(element) {
  setTimeout(
    () => (element.style.cssText += 'height: ' + element.scrollHeight + 'px'),
    0,
  );
}
