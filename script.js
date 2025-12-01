const addBtn = document.getElementById("addBtn");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const pagination = document.getElementById("pagination");

// 追加: グローバルアクションボタン
const finishSelectedBtn = document.getElementById("finishSelectedBtn");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const actionRow = document.querySelector(".action-row");

const todos = []; // { text: string, finished: boolean, selected: boolean }
const itemsPerPage = 3; // Number of tasks per page
let currentPage = 1;

function updateActionButtonsState() {
  const anySelected = todos.some((t) => t.selected);
  finishSelectedBtn.disabled = !anySelected;
  deleteSelectedBtn.disabled = !anySelected;
  // タスクが1個以上ある場合のみアクション行を表示
  actionRow.style.display = todos.length > 0 ? "flex" : "none";
}

// Add Task
addBtn.addEventListener("click", () => {
  const task = todoInput.value.trim();
  if (task === "") {
    showErrorMessage("Please enter a task.");
    return;
  }

  todos.unshift({ text: task, finished: false, selected: false });
  todoInput.value = "";
  currentPage = 1;
  renderTodos();
  renderPagination();
  updateActionButtonsState();
});

// グローバル操作: 選択タスクを完了にする
finishSelectedBtn.addEventListener("click", () => {
  // 完了フラグを立てつつ、選択状態は必ず維持する（チェックを外さない）
  todos.forEach((t) => {
    if (t.selected) {
      t.finished = true;
      t.selected = true; // 念のため明示的に保持
    }
  });
  renderTodos();
  renderPagination();
  updateActionButtonsState();
});

// グローバル操作: 選択タスクを削除
deleteSelectedBtn.addEventListener("click", () => {
  for (let i = todos.length - 1; i >= 0; i--) {
    if (todos[i].selected) todos.splice(i, 1);
  }
  if ((currentPage - 1) * itemsPerPage >= todos.length) {
    currentPage = Math.max(currentPage - 1, 1);
  }
  renderTodos();
  renderPagination();
  updateActionButtonsState();
});

function renderTodos() {
  todoList.innerHTML = "";

  // Get the tasks for the current page
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentTodos = todos.slice(start, end);

  // Render tasks
  currentTodos.forEach((taskObj, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    // checkbox（タスク左側）
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "select-checkbox";
    checkbox.checked = !!taskObj.selected;
    checkbox.addEventListener("change", () => {
      todos[start + index].selected = checkbox.checked;
      updateActionButtonsState();
    });

    const taskText = document.createElement("span");
    taskText.className = "todo-text";
    taskText.textContent = taskObj.text;
    if (taskObj.finished) {
      taskText.classList.add("finished");
    }

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () =>
      editTask(start + index, li, taskText)
    );

    // per-item の Finish/Delete ボタンは表示しない（グローバル操作のみ）
    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(editBtn);
    todoList.appendChild(li);
  });

  updateActionButtonsState();
}

function renderPagination() {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(todos.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "pagination-btn";
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.addEventListener("click", () => {
      currentPage = i;
      renderTodos();
      renderPagination();
    });

    pagination.appendChild(btn);
  }
}

function editTask(index, li, taskText) {
  // Create an input field for editing
  const input = document.createElement("input");
  input.type = "text";
  input.value = todos[index].text;
  input.className = "todo-text";

  // Create only a save button (no Delete/Cancel button)
  const saveBtn = document.createElement("button");
  saveBtn.className = "save-btn";
  saveBtn.textContent = "Save";

  // Replace the task list item contents with the input and save button
  li.innerHTML = "";
  li.appendChild(input);
  li.appendChild(saveBtn);

  // focus and allow Enter/Escape handling
  input.focus();
  input.select();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveBtn.click();
    } else if (e.key === "Escape") {
      // Cancel edit
      renderTodos();
    }
  });

  saveBtn.addEventListener("click", () => {
    const updatedTask = input.value.trim();
    if (updatedTask !== "") {
      todos[index].text = updatedTask;
      renderTodos();
    } else {
      showErrorMessage("Task cannot be empty.");
    }
  });
}

function deleteTask(index) {
  todos.splice(index, 1);
  if ((currentPage - 1) * itemsPerPage >= todos.length) {
    currentPage = Math.max(currentPage - 1, 1);
  }
  renderTodos();
  renderPagination();
  updateActionButtonsState();
}

function toggleFinish(index) {
  todos[index].finished = !todos[index].finished;
  renderTodos();
}

function showErrorMessage(message) {
  const errorMessage = document.querySelector(".error-message");
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 3000);
}

// 初期表示を更新（タスクが無ければ Finish/Delete を非表示にする）
updateActionButtonsState();
renderTodos();
renderPagination();
