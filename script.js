
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

const scenarioDialog = document.getElementById("scenarioDialog");
const scenarioForm = document.getElementById("scenarioForm");
const scenarioId = document.getElementById("scenarioId");
const scenarioName = document.getElementById("scenarioName");
const scenarioDescription = document.getElementById("scenarioDescription");
const scenarioVm = document.getElementById("scenarioVm");
const scenarioDuration = document.getElementById("scenarioDuration");
const scenarioScript = document.getElementById("scenarioScript");
const generatedScriptField = document.getElementById("generatedScriptField");
const generateScriptButton = document.getElementById("generateScriptButton");
const generationStatus = document.getElementById("generationStatus");
const scenarioGrid = document.getElementById("scenarioGrid");
const overviewView = document.getElementById("overviewView");
const scenariosView = document.getElementById("scenariosView");
const toast = document.getElementById("toast");

let scenarios = JSON.parse(localStorage.getItem("incidentLabScenarios") || "[]");
let activeScenarioMode = "create";

function showToast(messageText) {
    toast.textContent = messageText;
    toast.classList.add("visible");
    window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function saveScenarios() {
    localStorage.setItem("incidentLabScenarios", JSON.stringify(scenarios));
}

function deleteIncident(scenario) {
    const confirmed = window.confirm(
        `Delete "${scenario.name}"? This will also remove its saved script.`
    );
    if (!confirmed) return;

    scenarios = scenarios.filter((item) => item.id !== scenario.id);
    saveScenarios();
    renderSavedScenarios();
    showToast(`"${scenario.name}" deleted`);
}

function renderSavedScenarios() {
    scenarioGrid.replaceChildren();

    if (scenarios.length === 0) {
        const empty = document.createElement("div");
        empty.className = "scenario-empty";
        empty.innerHTML = "<span>⚠</span><h3>No saved incidents</h3><p>Create an incident to build your reusable library.</p>";
        scenarioGrid.appendChild(empty);
        return;
    }

    scenarios.forEach((scenario) => {
        const card = document.createElement("article");
        card.className = "scenario-card";

        const icon = document.createElement("div");
        icon.className = "scenario-card-icon";
        icon.textContent = "◈";

        const content = document.createElement("div");
        content.className = "scenario-card-content";
        const title = document.createElement("h3");
        title.textContent = scenario.name;
        const description = document.createElement("p");
        description.textContent = scenario.description;
        const meta = document.createElement("div");
        meta.className = "scenario-meta";
        meta.textContent = `${scenario.vm} • ${scenario.duration} minutes`;
        content.append(title, description, meta);

        if (scenario.script) {
            const scriptBadge = document.createElement("span");
            scriptBadge.className = "scenario-script-badge";
            scriptBadge.textContent = "✓ Script saved";
            content.appendChild(scriptBadge);
        }

        const reuseButton = document.createElement("button");
        reuseButton.type = "button";
        reuseButton.className = "scenario-reuse";
        reuseButton.textContent = "Reuse incident";
        reuseButton.addEventListener("click", () => openScenario("reuse", scenario));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "scenario-delete";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteIncident(scenario));

        const cardActions = document.createElement("div");
        cardActions.className = "scenario-card-actions";
        cardActions.append(reuseButton, deleteButton);

        card.append(icon, content, cardActions);
        scenarioGrid.appendChild(card);
    });
}

function openScenario(mode, scenario = null) {
    activeScenarioMode = mode;
    document.getElementById("scenarioDialogEyebrow").textContent =
        mode === "reuse" ? "SAVED INCIDENT" : "NEW INCIDENT";
    document.getElementById("scenarioDialogTitle").textContent =
        mode === "reuse" ? "Reuse incident" : "Create an incident";
    document.getElementById("scenarioSubmit").textContent =
        mode === "reuse" ? "Launch incident" : "Save incident";

    scenarioId.value = scenario?.id || "";
    scenarioName.value = scenario?.name || "";
    scenarioDescription.value = scenario?.description || "";
    scenarioVm.value = scenario?.vm || "Student VM 01";
    scenarioDuration.value = scenario?.duration || "60";
    scenarioScript.value = scenario?.script || "";
    generatedScriptField.hidden = !scenario?.script;
    generationStatus.textContent = "";
    generationStatus.className = "generation-status";
    scenarioDialog.showModal();
}

