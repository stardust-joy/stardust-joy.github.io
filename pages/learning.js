// Add one object here for each day you want to publish.
const entries = [
  {
    date: "2026-09-23",
    title: "Building a Personal Website",
    minutes: 75,
    tags: ["HTML", "CSS", "JavaScript", "Github"],
    content: [
      "I made a personal website with AI assistance.",
      "html is for what we see in the page, css is in what way we want our content to be shown, adn css is for interesting effects on the website."
      "by using command "href" one can point to another page or an external website, but the writing format of the desired position should be paid attention to." 
    ]
  }
].sort((a, b) => a.date.localeCompare(b.date));

const entryDate = document.getElementById("entry-date");
const entryCount = document.getElementById("entry-count");
const studyTime = document.getElementById("study-time");
const entryTitle = document.getElementById("entry-title");
const entryTags = document.getElementById("entry-tags");
const entryContent = document.getElementById("entry-content");
const previousButton = document.getElementById("previous-entry");
const nextButton = document.getElementById("next-entry");

const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

const calendarMonthLabel = document.getElementById("calendar-month");
const calendarDays = document.getElementById("calendar-days");
const previousMonthButton = document.getElementById("previous-month");
const nextMonthButton = document.getElementById("next-month");

let currentEntry = null;
let calendarMonth = new Date();

function dateFromISO(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(dateFromISO(dateString));
}

function findEntry(dateString) {
  return entries.find((entry) => entry.date === dateString);
}

function getStudyLevel(minutes) {
  if (minutes >= 120) return 4;
  if (minutes >= 60) return 3;
  if (minutes >= 30) return 2;
  return 1;
}

function updatePage(updateUrl = false) {
  if (!currentEntry) {
    entryDate.textContent = "No entries yet";
    entryCount.textContent = "";
    studyTime.textContent = "";
    entryTitle.textContent = "Add your first learning entry";
    entryTags.replaceChildren();
    entryContent.replaceChildren();

    const message = document.createElement("p");
    message.textContent = "Add a daily entry to the entries list in learning.js.";
    entryContent.append(message);

    previousButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  const currentIndex = entries.findIndex(
    (entry) => entry.date === currentEntry.date
  );

  entryDate.textContent = formatDate(currentEntry.date);
  entryCount.textContent = `Entry ${currentIndex + 1} of ${entries.length}`;
  studyTime.textContent = `${currentEntry.minutes} min studied`;
  entryTitle.textContent = currentEntry.title;

  entryTags.replaceChildren();
  currentEntry.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "entry-tag";
    tagElement.textContent = tag;
    entryTags.append(tagElement);
  });

  entryContent.replaceChildren();
  currentEntry.content.forEach((paragraphText) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = paragraphText;
    entryContent.append(paragraph);
  });

  previousButton.disabled = currentIndex <= 0;
  nextButton.disabled = currentIndex >= entries.length - 1;

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("date", currentEntry.date);
    window.history.pushState({}, "", url);
  }
}

function selectEntry(dateString, updateUrl = true) {
  const entry = findEntry(dateString);
  if (!entry) return;

  currentEntry = entry;
  calendarMonth = dateFromISO(entry.date);
  updatePage(updateUrl);
  renderCalendar();
}

function renderCalendar() {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarMonthLabel.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(firstDay);

  calendarDays.replaceChildren();

  // Make Monday the first day of the calendar week.
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;

  for (let i = 0; i < leadingEmptyDays; i += 1) {
    const emptyCell = document.createElement("span");
    emptyCell.className = "calendar-empty";
    emptyCell.setAttribute("aria-hidden", "true");
    calendarDays.append(emptyCell);
  }

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateString = [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0")
    ].join("-");

    const entry = findEntry(dateString);
    const button = document.createElement("button");
    const level = entry ? getStudyLevel(entry.minutes) : 0;

    button.type = "button";
    button.className = `calendar-day level-${level}`;
    button.textContent = String(day);
    button.disabled = !entry;

    if (entry) {
      button.classList.add("has-entry");
      button.title = `${formatDate(dateString)} — ${entry.minutes} minutes studied`;
      button.setAttribute(
        "aria-label",
        `${formatDate(dateString)}: ${entry.minutes} minutes studied. Open entry.`
      );

      button.addEventListener("click", () => {
        selectEntry(dateString);
      });
    } else {
      button.title = "No entry";
      button.setAttribute("aria-label", `${formatDate(dateString)}: no entry`);
    }

    if (dateString === todayString) {
      button.classList.add("today");
    }

    if (currentEntry && dateString === currentEntry.date) {
      button.classList.add("selected");
      button.setAttribute("aria-current", "date");
    }

    calendarDays.append(button);
  }
}

function renderSearchResults() {
  const query = searchInput.value.trim().toLowerCase();
  searchResults.replaceChildren();

  if (!query) {
    searchResults.hidden = true;
    return;
  }

  const matches = entries.filter((entry) => {
    const searchableText = [
      entry.title,
      ...entry.tags,
      ...entry.content
    ].join(" ").toLowerCase();

    return searchableText.includes(query);
  });

  searchResults.hidden = false;

  if (matches.length === 0) {
    const message = document.createElement("div");
    message.className = "no-results";
    message.textContent = "No matching entries found.";
    searchResults.append(message);
    return;
  }

  matches
    .slice()
    .reverse()
    .forEach((entry) => {
      const resultButton = document.createElement("button");
      resultButton.type = "button";
      resultButton.className = "search-result";

      const title = document.createElement("strong");
      title.textContent = entry.title;

      const details = document.createElement("span");
      details.textContent = `${formatDate(entry.date)} · ${entry.tags.join(", ")}`;

      resultButton.append(title, details);
      resultButton.addEventListener("click", () => {
        selectEntry(entry.date);
      });

      searchResults.append(resultButton);
    });
}

previousButton.addEventListener("click", () => {
  const currentIndex = entries.findIndex(
    (entry) => entry.date === currentEntry?.date
  );

  if (currentIndex > 0) {
    selectEntry(entries[currentIndex - 1].date);
  }
});

nextButton.addEventListener("click", () => {
  const currentIndex = entries.findIndex(
    (entry) => entry.date === currentEntry?.date
  );

  if (currentIndex < entries.length - 1) {
    selectEntry(entries[currentIndex + 1].date);
  }
});

previousMonthButton.addEventListener("click", () => {
  calendarMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() - 1,
    1
  );
  renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
  calendarMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    1
  );
  renderCalendar();
});

searchInput.addEventListener("input", renderSearchResults);

window.addEventListener("popstate", () => {
  const dateString = new URLSearchParams(window.location.search).get("date");
  const entry = dateString ? findEntry(dateString) : null;

  currentEntry = entry || entries[entries.length - 1] || null;

  if (currentEntry) {
    calendarMonth = dateFromISO(currentEntry.date);
  }

  updatePage();
  renderCalendar();
});

// Open the date in the URL, or show the newest entry by default.
const requestedDate = new URLSearchParams(window.location.search).get("date");
currentEntry =
  findEntry(requestedDate) ||
  entries[entries.length - 1] ||
  null;

if (currentEntry) {
  calendarMonth = dateFromISO(currentEntry.date);
}

updatePage();
renderCalendar();
