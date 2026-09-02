const API_BASE = "https://ipl-okn0.onrender.com";

const squadContainer = document.getElementById("squadContainer");
const squadStatus = document.getElementById("squadStatus");

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizeName(name) {
    return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getPlayerName(player) {
    return player.name || player.Name || player.player_name || player.full_name || player.playerName || "Mumbai Indians Player";
}

function getPlayerRole(player) {
    return player.role || player.Role || player.type || player.player_role || player.playerRole || player.Style || "Player";
}

function getPlayerCountry(player) {
    return player.country || player.Country || player.nationality || player.Nationality || player.nation || "India";
}

function getPlayerJersey(player) {
    return player.jersey || player.jersey_number || player.jerseyNumber || player.number || player.Jersey || "";
}

function isWicketkeeper(player) {
    const value = player.wicketkeeper ?? player.Wicketkeeper ?? player.isWicketkeeper;
    const role = String(getPlayerRole(player)).toLowerCase();
    return value === true || String(value).toLowerCase() === "true" || role.includes("wicket") || role.includes("keeper");
}

function getCategory(player) {
    if (isWicketkeeper(player)) return "WICKET KEEPERS";
    const role = String(getPlayerRole(player)).toLowerCase();
    if (role.includes("all-round") || role.includes("allround") || role.includes("all round") || role.includes("allrounder")) return "ALL-ROUNDERS";
    if (role.includes("bowl") || role.includes("spinner") || role.includes("fast bowler") || role.includes("pace")) return "BOWLERS";

    const name = normalizeName(getPlayerName(player));
    if (["hardik pandya", "will jacks", "corbin bosch", "raj angad bawa"].includes(name)) return "ALL-ROUNDERS";
    return "BATTERS";
}

function getDisplayRole(player) {
    const category = getCategory(player);
    if (category === "WICKET KEEPERS") return "WICKET KEEPER";
    if (category === "ALL-ROUNDERS") return "ALL-ROUNDER";
    if (category === "BOWLERS") return "BOWLER";
    return "BATTER";
}

function getShortRole(player) {
    const category = getCategory(player);
    return category === "ALL-ROUNDERS" ? "AR" : category === "WICKET KEEPERS" ? "WK" : category === "BOWLERS" ? "BOWL" : "BAT";
}

function getCountryCode(country) {
    const value = String(country || "India").trim();
    const map = { India: "IND", England: "ENG", Australia: "AUS", New Zealand: "NZ", South Africa: "SA", West Indies: "WI", USA: "USA" };
    return map[value] || value.slice(0, 3).toUpperCase();
}

function getPlayerImage(name) {
    const key = normalizeName(name);
    const imageMap = {
        "hardik pandya": "images/players/hardik.jpg",
        "jasprit bumrah": "images/players/bumrah.jpg",
        "suryakumar yadav": "images/players/suryakumar.jpg",
        "tilak varma": "images/players/tilak.jpg",
        "rohit sharma": "images/players/rohit.jpg",
        "ishan kishan": "images/players/ishan.jpg",
        "trent boult": "images/players/boult.jpg",
        "deepak chahar": "images/players/chahar.jpg",
        "romario shepherd": "images/players/romario.jpg"
    };
    return imageMap[key] || "images/logo.png";
}

function isCaptain(player) {
    return player.captain === true || player.isCaptain === true || String(player.role || "").toLowerCase().includes("captain") || normalizeName(getPlayerName(player)) === "hardik pandya";
}

function extractPlayers(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.players)) return data.players;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.squad)) return data.squad;
    if (data.squad && typeof data.squad === "object") return Object.values(data.squad);
    return [];
}

function renderCaptain(players) {
    const captain = players.find(isCaptain);
    if (!captain) return;
    const name = getPlayerName(captain);
    const image = document.getElementById("captainImage");
    const nameEl = document.getElementById("captainName");
    const jerseyEl = document.getElementById("captainJersey");
    const roleEl = document.getElementById("captainRole");
    const countryEl = document.getElementById("captainCountry");

    if (nameEl) nameEl.textContent = name.toUpperCase();
    if (jerseyEl) jerseyEl.textContent = getPlayerJersey(captain) || "33";
    if (roleEl) roleEl.textContent = getShortRole(captain);
    if (countryEl) countryEl.textContent = getCountryCode(getPlayerCountry(captain));
    if (image) {
        image.src = getPlayerImage(name);
        image.alt = name;
        image.onerror = () => { image.src = "images/logo.png"; };
    }
}

function createPlayerCard(player) {
    const name = getPlayerName(player);
    const role = getDisplayRole(player);
    const country = getCountryCode(getPlayerCountry(player));
    const jersey = getPlayerJersey(player);
    const card = document.createElement("article");
    card.className = "player-card";
    card.innerHTML = `
        <div class="player-image">
            <img src="${escapeHTML(getPlayerImage(name))}" alt="${escapeHTML(name)}" loading="lazy">
            ${jersey ? `<span class="jersey-number">${escapeHTML(jersey)}</span>` : ""}
        </div>
        <div class="player-info">
            <h3>${escapeHTML(name).toUpperCase()}</h3>
            <p>${escapeHTML(role)} • ${escapeHTML(country)}</p>
        </div>`;
    const img = card.querySelector("img");
    img.addEventListener("error", () => { img.src = "images/logo.png"; });
    return card;
}

function renderSquad(players) {
    const groups = { "BATTERS": [], "WICKET KEEPERS": [], "ALL-ROUNDERS": [], "BOWLERS": [] };
    players.forEach(player => groups[getCategory(player)].push(player));
    squadContainer.innerHTML = "";

    Object.entries(groups).forEach(([title, group]) => {
        if (!group.length) return;
        const section = document.createElement("section");
        section.className = "squad-section dynamic-squad-group";
        section.innerHTML = `<div class="squad-heading"><p class="section-tag">THE BLUE ARMY</p><h2>${title}</h2></div>`;
        const grid = document.createElement("div");
        grid.className = "players-grid";
        group.forEach(player => grid.appendChild(createPlayerCard(player)));
        section.appendChild(grid);
        squadContainer.appendChild(section);
    });
}

async function loadSquad() {
    if (!squadStatus || !squadContainer) return;
    squadStatus.style.display = "block";
    squadStatus.textContent = "Loading Mumbai Indians squad...";
    try {
        const response = await fetch(`${API_BASE}/squad/mi`, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to fetch squad data");
        const players = extractPlayers(await response.json());
        if (!players.length) throw new Error("No squad data available");
        renderCaptain(players);
        renderSquad(players);
        squadStatus.style.display = "none";
    } catch (error) {
        console.error("Squad API Error:", error);
        squadStatus.innerHTML = `<strong>Squad information is temporarily unavailable.</strong><br><button type="button" id="retrySquadBtn">Try Again</button>`;
        document.getElementById("retrySquadBtn")?.addEventListener("click", loadSquad);
    }
}

loadSquad();
