
const loginForm = document.getElementById("loginForm");
const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const message = document.getElementById("message");

function showDashboard() {
    loginView.hidden = true;
    dashboardView.hidden = false;
    document.title = "IncidentLab | Overview";
}

function showLogin() {
    dashboardView.hidden = true;
    loginView.hidden = false;
    document.title = "IncidentLab | Faculty Console";
}

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        message.textContent = "Please enter your email and password.";
        message.className = "error-message";
        return;
    }

    message.textContent = "";
    message.className = "";
    showDashboard();
});

document.getElementById("logoutButton").addEventListener("click", showLogin);
document.getElementById("profileButton").addEventListener("click", showLogin);
document.getElementById("dashboardHome").addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("forgotPassword").addEventListener("click", (event) => {
    event.preventDefault();
    message.textContent = "Please contact your administrator to reset your password.";
    message.className = "info-message";
});

document.getElementById("requestAccess").addEventListener("click", (event) => {
    event.preventDefault();
    message.textContent = "Access requests are handled by your IncidentLab administrator.";
    message.className = "info-message";
});

document.querySelectorAll("#newScenarioButton, #quickStartButton").forEach((button) => {
    button.addEventListener("click", () => {
        window.alert("Scenario builder coming soon. Describe your incident in plain English to get started.");
    });
});

const vmForm = document.getElementById("vmRegistrationForm");
const vmList = document.querySelector(".vm-list");
const vmCount = document.querySelector(".summary-card strong").firstChild;
const vmStorageKey = "incidentlabVMs";
const legacyVMStorageKey = "incidentlabVMRows";
const demoVMAddresses = Array.from(vmList.querySelectorAll(".vm-name small"), (address) =>
    address.textContent.trim().toLowerCase()
);

function loadRegisteredVMs() {
    const savedVMs = localStorage.getItem(vmStorageKey);
    if (savedVMs !== null) {
        const vms = JSON.parse(savedVMs);
        if (!Array.isArray(vms) || vms.some((vm) =>
            !vm || typeof vm.id !== "string" || !vm.id ||
            typeof vm.name !== "string" || typeof vm.address !== "string" ||
            typeof vm.os !== "string"
        ) || new Set(vms.map((vm) => vm.id)).size !== vms.length) {
            throw new Error("Invalid saved VM records.");
        }
        return vms;
    }

    const legacyRows = localStorage.getItem(legacyVMStorageKey);
    if (!legacyRows) {
        return [];
    }

    // Read data from the old rows without adding any of their HTML to the page.
    const template = document.createElement("template");
    template.innerHTML = legacyRows;
    const rows = Array.from(template.content.children);
    if (rows.length === 0) {
        throw new Error("No VM rows found in legacy storage.");
    }

    const vms = rows.map((row) => {
        const name = row.querySelector(".vm-name strong")?.textContent;
        const details = row.querySelector(".vm-name small")?.textContent;
        const separator = details?.indexOf(" | ") ?? -1;
        if (!row.classList.contains("vm-row") || !name || separator < 1 ||
            separator + 3 === details.length) {
            throw new Error("Could not read a legacy VM row.");
        }

        return {
            id: crypto.randomUUID(),
            name,
            address: details.slice(0, separator),
            os: details.slice(separator + 3)
        };
    });

    // Once JSON exists, future loads use it. Keep the old value as a backup.
    saveRegisteredVMs(vms);
    return vms;
}

function saveRegisteredVMs(vms) {
    localStorage.setItem(vmStorageKey, JSON.stringify(vms));
}

function createVMRow(vm) {
    const row = document.createElement("div");
    row.className = "vm-row";
    row.dataset.vmId = vm.id;

    const details = document.createElement("div");
    details.className = "vm-name";

    const icon = document.createElement("span");
    icon.className = "vm-icon";
    icon.textContent = "VM";

    const nameText = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = vm.name;

    const address = document.createElement("small");
    address.textContent = vm.address + " | " + vm.os;

    nameText.append(name, address);
    details.append(icon, nameText);

    const status = document.createElement("div");
    status.className = "vm-state";
    status.textContent = "Not checked";

    const lastCheck = document.createElement("span");
    lastCheck.className = "vm-time";
    lastCheck.textContent = "Pending";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "more-button vm-remove-button";
    removeButton.textContent = "×";
    removeButton.title = "Remove this VM";
    removeButton.setAttribute("aria-label", "Remove " + vm.name);

    row.append(details, status, lastCheck, removeButton);
    return row;
}

function displayRegisteredVMs(vms) {
    const displayedRows = new Map();
    for (const row of vmList.querySelectorAll(".vm-row[data-vm-id]")) {
        displayedRows.set(row.dataset.vmId, row);
    }

    // Keep existing rows so adding or removing a VM leaves other statuses intact.
    for (const vm of vms) {
        if (displayedRows.has(vm.id)) {
            displayedRows.delete(vm.id);
        } else {
            vmList.appendChild(createVMRow(vm));
        }
    }

    for (const row of displayedRows.values()) {
        row.remove();
    }

    vmCount.textContent = (demoVMAddresses.length + vms.length) + " ";
}

vmForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("vmName").value.trim();
    const address = document.getElementById("vmAddress").value.trim();
    const os = document.getElementById("vmOS").value.trim();

    if (!name || !address || !os) {
        alert("Please fill in all VM details.");
        return;
    }

    try {
        const vms = loadRegisteredVMs();
        const addressKey = address.toLowerCase();
        if (demoVMAddresses.includes(addressKey) ||
            vms.some((vm) => vm.address.trim().toLowerCase() === addressKey)) {
            alert("This IP address or hostname is already registered!");
            return;
        }

        const updatedVMs = [...vms, { id: crypto.randomUUID(), name, address, os }];
        saveRegisteredVMs(updatedVMs);
        displayRegisteredVMs(updatedVMs);
        vmForm.reset();
        alert("VM added successfully!");
    } catch (error) {
        console.error(error);
        alert("Could not save this VM. Check that browser storage is available.");
    }
});

vmList.addEventListener("click", function (event) {
    const button = event.target.closest(".vm-remove-button");
    const row = button?.closest(".vm-row[data-vm-id]");
    if (!row || !confirm("Are you sure you want to remove this VM?")) {
        return;
    }

    try {
        const vms = loadRegisteredVMs();
        const updatedVMs = vms.filter((vm) => vm.id !== row.dataset.vmId);
        saveRegisteredVMs(updatedVMs);
        displayRegisteredVMs(updatedVMs);
        alert("VM removed successfully!");
    } catch (error) {
        console.error(error);
        alert("Could not remove this VM. Check that browser storage is available.");
    }
});

try {
    displayRegisteredVMs(loadRegisteredVMs());
} catch (error) {
    console.error("Could not load registered VMs.", error);
    alert("Could not load registered VMs. Your saved data was left in browser storage.");
}
