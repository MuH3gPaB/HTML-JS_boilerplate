import { UTIL } from './utils.js';
import { Task } from './task.js';

const mandatory = UTIL.mandatoryAttribute;

class TaskSort {
  constructor({ sort = () => 1, status, caption = mandatory() } = {}) {
    this.sort = sort;
    this.status = status;
    this.caption = caption;
  }
}

const AVAILABLE_SORTS = {
  CREATED_AT_ASC: new TaskSort({
    sort: (t1, t2) => (t1.createdDate > t2.createdDate ? 1 : -1),
    status: Task.STATUS.OPEN,
    caption: 'Date creation (Asc)',
  }),
  CREATED_AT_DESC: new TaskSort({
    sort: (t1, t2) => (t1.createdDate < t2.createdDate ? 1 : -1),
    status: Task.STATUS.OPEN,
    caption: 'Date creation (Desc)',
  }),
  DUE_DATE_ASC: new TaskSort({
    sort: (t1, t2) => (t1.dueDate > t2.dueDate ? 1 : -1),
    status: Task.STATUS.DONE,
    caption: 'Due date (Asc)',
  }),
  DUE_DATE_DESC: new TaskSort({
    sort: (t1, t2) => (t1.dueDate < t2.dueDate ? 1 : -1),
    status: Task.STATUS.DONE,
    caption: 'Due date (Desc)',
  }),
  TEXT_ASC: new TaskSort({
    sort: (t1, t2) => (t1.text > t2.text ? 1 : -1),
    caption: 'Text (Asc)',
  }),
  TEXT_DESC: new TaskSort({
    sort: (t1, t2) => (t1.text < t2.text ? 1 : -1),
    caption: 'Text (Desc)',
  }),
};

const DEFAULT_SORTS = {
  openSortCode: 'CREATED_AT_ASC',
  doneSortCode: 'DUE_DATE_ASC',
};

export class SortStorage {
  constructor({ storageItemName = 'SAVED_SORTS' } = {}) {
    this.storageItemName = storageItemName;
  }

  loadSorts() {
    let loadedSorts = JSON.parse(localStorage.getItem(this.storageItemName));
    let openSortCode = loadedSorts && loadedSorts.openSort;
    let doneSortCode = loadedSorts && loadedSorts.doneSort;

    return {
      openSort: SortStorage.AVAILABLE_SORTS[openSortCode]
        ? openSortCode
        : SortStorage.DEFAULT_SORTS.openSort,
      doneSort: SortStorage.AVAILABLE_SORTS[doneSortCode]
        ? doneSortCode
        : SortStorage.DEFAULT_SORTS.doneSortCode,
    };
  }

  storeSorts({ openSort, doneSort } = {}) {
    let currentSaved = this.loadSorts();

    let openCodeForStore =
      (openSort && openSort.trim()) ||
      currentSaved.openSort ||
      SortStorage.DEFAULT_SORTS.openSortCode;

    let doneCodeForStore =
      (doneSort && doneSort.trim()) ||
      currentSaved.doneSort ||
      SortStorage.DEFAULT_SORTS.doneSortCode;

    localStorage.setItem(
      this.storageItemName,
      JSON.stringify({
        openSort: openCodeForStore,
        doneSort: doneCodeForStore,
      }),
    );
  }

  static get DEFAULT_SORTS() {
    return DEFAULT_SORTS;
  }

  static get AVAILABLE_SORTS() {
    return AVAILABLE_SORTS;
  }

  static get AVAILABLE_SORT_KEYS() {
    return Object.keys(SortStorage.AVAILABLE_SORTS);
  }
}

export const SORT_STORAGE = new SortStorage();
