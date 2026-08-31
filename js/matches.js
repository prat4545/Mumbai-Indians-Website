const API_BASE = "https://ipl-okn0.onrender.com";

const fixturesList = document.querySelector(".fixtures-list");
const featuredCard = document.querySelector(".featured-match-card");

async function loadMatches() {
    try {
        const response = await fetch(`${API_BASE}/ipl-2026-schedule`);

        if (!response.ok) {
            throw new Error("Unable to fetch match data");
        }

        const data = await response.json();

        console.log("IPL Schedule API:", data);

        const matches = Array.isArray(data)
            ? data
            : data.matches || data.data || [];

        if (!matches.length) {
            showMessage("No match data available right now.");
            return;
        }

        renderFeaturedMatch(matches[0]);
        renderFixtures(matches);

    } catch (error) {
        console.error("Matches API Error:", error);
        showMessage("Match schedule is temporarily unavailable.");
    }
}


function renderFeaturedMatch(match) {

    if (!featuredCard) return;

    const teams = getTeams(match);

    const mi = teams.mi || "Mumbai Indians";
    const opponent = teams.opponent || "Opponent";

    const date = getMatchDate(match);
    const time = match.time || match.matchTime || "Time TBA";
    const venue = match.venue || match.stadium || "Venue TBA";

    featuredCard.querySelector(".featured-team:nth-child(1) h3").textContent = mi;
    featuredCard.querySelector(".featured-team:nth-child(2) h3").textContent = opponent;

    featuredCard.querySelector(".featured-team:nth-child(2) p").textContent =
        getShortName(opponent);

    const info = featuredCard.querySelectorAll(".featured-match-info span");

    if (info[0]) info[0].textContent = date;
    if (info[1]) info[1].textContent = time;
    if (info[2]) info[2].textContent = venue;
}


function renderFixtures(matches) {

    if (!fixturesList) return;

    fixturesList.innerHTML = "";

    matches.forEach((match, index) => {

        const teams = getTeams(match);

        const mi = teams.mi || "Mumbai Indians";
        const opponent = teams.opponent || "Opponent";

        const date = getMatchDate(match);
        const time = match.time || match.matchTime || "Time TBA";
        const venue = match.venue || match.stadium || "Venue TBA";

        const card = document.createElement("article");

        card.className = "fixture-card";

        card.innerHTML = `
            <div class="fixture-date">
                <span>DATE</span>
                <strong>${formatDate(date)}</strong>
                <small>${getYear(date)}</small>
            </div>

            <div class="fixture-teams">

                <div>
                    <img src="images/logo.png"
                         alt="Mumbai Indians">
                    <span>${mi}</span>
                </div>

                <b>VS</b>

                <div>
                    <div class="fixture-opponent">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <span>${opponent}</span>
                </div>

            </div>

            <div class="fixture-info">

                <p>
                    <i class="fa-solid fa-location-dot"></i>
                    ${venue}
                </p>

                <p>
                    <i class="fa-regular fa-clock"></i>
                    ${time}
                </p>

            </div>

            <div class="fixture-actions">

                <a href="#" class="ticket-btn">
                    <i class="fa-solid fa-ticket"></i>
                    Book Tickets
                </a>

                <a href="#" class="details-btn">
                    Match Details
                    <i class="fa-solid fa-arrow-right"></i>
                </a>

            </div>
        `;

        fixturesList.appendChild(card);
    });
}


function getTeams(match) {

    const team1 =
        match.team1 ||
        match.teamA ||
        match.homeTeam ||
        match.teams?.[0] ||
        "";

    const team2 =
        match.team2 ||
        match.teamB ||
        match.awayTeam ||
        match.teams?.[1] ||
        "";

    if (String(team1).toLowerCase().includes("mumbai")) {
        return {
            mi: team1,
            opponent: team2
        };
    }

    if (String(team2).toLowerCase().includes("mumbai")) {
        return {
            mi: team2,
            opponent: team1
        };
    }

    return {
        mi: "Mumbai Indians",
        opponent: team1 || team2 || "Opponent"
    };
}


function getMatchDate(match) {

    return (
        match.date ||
        match.matchDate ||
        match.startDate ||
        "Date TBA"
    );
}


function formatDate(date) {

    if (!date || date === "Date TBA") {
        return "TBA";
    }

    const parsed = new Date(date);

    if (isNaN(parsed)) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short"
    });
}


function getYear(date) {

    if (!date || date === "Date TBA") {
        return "2026";
    }

    const parsed = new Date(date);

    if (isNaN(parsed)) {
        return "2026";
    }

    return parsed.getFullYear();
}


function getShortName(team) {

    const names = {
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

    return names[team] || "TBA";
}


function showMessage(message) {

    if (fixturesList) {
        fixturesList.innerHTML = `
            <div class="api-message">
                ${message}
            </div>
        `;
    }
}


loadMatches();
