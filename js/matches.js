const API_BASE = "https://ipl-okn0.onrender.com";

const fixturesList = document.querySelector(".fixtures-list");
const featuredCard = document.querySelector(".featured-match-card");

let allMatches = [];
let currentFilter = "upcoming";

const TEAM_CODES = {
    "Mumbai Indians": "MI",
    "Chennai Super Kings": "CSK",
    "Royal Challengers Bengaluru": "RCB",
    "Royal Challengers Bangalore": "RCB",
    "Kolkata Knight Riders": "KKR",
    "Delhi Capitals": "DC",
    "Sunrisers Hyderabad": "SRH",
    "Rajasthan Royals": "RR",
    "Punjab Kings": "PBKS",
    "Lucknow Super Giants": "LSG",
    "Gujarat Titans": "GT"
};

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getTeams(match) {
    const team1 = match.team1 || match.teamA || match.homeTeam || match.teams?.[0] || "";
    const team2 = match.team2 || match.teamB || match.awayTeam || match.teams?.[1] || "";
    const a = typeof team1 === "object" ? (team1.name || team1.team || "") : team1;
    const b = typeof team2 === "object" ? (team2.name || team2.team || "") : team2;

    if (String(a).toLowerCase().includes("mumbai")) return { mi: a, opponent: b };
    if (String(b).toLowerCase().includes("mumbai")) return { mi: b, opponent: a };
    return { mi: "Mumbai Indians", opponent: a || b || "Opponent" };
}

function getMatchDate(match) {
    return match.date || match.matchDate || match.startDate || match.start_time || "";
}

