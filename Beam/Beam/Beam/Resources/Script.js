function show(enabled, useSettingsInsteadOfPreferences) {
    if (useSettingsInsteadOfPreferences) {
        document.querySelector('p.state-on').innerText = "Beam’s extension is currently on. You can turn it off in the Extensions section of Safari Settings.";
        document.querySelector('p.state-off').innerText = "Beam’s extension is currently off. You can turn it on in the Extensions section of Safari Settings.";
        document.querySelector('p.state-unknown').innerText = "You can turn on Beam’s extension in the Extensions section of Safari Settings.";
        document.getElementsByClassName('open-preferences')[0].innerText = "Quit and Open Safari Settings…";
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function openPreferences() {
    const button = document.querySelector("button.open-preferences");
    if (button.disabled) return; // one request: the app quits as soon as Safari answers
    button.disabled = true;
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

document.querySelector("button.open-preferences").addEventListener("click", openPreferences);
// The window's only action is its default button, so Return presses it.
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target === document.body) openPreferences(); });
