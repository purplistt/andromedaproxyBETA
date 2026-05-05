const frame = document.getElementById("frame");
const urlBar = document.getElementById("url");
const loading = document.getElementById("loading");
const tabsDiv = document.getElementById("tabs");

let tabs = [];
let activeTab = 0;

// -------------------- TAB SYSTEM --------------------

function createTab(url = "about:home") {
    return {
        url,
        history: [url],
        index: 0
    };
}

function newTab() {
    tabs.push(createTab());
    activeTab = tabs.length - 1;
    renderTabs();
    load();
}

function closeTab(i) {
    if (tabs.length === 1) return;

    tabs.splice(i, 1);

    if (activeTab >= tabs.length) {
        activeTab = tabs.length - 1;
    }

    renderTabs();
    load();
}

function switchTab(i) {
    activeTab = i;
    renderTabs();
    load();
}

// -------------------- NAV HELPERS --------------------

function openExternal(url) {
    window.open(url, "_blank");
}

function openInternal(page) {
    urlBar.value = page;
    go(page);
}

// -------------------- URL / SEARCH --------------------

function parse(input) {
    input = input.trim();

    if (input.startsWith("http://") || input.startsWith("https://")) {
        return input;
    }

    if (input.includes(".") && !input.includes(" ")) {
        return "https://" + input;
    }

    return "https://duckduckgo.com/?q=" + encodeURIComponent(input);
}

function go(inputOverride = null) {
    const input = inputOverride || urlBar.value;
    const url = parse(input);

    const tab = tabs[activeTab];

    tab.history = tab.history.slice(0, tab.index + 1);
    tab.history.push(url);
    tab.index++;

    tab.url = url;

    load();
}

// -------------------- LOAD SYSTEM --------------------

function load() {
    const tab = tabs[activeTab];

    const home = document.getElementById("home");
    if (home) home.remove();

    frame.style.display = "block";
    urlBar.value = tab.url;

    // ---------------- HOME ----------------
    if (tab.url === "about:home") {
        frame.style.display = "none";
        renderHome();
        renderTabs();
        return;
    }

    // ---------------- SETTINGS ----------------
    if (tab.url === "about:settings") {
        frame.style.display = "none";
        renderSettings();
        renderTabs();
        return;
    }

    // ---------------- PROXY ----------------
    loading.style.width = "20%";

    frame.src = "/proxy?url=" + encodeURIComponent(tab.url);

    setTimeout(() => {
        loading.style.width = "100%";
        setTimeout(() => loading.style.width = "0%", 200);
    }, 250);

    renderTabs();
}

// -------------------- HOME --------------------

function renderHome() {
    let home = document.getElementById("home");

    if (!home) {
        home = document.createElement("div");
        home.id = "home";
        document.body.appendChild(home);
    }

    home.style = `
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background:#0b1b3a;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        z-index:9999;
    `;

    home.innerHTML = `
        <h1 style="
            font-size:42px;
            color:#d0a6ff;
            text-shadow:0 0 10px #7c4dff, 0 0 25px #5a189a;
            letter-spacing:3px;
            margin-bottom:20px;
        ">ANDROMEDA</h1>

        <input id="homeSearch" placeholder="Search or enter URL"
            style="
                width:55%;
                padding:14px;
                border-radius:12px;
                border:none;
                outline:none;
                background:#13294b;
                color:white;
                font-size:16px;
            "
        />

        <div style="display:flex; gap:10px; margin-top:18px;">
            <div onclick="window.__ANDROMEDA_SEARCH__('youtube.com')"
                style="padding:10px 14px; background:#13294b; border-radius:10px; cursor:pointer;">
                YouTube
            </div>

            <div onclick="window.__ANDROMEDA_SEARCH__('github.com')"
                style="padding:10px 14px; background:#13294b; border-radius:10px; cursor:pointer;">
                GitHub
            </div>

            <div onclick="window.__ANDROMEDA_SEARCH__('duckduckgo.com')"
                style="padding:10px 14px; background:#13294b; border-radius:10px; cursor:pointer;">
                DuckDuckGo
            </div>
        </div>
    `;

    document.getElementById("homeSearch").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            window.__ANDROMEDA_SEARCH__(e.target.value);
        }
    });
}

// -------------------- SETTINGS --------------------

function renderSettings() {
    let page = document.getElementById("home");

    if (!page) {
        page = document.createElement("div");
        page.id = "home";
        document.body.appendChild(page);
    }

    page.style = `
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background:#0b1b3a;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        z-index:9999;
        color:white;
    `;

    page.innerHTML = `
        <h1 style="color:#d0a6ff; text-shadow:0 0 10px #7c4dff;">
            Settings
        </h1>

        <button onclick="window.__ANDROMEDA_SEARCH__('about:home')"
            style="
                margin-top:10px;
                padding:10px 14px;
                background:#13294b;
                border:none;
                color:white;
                border-radius:10px;
                cursor:pointer;
            ">
            Back Home
        </button>
    `;
}

// -------------------- NAV --------------------

function back() {
    const tab = tabs[activeTab];

    if (tab.index > 0) {
        tab.index--;
        tab.url = tab.history[tab.index];
        load();
    }
}

function forward() {
    const tab = tabs[activeTab];

    if (tab.index < tab.history.length - 1) {
        tab.index++;
        tab.url = tab.history[tab.index];
        load();
    }
}

function refresh() {
    load();
}

// -------------------- TABS UI --------------------

function renderTabs() {
    tabsDiv.innerHTML = "";

    tabs.forEach((tab, i) => {
        const el = document.createElement("div");
        el.className = "tab" + (i === activeTab ? " active" : "");

        el.innerHTML = `Tab ${i + 1} <span>✕</span>`;

        el.onclick = (e) => {
            if (e.target.tagName === "SPAN") {
                closeTab(i);
            } else {
                switchTab(i);
            }
        };

        tabsDiv.appendChild(el);
    });
}

// -------------------- ENTER --------------------

urlBar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") go();
});

// -------------------- HOMEPAGE BRIDGE --------------------

window.__ANDROMEDA_SEARCH__ = function(value) {
    if (!value) return;
    urlBar.value = value;
    go();
};

// -------------------- START --------------------

newTab();