function getTimestamp(match) {
    const value = getMatchDate(match);
    const parsed = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function formatDate(date) {
    if (!date) return "Date TBA";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return String(date);
    return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getDateParts(date) {
    if (!date) return { day: "TBA", year: "2026" };
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return { day: String(date), year: "2026" };
    return {
        day: parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        year: parsed.getFullYear()
    };
}

function getShortName(team) {
    const key = String(team || "").trim();
    if (TEAM_CODES[key]) return TEAM_CODES[key];
    const found = Object.keys(TEAM_CODES).find(name => name.toLowerCase() === key.toLowerCase());
    return found ? TEAM_CODES[found] : (key ? key.split(/\s+/).map(word => word[0]).join("").slice(0, 4).toUpperCase() : "TBA");
}

function isCompleted(match) {
    const status = String(match.status || match.matchStatus || match.result || "").toLowerCase();
    if (/won|lost|draw|tie|completed|finished|result/.test(status)) return true;
    const date = getTimestamp(match);
    return Number.isFinite(date) && date < Date.now();
}

function filterMatches() {
    if (currentFilter === "results") return allMatches.filter(isCompleted);
    if (currentFilter === "upcoming") return allMatches.filter(match => !isCompleted(match));
    return allMatches;
}

function setActiveTab(filter) {
    document.querySelectorAll(".match-tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.filter === filter);
    });
}

function renderCurrentFilter() {
    const filtered = filterMatches();
    if (!filtered.length) {
        showMessage(currentFilter === "results" ? "No completed Mumbai Indians matches found." : "No upcoming Mumbai Indians matches found.");
        return;
    }
    renderFixtures(filtered);
}

function renderFeaturedMatch(match) {
    if (!featuredCard || !match) return;
    const teams = getTeams(match);
    const mi = teams.mi || "Mumbai Indians";
    const opponent = teams.opponent || "Opponent";
    const date = getMatchDate(match);
    const time = match.time || match.matchTime || "Time TBA";
    const venue = match.venue || match.stadium || "Venue TBA";

    const miName = featuredCard.querySelector("#featuredMI");
    const opponentName = featuredCard.querySelector("#featuredOpponent");
    const opponentShort = featuredCard.querySelector("#featuredOpponentShort");
    const dateEl = featuredCard.querySelector("#featuredDate");
    const timeEl = featuredCard.querySelector("#featuredTime");
    const venueEl = featuredCard.querySelector("#featuredVenue");
    const booking = featuredCard.querySelector("#featuredBookingBtn");
    const status = featuredCard.querySelector("#featuredStatus");
    const vsStatus = featuredCard.querySelector("#featuredVsStatus");

    if (miName) miName.textContent = mi;
    if (opponentName) opponentName.textContent = opponent;
    if (opponentShort) opponentShort.textContent = getShortName(opponent);
    if (dateEl) dateEl.textContent = formatDate(date);
    if (timeEl) timeEl.textContent = time;
    if (venueEl) venueEl.textContent = venue;

    const completed = isCompleted(match);
    if (status) status.innerHTML = `<i class="fa-solid fa-circle"></i> ${completed ? "RESULT" : "NEXT MATCH"}`;
    if (vsStatus) vsStatus.textContent = completed ? "COMPLETED" : "UPCOMING";

    const matchId = match.id ?? match.match_id ?? match.matchId;
    if (booking) {
        if (completed || matchId == null) {
            booking.style.display = completed ? "none" : "inline-flex";
            if (!completed) booking.href = "booking.html";
        } else {
            booking.style.display = "inline-flex";
            booking.href = `booking.html?match_id=${encodeURIComponent(matchId)}`;
        }
    }
}

function renderFixtures(matches) {
    if (!fixturesList) return;
    fixturesList.innerHTML = "";

    matches.forEach(match => {
        const teams = getTeams(match);
        const mi = teams.mi || "Mumbai Indians";
        const opponent = teams.opponent || "Opponent";
        const date = getMatchDate(match);
        const time = match.time || match.matchTime || "Time TBA";
        const venue = match.venue || match.stadium || "Venue TBA";
        const parts = getDateParts(date);
        const matchId = match.id ?? match.match_id ?? match.matchId;
        const completed = isCompleted(match);

        const card = document.createElement("article");
        card.className = "fixture-card";
        card.innerHTML = `
            <div class="fixture-date">
                <span>DATE</span>
                <strong>${escapeHtml(parts.day)}</strong>
                <small>${escapeHtml(parts.year)}</small>
            </div>
            <div class="fixture-teams">
                <div>
                    <img src="images/logo.png" alt="Mumbai Indians">
                    <span>${escapeHtml(mi)}</span>
                </div>
                <b>VS</b>
                <div>
                    <div class="fixture-opponent"><i class="fa-solid fa-shield-halved"></i></div>
                    <span>${escapeHtml(opponent)}</span>
                </div>
            </div>
            <div class="fixture-info">
                <p><i class="fa-solid fa-location-dot"></i> ${escapeHtml(venue)}</p>
                <p><i class="fa-regular fa-clock"></i> ${escapeHtml(time)}</p>
            </div>
            <div class="fixture-actions">
                ${!completed && matchId != null ? `<a href="booking.html?match_id=${encodeURIComponent(matchId)}" class="ticket-btn"><i class="fa-solid fa-ticket"></i> Book Tickets</a>` : `<span class="ticket-btn" aria-disabled="true">${completed ? "Match Completed" : "Tickets TBA"}</span>`}
                <a href="#" class="details-btn" data-match-id="${matchId != null ? escapeHtml(matchId) : ""}">Match Details <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        `;
        const detailsBtn = card.querySelector(".details-btn");
        detailsBtn.addEventListener("click", event => {
            event.preventDefault();
            const id = detailsBtn.dataset.matchId;
            if (id) window.location.href = `booking.html?match_id=${encodeURIComponent(id)}`;
            else showMessage("Match details are not available for this fixture yet.");
        });
        fixturesList.appendChild(card);
    });
}

function showMessage(message) {
    if (!fixturesList) return;
    fixturesList.innerHTML = `
        <div class="api-message">
            <i class="fa-solid fa-circle-info"></i>
            <p>${escapeHtml(message)}</p>
            <button type="button" id="retryMatchesBtn" class="secondary-btn">Try Again</button>
        </div>
    `;
    document.getElementById("retryMatchesBtn")?.addEventListener("click", loadMatches);
}

async function loadMatches() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/ipl-2026-schedule`, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to fetch match schedule");
        const data = await response.json();
        const matches = Array.isArray(data) ? data : data.matches || data.data || [];

        allMatches = matches
            .filter(match => {
                const teams = getTeams(match);
                return String(teams.mi).toLowerCase().includes("mumbai");
            })
            .sort((a, b) => getTimestamp(a) - getTimestamp(b));

        if (!allMatches.length) {
            showMessage("No Mumbai Indians matches are available right now.");
            return;
        }

        const nextMatch = allMatches.find(match => !isCompleted(match)) || allMatches[0];
        renderFeaturedMatch(nextMatch);
        renderCurrentFilter();
    } catch (error) {
        console.error("Matches API Error:", error);
        showMessage("Match schedule is temporarily unavailable.");
    }
}

function showLoading() {
    if (fixturesList) fixturesList.innerHTML = `<div class="api-message"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading Mumbai Indians fixtures...</p></div>`;
}

document.querySelectorAll(".match-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        currentFilter = tab.dataset.filter || "upcoming";
        setActiveTab(currentFilter);
        if (allMatches.length) renderCurrentFilter();
    });
});

loadMatches();
