
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

document.getElementById("vmRegistrationForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const vmName = document.getElementById("vmName").value.trim();
    const vmAddress = document.getElementById("vmAddress").value.trim();
    const vmOS = document.getElementById("vmOS").value.trim();

    if (!vmName || !vmAddress || !vmOS) {
        alert("Please fill in all VM details.");
        return;
    }

const existingAddresses = document.querySelectorAll(".vm-list .vm-name small");

for (const addressElement of existingAddresses) {
    const registeredAddress = addressElement.textContent.trim().toLowerCase();
    const newAddress = vmAddress.toLowerCase();

    if (registeredAddress === newAddress ||
        registeredAddress.startsWith(newAddress + " | ")) {
        alert("This IP address or hostname is already registered!");
        return;
    }
}


    const row = document.createElement("div");
    row.className = "vm-row";

    const details = document.createElement("div");
    details.className = "vm-name";

    const icon = document.createElement("span");
    icon.className = "vm-icon";
    icon.textContent = "VM";

    const nameText = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = vmName;

    const address = document.createElement("small");
    address.textContent = vmAddress + " | " + vmOS;

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
    removeButton.setAttribute("aria-label", "Remove " + vmName);

    row.append(details, status, lastCheck, removeButton);


    document.querySelector(".vm-list").appendChild(row);
    
localStorage.setItem(
    "incidentlabVMRows",
    (localStorage.getItem("incidentlabVMRows") || "") + row.outerHTML
);


    document.querySelector(".summary-card strong").firstChild.textContent =
         document.querySelector(".vm-list").children.length + " ";


    document.getElementById("vmRegistrationForm").reset();
    alert("VM added successfully!");
});
const savedVMRows = localStorage.getItem("incidentlabVMRows");

if (savedVMRows) {
    document.querySelector(".vm-list").insertAdjacentHTML("beforeend", savedVMRows);

    document.querySelector(".summary-card strong").firstChild.textContent =
        document.querySelector(".vm-list").children.length + " ";
}

document.querySelector(".vm-list").addEventListener("click", function (event) {
    if (!event.target.classList.contains("vm-remove-button")) {
        return;
    }

    const row = event.target.closest(".vm-row");

    if (!confirm("Are you sure you want to remove this VM?")) {
        return;
    }

    row.remove();

    let savedRows = "";

    document.querySelectorAll(".vm-list .vm-row").forEach((vmRow) => {
        if (vmRow.querySelector(".vm-state").textContent.trim() === "Not checked") {
            savedRows += vmRow.outerHTML;
        }
    });

    localStorage.setItem("incidentlabVMRows", savedRows);

    document.querySelector(".summary-card strong").firstChild.textContent =
        document.querySelector(".vm-list").children.length + " ";

    alert("VM removed successfully!");
});

let updatedSavedRows = "";

for (const vmRow of document.querySelectorAll(".vm-list .vm-row")) {
    if (vmRow.querySelector(".vm-state").textContent.trim() === "Not checked") {

        if (!vmRow.querySelector(".vm-remove-button")) {
            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "more-button vm-remove-button";
            removeButton.textContent = "×";
            removeButton.title = "Remove this VM";

            vmRow.appendChild(removeButton);
        }

        updatedSavedRows += vmRow.outerHTML;
    }
}

localStorage.setItem("incidentlabVMRows", updatedSavedRows);