function closeScenarioDialog() {
    scenarioDialog.close();
    scenarioForm.reset();
    scenarioScript.value = "";
    generatedScriptField.hidden = true;
    generationStatus.textContent = "";
    generationStatus.className = "generation-status";
}

document.getElementById("newScenarioButton").addEventListener("click", () => openScenario("create"));
document.getElementById("quickStartButton").addEventListener("click", () => openScenario("create"));
document.getElementById("scenariosNewButton").addEventListener("click", () => openScenario("create"));
document.getElementById("closeScenarioDialog").addEventListener("click", closeScenarioDialog);
document.getElementById("cancelScenario").addEventListener("click", closeScenarioDialog);

scenarioDialog.addEventListener("click", (event) => {
    if (event.target === scenarioDialog) closeScenarioDialog();
});

function createLocalIncidentScript(name, description, vm, duration) {
    const text = description.toLowerCase();
    const tasks = [];

    if (/login|account|password|authentication/.test(text)) {
        tasks.push("Review authentication and sign-in logs");
        tasks.push("Identify unusual account or IP activity");
    }
    if (/malware|ransom|virus|suspicious file/.test(text)) {
        tasks.push("Inspect running processes and recently changed files");
        tasks.push("Quarantine the suspicious artifact");
    }
    if (/network|traffic|port|firewall|dns/.test(text)) {
        tasks.push("Inspect network connections and firewall records");
        tasks.push("Trace suspicious traffic to its source");
    }
    if (tasks.length === 0) {
        tasks.push("Inspect relevant system logs");
        tasks.push("Collect evidence and document findings");
    }

    return [
        `incident: "${name}"`,
        `target_vm: "${vm}"`,
        `duration_minutes: ${duration}`,
        "steps:",
        ...tasks.map((task, index) => `  - step_${index + 1}: "${task}"`),
        '  - step_' + (tasks.length + 1) + ': "Submit findings and mitigation actions"',
        "",
        `source_description: |`,
        ...description.split("\n").map((line) => `  ${line}`)
    ].join("\n");
}

async function generateIncidentScript() {
    const name = scenarioName.value.trim();
    const description = scenarioDescription.value.trim();
    if (!name || !description) {
        generationStatus.className = "generation-status error";
        generationStatus.textContent = "Enter an incident name and description first.";
        return;
    }

    generateScriptButton.disabled = true;
    generateScriptButton.textContent = "Generating script...";
    generationStatus.className = "generation-status";
    generationStatus.textContent = "Translating the plain-English description...";

    try {
        const response = await fetch("/api/generate-script", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                description,
                vm: scenarioVm.value,
                duration: scenarioDuration.value
            })
        });

        if (!response.ok) throw new Error("LLM endpoint unavailable");
        const result = await response.json();
        if (!result.script) throw new Error("No script returned");

        scenarioScript.value = result.script;
        generationStatus.textContent = "Script generated. Review and edit it below.";
    } catch (error) {
        scenarioScript.value = createLocalIncidentScript(
            name,
            description,
            scenarioVm.value,
            scenarioDuration.value
        );
        generationStatus.textContent =
            "LLM service unavailable; a local starter script was generated.";
    }

    generatedScriptField.hidden = false;
    generateScriptButton.disabled = false;
    generateScriptButton.innerHTML = '<span aria-hidden="true">✦</span> Regenerate script';
}

generateScriptButton.addEventListener("click", generateIncidentScript);

scenarioForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const scenario = {
        id: scenarioId.value || `scenario-${Date.now()}`,
        name: scenarioName.value.trim(),
        description: scenarioDescription.value.trim(),
        vm: scenarioVm.value,
        duration: scenarioDuration.value,
        script: scenarioScript.value.trim()
    };

    if (!scenario.name || !scenario.description) return;

    if (activeScenarioMode === "create") {
        scenarios.unshift(scenario);
        saveScenarios();
        renderSavedScenarios();
        closeScenarioDialog();
        overviewView.hidden = true;
        scenariosView.hidden = false;
        document.querySelectorAll(".nav-item").forEach((item) => {
            item.classList.toggle("active", item.getAttribute("href") === "#incidents");
        });
        document.title = "IncidentLab | Incident Management";
        showToast(`"${scenario.name}" saved to Incident Management`);
        return;
    }

    const existingIndex = scenarios.findIndex((item) => item.id === scenario.id);
    if (existingIndex >= 0) scenarios[existingIndex] = scenario;
    saveScenarios();
    renderSavedScenarios();
    closeScenarioDialog();

    const activeCount = document.getElementById("activeExerciseCount");
    const activityList = document.querySelector(".activity-list");
    const currentCount = Number.parseInt(activeCount.textContent, 10) || 0;
    activeCount.replaceChildren(document.createTextNode(`${currentCount + 1} `));
    const runningNow = document.createElement("small");
    runningNow.textContent = "running now";
    activeCount.appendChild(runningNow);

    const activityItem = document.createElement("div");
    activityItem.className = "activity-item";
    const marker = document.createElement("span");
    marker.className = "activity-marker blue";
    const activityContent = document.createElement("div");
    const activityTitle = document.createElement("strong");
    activityTitle.textContent = "Incident launched";
    const activityDescription = document.createElement("p");
    activityDescription.textContent = `${scenario.name} started on ${scenario.vm}`;
    const activityTime = document.createElement("small");
    activityTime.textContent = "Just now";
    activityContent.append(activityTitle, activityDescription, activityTime);
    activityItem.append(marker, activityContent);
    activityList.prepend(activityItem);
    showToast(`"${scenario.name}" launched on ${scenario.vm}`);
});

document.querySelectorAll(".nav-item").forEach((navItem) => {
    navItem.addEventListener("click", (event) => {
        event.preventDefault();
        document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
        navItem.classList.add("active");

        const target = navItem.getAttribute("href");
        overviewView.hidden = target !== "#overview";
        scenariosView.hidden = target !== "#incidents";
        document.title = target === "#incidents"
            ? "IncidentLab | Incident Management"
            : "IncidentLab | Overview";

        if (target === "#incidents") {
            document.getElementById("incidents")?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (target === "#overview") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
});


const vmForm = document.getElementById("vmRegistrationForm");
const vmList = document.querySelector(".vm-list");
const vmCount = document.querySelector(".summary-card strong").firstChild;
const vmStorageKey = "incidentlabVMs";
const legacyVMStorageKey = "incidentlabVMRows";
const demoVMAddresses = Array.from(vmList.querySelectorAll(".vm-name small"), (address) =>
    vmAddressKey(address.textContent)
);

function vmAddressKey(address) {
    // DNS names are case-insensitive and may end with a dot.
    return address.trim().toLowerCase().replace(/\.$/, "");
}

function isValidVMAddress(address) {
    if (!/^[a-zA-Z0-9.-]+$/.test(address)) {
        return false;
    }

    if (/^[0-9.]+$/.test(address)) {
        // A numeric address must be four decimal numbers from 0 to 255.
        const parts = address.split(".");
        return parts.length === 4 && parts.every((part) =>
            /^(0|[1-9][0-9]{0,2})$/.test(part) && Number(part) <= 255
        );
    }

    const hostname = vmAddressKey(address);
    const labels = hostname.split(".");
    const lastLabel = labels[labels.length - 1];
    // Each DNS label uses letters, digits or hyphens and must start and end with a letter or digit.
    const validLabel = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    return hostname.length <= 253 && !/^[0-9]+$/.test(lastLabel) &&
        labels.every((label) => validLabel.test(label));
}

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

    const monitoringInfo = document.createElement("small");
monitoringInfo.className = "vm-monitoring-info";
monitoringInfo.textContent =
    "Uptime: Awaiting monitoring | Downtime: Awaiting monitoring";

nameText.append(name, address, monitoringInfo);
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

    if (!isValidVMAddress(address)) {
        alert("Enter a valid IPv4 address or hostname, such as 192.168.10.108 or student-vm.example.com.");
        document.getElementById("vmAddress").focus();
        return;
    }

    try {
        const vms = loadRegisteredVMs();
        const addressKey = vmAddressKey(address);
        if (demoVMAddresses.includes(addressKey) ||
            vms.some((vm) => vmAddressKey(vm.address) === addressKey)) {
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
renderSavedScenarios();


