/*
This file is part of Indkøbs App - Denne app er kun på dansk her lige nu.
Copyright (C) 2025 Rikard Svenningsen

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

let stores = JSON.parse(localStorage.getItem("stores")) || [];
let selectedStore = localStorage.getItem("selectedStoreCategory") || "";
let editingCategoryName = null;
let lastEditedCategory = null;

const storeSelect = document.getElementById("storeSelect");
const categoryInput = document.getElementById("categoryName");
const newStoreInput = document.getElementById("newStoreName");
const categoryList = document.getElementById("categoryList");
const categoryBtn = document.getElementById("categoryBtn");

function saveStores() {
  localStorage.setItem("stores", JSON.stringify(stores));
}

function isAndroidWebView() {
  return (typeof Android !== "undefined" && typeof Android.saveData === "function");
}

function updateCategoryButtonText() {
  categoryBtn.textContent = translate(
    editingCategoryName ? "Update Category" : "Add Category"
  );
}

function loadStores() {
  storeSelect.innerHTML = `<option value="">${translate("Select store")}</option>`;
  stores.forEach(store => {
    const option = document.createElement("option");
    option.value = store.name;
    option.textContent = store.name;
    storeSelect.appendChild(option);
  });
  storeSelect.value = selectedStore;
}

function sortStoresDropdown() {
  const current = storeSelect.value;
  const sorted = [...stores].sort((a, b) =>
    a.name.localeCompare(b.name, 'da', { sensitivity: 'base' })
  );

  storeSelect.innerHTML = `<option value="">${translate("Select store")}</option>`;
  sorted.forEach(store => {
    const option = document.createElement("option");
    option.value = store.name;
    option.textContent = store.name;
    storeSelect.appendChild(option);
  });

  storeSelect.value = current;
}

function changeStore() {
  selectedStore = storeSelect.value;
  localStorage.setItem("selectedStoreCategory", selectedStore);
  editingCategoryName = null;
  categoryInput.value = "";
  updateCategoryButtonText();
  renderCategories();
}

function addStore() {
  const name = newStoreInput.value.trim();
  if (name === "") return alert(domain_label() + upcase(translate("store_empty_alert")));
  if (stores.find(b => b.name === name)) return alert(domain_label() + upcase(translate("store_dub")));
  stores.push({ name, categories: [] });
  newStoreInput.value = "";
  saveStores();
  loadStores();
}

function deleteStore() {
  if (!selectedStore) return alert(domain_label() + upcase(translate("store_delete")));
  if (!confirm(domain_label() + upcase(translate("store_del_yes_no")))) return;
  stores = stores.filter(b => b.name !== selectedStore);
  selectedStore = "";
  localStorage.removeItem("selectedStoreCategory");
  saveStores();
  loadStores();
  renderCategories();
}

function addOrUpdateCategory() {
  if (!selectedStore) return alert(domain_label() + upcase(translate("store_select")));
  const name = categoryInput.value.trim();
  if (name === "") return alert(domain_label() + upcase(translate("cat_empty")));
  const store = stores.find(b => b.name === selectedStore);
  if (!store) return;

  if (editingCategoryName !== null) {
    const cat = store.categories.find(c => c.name === editingCategoryName);
    if (cat) {
      cat.name = name;
      lastEditedCategory = name;
    }
    editingCategoryName = null;
  } else {
    if (store.categories.find(c => c.name === name)) return alert(domain_label() + upcase(translate("cat_dub")));
    store.categories.push({ name, items: [] });
    lastEditedCategory = name;
  }

  categoryInput.value = "";
  updateCategoryButtonText();
  saveStores();
  renderCategories();

  setTimeout(() => {
    const id = "cat-" + lastEditedCategory.replace(/\s+/g, "-");
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("highlight");
      setTimeout(() => target.classList.remove("highlight"), 2000);
    }
  }, 100);
}
  function exportData() {
    if (!confirm(domain_label() + upcase(translate("export_mes")))) return;

    const dataStr = JSON.stringify(stores, null, 2);

    if (isAndroidWebView()) {
      Android.saveData("stores.json", dataStr);
      alert(domain_label() + upcase(translate("data_saved")));
    } else {
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stores.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  function importData() {
    if (!confirm(domain_label() + upcase(translate("import_mes")))) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const imported = JSON.parse(event.target.result);
          if (!Array.isArray(imported)) throw new Error("Format error.");
          stores = imported;
          saveStores();
          loadStores();
          renderCategories();
          alert(domain_label() + upcase(translate("data_imported")));
        } catch (err) {
          alert(domain_label() + upcase(translate("data_error")) + " " + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

function deleteCategory(name) {
  const store = stores.find(b => b.name === selectedStore);
  if (!store) return;
  store.categories = store.categories.filter(c => c.name !== name);
  saveStores();
  renderCategories();
}

function editCategory(name) {
  categoryInput.value = name;
  editingCategoryName = name;
  updateCategoryButtonText();
  categoryInput.focus();
}

function renderCategories() {
  categoryList.innerHTML = "";
  const store = stores.find(b => b.name === selectedStore);
  if (!store) return;

  const sortedCategories = [...store.categories].sort((a, b) =>
    a.name.localeCompare(b.name, 'da', { sensitivity: 'base' })
  );

  sortedCategories.forEach(cat => {
    const li = document.createElement("li");
    li.id = "cat-" + cat.name.replace(/\s+/g, "-");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = cat.name;
    nameSpan.onclick = () => editCategory(cat.name);

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    const delBtn = document.createElement("button");
    delBtn.className = "del-btn";
    delBtn.textContent = translate("Delete");
    delBtn.onclick = () => deleteCategory(cat.name);

    btnGroup.appendChild(delBtn);
    li.append(nameSpan, btnGroup);
    categoryList.appendChild(li);
  });
}
