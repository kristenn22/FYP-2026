
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

renderSavedScenarios();
