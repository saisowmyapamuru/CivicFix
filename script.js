const KEY = "civicfix_final_v2";

/* =========================
   DEMO DATA
========================= */

const demo = [
  {
    id: "CF-1028",
    title: "Large pothole near RTC bus stop",
    category: "Roads",
    priority: "High",
    location: "Tirupati RTC Bus Stand",
    description: "Deep pothole affecting two-wheelers and buses.",
    status: "Open",
    lat: 13.6288,
    lng: 79.4192,
    reporter: "Demo Citizen",
    date: "2026-09-18"
  },
  {
    id: "CF-1027",
    title: "Streetlight not working",
    category: "Streetlights",
    priority: "Medium",
    location: "Tata Nagar",
    description: "Streetlight is not working after dark.",
    status: "In Progress",
    lat: 13.6350,
    lng: 79.4100,
    reporter: "Demo Citizen",
    date: "2026-09-17"
  },
  {
    id: "CF-1026",
    title: "Garbage collection delay",
    category: "Garbage",
    priority: "Medium",
    location: "Korlagunta",
    description: "Waste has not been collected for several days.",
    status: "Open",
    lat: 13.6210,
    lng: 79.4250,
    reporter: "Demo Citizen",
    date: "2026-09-16"
  },
  {
    id: "CF-1025",
    title: "Blocked storm drain",
    category: "Drainage",
    priority: "High",
    location: "Renigunta Road",
    description: "Drain is blocked and water is collecting on the road.",
    status: "In Progress",
    lat: 13.6380,
    lng: 79.4300,
    reporter: "Demo Citizen",
    date: "2026-09-15"
  },
  {
    id: "CF-1024",
    title: "Water leakage",
    category: "Water",
    priority: "High",
    location: "Alipiri Road",
    description: "Visible water leakage beside the road.",
    status: "Resolved",
    lat: 13.6150,
    lng: 79.4050,
    reporter: "Demo Citizen",
    date: "2026-09-14"
  },
  {
    id: "CF-1023",
    title: "Damaged footpath",
    category: "Roads",
    priority: "Low",
    location: "Balaji Colony",
    description: "Footpath tiles are damaged and uneven.",
    status: "Resolved",
    lat: 13.6300,
    lng: 79.4350,
    reporter: "Demo Citizen",
    date: "2026-09-13"
  },
  {
    id: "CF-1022",
    title: "Overflowing public bin",
    category: "Garbage",
    priority: "Medium",
    location: "Kapila Theertham Road",
    description: "Public bin needs collection.",
    status: "Open",
    lat: 13.6230,
    lng: 79.4000,
    reporter: "Demo Citizen",
    date: "2026-09-12"
  },
  {
    id: "CF-1021",
    title: "Crosswalk visibility issue",
    category: "Public Safety",
    priority: "Medium",
    location: "Chandragiri Road",
    description: "Crosswalk markings have faded.",
    status: "In Progress",
    lat: 13.6460,
    lng: 79.4180,
    reporter: "Demo Citizen",
    date: "2026-09-11"
  }
];

let issues = [];
let civicMap = null;
let issueMarkers = [];
let selectedLocation = null;


/* =========================
   HELPER
========================= */

const $ = id => document.getElementById(id);


/* =========================
   LOAD / SAVE
========================= */

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));

    if (Array.isArray(stored) && stored.length) {
      issues = stored;
    } else {
      issues = structuredClone(demo);
    }
  } catch {
    issues = structuredClone(demo);
  }
}


function save() {
  localStorage.setItem(KEY, JSON.stringify(issues));
}


/* =========================
   STATUS
========================= */

function statusClass(status) {
  if (status === "Resolved") {
    return "resolved";
  }

  if (status === "In Progress") {
    return "progress";
  }

  return "open";
}


/* =========================
   NAVIGATION
========================= */

function showView(name) {
  document
    .querySelectorAll(".view")
    .forEach(view => {
      view.classList.add("hidden");
    });

  const selectedView = $(name + "View");

  if (!selectedView) {
    return;
  }

  selectedView.classList.remove("hidden");

  document
    .querySelectorAll("nav button")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.view === name
      );
    });

  setRole(
    name === "admin"
      ? "admin"
      : "citizen"
  );

  if (name === "home") {
    renderHome();

    setTimeout(() => {
      if (civicMap) {
        civicMap.invalidateSize();
      }
    }, 150);
  }

  if (name === "track") {
    renderTrack();
  }

  if (name === "dashboard") {
    renderDashboard();
  }

  if (name === "admin") {
    renderAdmin();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================
   ROLE INDICATOR
========================= */

function setRole(role) {
  const label = $("roleLabel");
  const pill = $("rolePill");

  if (!label || !pill) {
    return;
  }

  label.textContent =
    role === "admin"
      ? "Admin"
      : "Citizen";

  pill.classList.toggle(
    "admin",
    role === "admin"
  );
}


/* =========================
   COUNTS
========================= */

function counts(list = issues) {
  return {
    total: list.length,

    open:
      list.filter(
        x => x.status === "Open"
      ).length,

    progress:
      list.filter(
        x => x.status === "In Progress"
      ).length,

    resolved:
      list.filter(
        x => x.status === "Resolved"
      ).length
  };
}


/* =========================
   STATS HTML
========================= */

function statHTML(c) {
  return `
    <div class="stat">
      <b>${c.total}</b>
      <span>Total reports</span>
    </div>

    <div class="stat">
      <b>${c.open}</b>
      <span>Open</span>
    </div>

    <div class="stat">
      <b>${c.progress}</b>
      <span>In progress</span>
    </div>

    <div class="stat">
      <b>${c.resolved}</b>
      <span>Resolved</span>
    </div>
  `;
}


/* =========================
   ISSUE CARD
========================= */

function card(issue, admin = false) {
  return `
    <article class="issue-card">

      <div class="top">

        <div>
          <h3>
            ${esc(issue.title)}
          </h3>

          <div class="meta">
            <b>${esc(issue.id)}</b>
            • ${esc(issue.category)}
            • ${esc(issue.location)}

            <br>

            Priority:
            ${esc(issue.priority)}

            •
            ${esc(issue.date || "Today")}
          </div>
        </div>

        <span class="badge ${statusClass(issue.status)}">
          ${esc(issue.status)}
        </span>

      </div>

      <div
        class="meta"
        style="margin-top:8px"
      >
        ${esc(issue.description)}
      </div>

      <button
        class="secondary"
        onclick="openDetails('${issue.id}')"
      >
        View Details
      </button>

      ${
        admin
          ? `
            <select
              onchange="changeStatus('${issue.id}', this.value)"
              style="
                margin-left:6px;
                padding:9px;
                border:1px solid #d7dfe8;
                border-radius:8px;
              "
            >

              <option
                ${issue.status === "Open" ? "selected" : ""}
              >
                Open
              </option>

              <option
                ${issue.status === "In Progress" ? "selected" : ""}
              >
                In Progress
              </option>

              <option
                ${issue.status === "Resolved" ? "selected" : ""}
              >
                Resolved
              </option>

            </select>
          `
          : ""
      }

    </article>
  `;
}


/* =========================
   HOME
========================= */

function renderHome() {
  const c = counts();

  if ($("homeStats")) {
    $("homeStats").innerHTML =
      statHTML(c);
  }

  if ($("homeIssues")) {
    $("homeIssues").innerHTML =
      issues
        .slice(0, 4)
        .map(issue => card(issue))
        .join("");
  }

  initMap();
}


/* =========================
   TRACK
========================= */

function renderTrack() {
  if (!$("searchInput")) {
    return;
  }

  const query =
    (
      $("searchInput").value || ""
    ).toLowerCase();

  const status =
    $("statusFilter").value;

  const category =
    $("categoryFilter").value;

  const list =
    issues.filter(issue => {

      const matchesSearch =
        !query ||
        [
          issue.id,
          issue.title,
          issue.location,
          issue.category
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "all" ||
        issue.status === status;

      const matchesCategory =
        category === "all" ||
        issue.category === category;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });

  $("trackList").innerHTML =
    list.length
      ? list
          .map(issue => card(issue))
          .join("")
      : `
        <div class="empty">
          No matching issues found.
        </div>
      `;
}


/* =========================
   MY DASHBOARD
========================= */

function renderDashboard() {
  const c = counts();

  $("myStats").innerHTML =
    statHTML(c);

  $("myIssues").innerHTML =
    issues.length
      ? issues
          .map(issue => card(issue))
          .join("")
      : `
        <div class="empty">
          No reports yet.
        </div>
      `;
}


/* =========================
   ADMIN DASHBOARD
========================= */

function renderAdmin() {
  const c = counts();

  $("adminStats").innerHTML =
    statHTML(c);

  $("adminList").innerHTML =
    issues
      .map(issue => card(issue, true))
      .join("");
}


/* =========================================================
   REAL MAP — LEAFLET + OPENSTREETMAP
========================================================= */

function initMap() {
  const mapElement = $("issueMap");

  if (!mapElement) {
    return;
  }

  if (typeof L === "undefined") {
    mapElement.innerHTML = `
      <div class="map-error">
        <b>Map could not load.</b>
        <span>Please check your internet connection.</span>
      </div>
    `;
    return;
  }

  if (!civicMap) {
    civicMap = L.map("issueMap", {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      touchZoom: true
    }).setView(
      [13.6288, 79.4192],
      13
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      }
    ).addTo(civicMap);

    addMapLegend();
  }

  setTimeout(() => {
    civicMap.invalidateSize();
  }, 100);

  renderRealMapIssues();
}


/* =========================
   MAP MARKERS
========================= */

function renderRealMapIssues() {
  if (!civicMap) {
    return;
  }

  issueMarkers.forEach(marker => {
    civicMap.removeLayer(marker);
  });

  issueMarkers = [];

  issues.forEach(issue => {
    const lat =
      Number(issue.lat);

    const lng =
      Number(issue.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }

    const marker =
      L.marker(
        [lat, lng],
        {
          title:
            `${issue.id} - ${issue.title}`
        }
      ).addTo(civicMap);

    marker.bindPopup(`
      <div class="leaflet-issue-popup">

        <div class="popup-id">
          ${esc(issue.id)}
        </div>

        <h3>
          ${esc(issue.title)}
        </h3>

        <div class="popup-location">
          📍 ${esc(issue.location)}
        </div>

        <div class="popup-status ${statusClass(issue.status)}">
          ${esc(issue.status)}
        </div>

        <p>
          ${esc(issue.description)}
        </p>

        <button
          class="popup-button"
          onclick="openDetails('${issue.id}')"
        >
          View Details
        </button>

      </div>
    `);

    marker.on("click", () => {
      selectMapIssue(issue);
    });

    issueMarkers.push(marker);
  });
}


/* =========================
   MAP ISSUE SELECT
========================= */

function selectMapIssue(issue) {
  const mapInfo = $("mapInfo");

  if (mapInfo) {
    mapInfo.innerHTML = `
      <b>
        ${esc(issue.id)}
        — 
        ${esc(issue.title)}
      </b>

      <span>
        📍 ${esc(issue.location)}

        <br>

        Status:
        ${esc(issue.status)}
      </span>

      <button
        class="secondary"
        style="
          padding:6px 8px;
          margin-top:7px;
          font-size:11px;
        "
        onclick="openDetails('${issue.id}')"
      >
        View Details
      </button>
    `;
  }

  if (civicMap) {
    civicMap.setView(
      [
        Number(issue.lat),
        Number(issue.lng)
      ],
      Math.max(
        civicMap.getZoom(),
        15
      ),
      {
        animate: true
      }
    );
  }
}


/* =========================
   FOCUS ISSUE ON MAP
========================= */

function focusIssueOnMap(id) {
  if (!civicMap) {
    return;
  }

  const issue =
    issues.find(
      item => item.id === id
    );

  if (!issue) {
    return;
  }

  const marker =
    issueMarkers.find(
      item => {
        const pos =
          item.getLatLng();

        return (
          Math.abs(
            pos.lat - Number(issue.lat)
          ) < 0.00001 &&
          Math.abs(
            pos.lng - Number(issue.lng)
          ) < 0.00001
        );
      }
    );

  civicMap.setView(
    [
      Number(issue.lat),
      Number(issue.lng)
    ],
    16,
    {
      animate: true
    }
  );

  if (marker) {
    marker.openPopup();
  }
}


/* =========================
   MAP LEGEND
========================= */

function addMapLegend() {
  if (!civicMap) {
    return;
  }

  const legend =
    L.control({
      position: "bottomleft"
    });

  legend.onAdd = function () {
    const div =
      L.DomUtil.create(
        "div",
        "map-legend"
      );

    div.innerHTML = `
      <div>
        <span class="legend-dot open"></span>
        Open
      </div>

      <div>
        <span class="legend-dot progress"></span>
        In Progress
      </div>

      <div>
        <span class="legend-dot resolved"></span>
        Resolved
      </div>
    `;

    return div;
  };

  legend.addTo(civicMap);
}


/* =========================
   DETAILS MODAL
========================= */

function openDetails(id) {
  const issue =
    issues.find(
      item => item.id === id
    );

  if (!issue) {
    return;
  }

  $("modalBody").innerHTML = `
    <span class="eyebrow">
      ${esc(issue.id)}
    </span>

    <h2>
      ${esc(issue.title)}
    </h2>

    <span
      class="badge ${statusClass(issue.status)}"
    >
      ${esc(issue.status)}
    </span>

    <div class="detail-grid">

      <div>
        <small>
          Category
        </small>

        <b>
          ${esc(issue.category)}
        </b>
      </div>

      <div>
        <small>
          Priority
        </small>

        <b>
          ${esc(issue.priority)}
        </b>
      </div>

      <div>
        <small>
          Location
        </small>

        <b>
          ${esc(issue.location)}
        </b>
      </div>

      <div>
        <small>
          Reported
        </small>

        <b>
          ${esc(issue.date || "Today")}
        </b>
      </div>

    </div>

    <p>
      ${esc(issue.description)}
    </p>

    <p class="meta">
      Reported by
      ${esc(issue.reporter || "Citizen")}
    </p>

    <button
      class="primary"
      onclick="showIssueOnMap('${issue.id}')"
      style="margin-top:8px;"
    >
      📍 Show on Map
    </button>
  `;

  $("modal")
    .classList
    .remove("hidden");
}


/* =========================
   SHOW ISSUE ON MAP
========================= */

function showIssueOnMap(id) {
  closeModal();

  showView("home");

  setTimeout(() => {
    focusIssueOnMap(id);
  }, 250);
}


function closeModal() {
  $("modal")
    .classList
    .add("hidden");
}


/* =========================
   ADMIN STATUS UPDATE
========================= */

function changeStatus(id, status) {
  const issue =
    issues.find(
      item => item.id === id
    );

  if (!issue) {
    return;
  }

  issue.status = status;

  save();

  renderAll();
}


/* =========================
   RENDER EVERYTHING
========================= */

function renderAll() {
  renderHome();
  renderTrack();
  renderDashboard();
  renderAdmin();
}


/* =========================
   LOCATION
========================= */

function useMyLocation() {
  if (!navigator.geolocation) {
    $("locationStatus").textContent =
      "Geolocation is not supported.";

    return;
  }

  $("locationStatus").textContent =
    "Getting location…";

  navigator.geolocation.getCurrentPosition(
    position => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;

      selectedLocation = {
        lat,
        lng
      };

      $("issueLocation").value =
        `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      $("locationStatus").textContent =
        "Location captured.";

    },

    () => {
      $("locationStatus").textContent =
        "Could not access location; enter it manually.";
    }
  );
}


/* =========================
   HTML ESCAPE
========================= */

function esc(value) {
  return String(value ?? "")
    .replace(
      /[&<>'"]/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      }[character])
    );
}


/* =========================
   REPORT FORM
========================= */

function setupReportForm() {
  const form = $("reportForm");

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const fallbackLat = 13.6288;
      const fallbackLng = 79.4192;

      const issue = {

        id:
          "CF-" +
          (
            1029 +
            issues.length
          ),

        title:
          $("issueTitle")
            .value
            .trim(),

        category:
          $("issueCategory")
            .value,

        priority:
          $("issuePriority")
            .value,

        location:
          $("issueLocation")
            .value
            .trim(),

        description:
          $("issueDescription")
            .value
            .trim(),

        status:
          "Open",

        reporter:
          $("reporterName")
            .value
            .trim() ||
          "Citizen",

        contact:
          $("reporterContact")
            .value
            .trim(),

        date:
          new Date()
            .toISOString()
            .slice(0, 10),

        lat:
          selectedLocation
            ? selectedLocation.lat
            : fallbackLat,

        lng:
          selectedLocation
            ? selectedLocation.lng
            : fallbackLng
      };

      issues.unshift(issue);

      save();

      selectedLocation = null;

      event.target.reset();

      $("formMessage").textContent =
        `Report ${issue.id} submitted successfully.`;

      $("locationStatus").textContent =
        "Location can be entered manually.";

      renderAll();

      setTimeout(
        () => showView("track"),
        500
      );
    }
  );
}


/* =========================
   FILTERS
========================= */

function setupFilters() {
  $("searchInput")
    .addEventListener(
      "input",
      renderTrack
    );

  $("statusFilter")
    .addEventListener(
      "change",
      renderTrack
    );

  $("categoryFilter")
    .addEventListener(
      "change",
      renderTrack
    );
}


/* =========================
   CATEGORY FILTER
========================= */

function setupCategories() {
  const categoryFilter =
    $("categoryFilter");

  const categories =
    [
      ...new Set(
        issues.map(
          issue => issue.category
        )
      )
    ].sort();

  categories.forEach(category => {

    const option =
      document.createElement("option");

    option.value = category;
    option.textContent = category;

    categoryFilter
      .appendChild(option);
  });
}


/* =========================
   MODAL CLICK OUTSIDE
========================= */

function setupModal() {
  $("modal").addEventListener(
    "click",
    event => {

      if (
        event.target.id === "modal"
      ) {
        closeModal();
      }

    }
  );
}


/* =========================
   START APP
========================= */

window.addEventListener(
  "DOMContentLoaded",
  () => {

    load();

    setupCategories();
    setupReportForm();
    setupFilters();
    setupModal();

    renderAll();

    showView("home");
  }
);


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.showView = showView;
window.openDetails = openDetails;
window.closeModal = closeModal;
window.changeStatus = changeStatus;
window.useMyLocation = useMyLocation;
window.showIssueOnMap = showIssueOnMap;
window.focusIssueOnMap = focusIssueOnMap;