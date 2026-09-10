const API_BASE = "https://ipl-okn0.onrender.com";
const squadContainer = document.getElementById("squadContainer");
const squadStatus = document.getElementById("squadStatus");

const PLAYER_IMAGES = {
    "hardik pandya": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/63751.png?v=4.16&w=400",
    "am ghazanfar": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/96648.png?v=4.16&w=400",
    "ashwani kumar": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/74296.png?v=4.16&w=400",
    "atharva ankolekar": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/68585.png?v=4.16&w=400",
    "corbin bosch": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/63605.png?v=4.16&w=400",
    "danish malewar": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/89179.png?v=4.16&w=400",
    "deepak chahar": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/59547.png?v=4.16&w=400",
    "jasprit bumrah": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/63755.png?v=4.16&w=400",
    "keshav maharaj": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/48607.png?v=4.16&w=400",
    "krish bhagat": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/88262.png?v=4.16&w=400",
    "mahipal lomror": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/65432.png?v=4.16&w=400",
    "mayank markande": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/67126.png?v=4.16&w=400",
    "mayank rawat": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/66974.png?v=4.16&w=400",
    "mitchell santner": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/57903.png?v=4.16&w=400",
    "mohammad izhar": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/137547.png?v=4.16&w=400",
    "naman dhir": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/100353.png?v=4.16&w=400",
    "raghu sharma": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/67726.png?v=4.16&w=400",
    "robin minz": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/95322.png?v=4.16&w=400",
    "rohit sharma": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/3852.png?v=4.16&w=400",
    "ruchit ahir": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/94913.png?v=4.16&w=400",
    "ryan rickelton": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/64941.png?v=4.16&w=400",
    "shardul thakur": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/63345.png?v=4.16&w=400",
    "sherfane rutherford": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/67285.png?v=4.16&w=400",
    "suryakumar yadav": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/11803.png?v=4.16&w=400",
    "tilak varma": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/70761.png?v=4.16&w=400",
    "trent boult": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/4338.png?v=4.16&w=400",
    "will jacks": "https://www.mumbaiindians.com/static-assets/images/players/large/action-shots/66927.png?v=4.16&w=400"
};

const FALLBACK_IMAGE = "https://www.mumbaiindians.com/static-assets/waf-images/c7/6e/c1/16-9/592-444/DAtzKSYFre.jpg";

const FALLBACK_SQUAD = [
    ["Hardik Pandya", "All-Rounder", "India"], ["Rohit Sharma", "Batter", "India"], ["Suryakumar Yadav", "Batter", "India"],
    ["Tilak Varma", "Batter", "India"], ["Ruchit Ahir", "Batter", "India"], ["Sherfane Rutherford", "Batter", "West Indies"],
    ["Ryan Rickelton", "Wicket Keeper", "South Africa"], ["Robin Minz", "Wicket Keeper", "India"],
    ["Jasprit Bumrah", "Bowler", "India"], ["Trent Boult", "Bowler", "New Zealand"], ["Deepak Chahar", "Bowler", "India"],
    ["AM Ghazanfar", "Bowler", "Afghanistan"], ["Ashwani Kumar", "Bowler", "India"], ["Keshav Maharaj", "Bowler", "South Africa"],
    ["Mayank Markande", "Bowler", "India"], ["Raghu Sharma", "Bowler", "India"], ["Mohammad Izhar", "Bowler", "India"],
    ["Corbin Bosch", "All-Rounder", "South Africa"], ["Will Jacks", "All-Rounder", "England"], ["Mitchell Santner", "All-Rounder", "New Zealand"],
    ["Naman Dhir", "All-Rounder", "India"], ["Shardul Thakur", "All-Rounder", "India"], ["Mahipal Lomror", "All-Rounder", "India"],
    ["Mayank Rawat", "All-Rounder", "India"], ["Krish Bhagat", "All-Rounder", "India"], ["Atharva Ankolekar", "All-Rounder", "India"],
    ["Danish Malewar", "Batter", "India"]
].map(([name, role, country]) => ({ name, role, country }));

function normalizeName(name) { return String(name || "").trim().toLowerCase().replace(/\s+/g, " "); }
function escapeHTML(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function getName(player) { return player.name || player.Name || player.player_name || player.full_name || player.playerName || ""; }
function getRole(player) { return player.role || player.Role || player.type || player.player_role || player.playerRole || player.Style || "Player"; }
function getCountry(player) { return player.country || player.Country || player.nationality || player.Nationality || player.nation || "India"; }
function getJersey(player) { return player.jersey || player.jersey_number || player.jerseyNumber || player.number || player.Jersey || ""; }
function getImage(name) { return PLAYER_IMAGES[normalizeName(name)] || FALLBACK_IMAGE; }
function countryCode(country) { const map = { India: "IND", England: "ENG", Australia: "AUS", "New Zealand": "NZ", "South Africa": "SA", Afghanistan: "AFG", "West Indies": "WI" }; return map[country] || String(country || "India").slice(0, 3).toUpperCase(); }
function category(player) { const role = getRole(player).toLowerCase(); if (role.includes("wicket") || role.includes("keeper")) return "WICKET KEEPERS"; if (role.includes("all-round") || role.includes("allround") || role.includes("all round")) return "ALL-ROUNDERS"; if (role.includes("bowl") || role.includes("spinner") || role.includes("pace")) return "BOWLERS"; return "BATTERS"; }
function displayRole(player) { const c = category(player); return c === "WICKET KEEPERS" ? "WICKET KEEPER" : c === "ALL-ROUNDERS" ? "ALL-ROUNDER" : c === "BOWLERS" ? "BOWLER" : "BATTER"; }
function extractPlayers(data) { if (Array.isArray(data)) return data; if (Array.isArray(data.players)) return data.players; if (Array.isArray(data.data)) return data.data; if (Array.isArray(data.squad)) return data.squad; return []; }

function renderCaptain(players) {
    const captain = players.find(player => normalizeName(getName(player)) === "hardik pandya") || FALLBACK_SQUAD[0];
    const name = getName(captain) || captain.name;
    const image = document.getElementById("captainImage");
    document.getElementById("captainName").textContent = name.toUpperCase();
    document.getElementById("captainJersey").textContent = getJersey(captain) || "33";
    document.getElementById("captainRole").textContent = "AR";
    document.getElementById("captainCountry").textContent = countryCode(getCountry(captain));
    image.src = getImage(name); image.alt = name; image.onerror = () => { image.src = FALLBACK_IMAGE; };
}

function renderSquad(players) {
    const groups = { "BATTERS": [], "WICKET KEEPERS": [], "ALL-ROUNDERS": [], "BOWLERS": [] };
    players.forEach(player => groups[category(player)].push(player));
    squadContainer.innerHTML = "";
    Object.entries(groups).forEach(([title, group]) => {
        if (!group.length) return;
        const section = document.createElement("section"); section.className = "squad-section dynamic-squad-group";
        section.innerHTML = `<div class="squad-heading"><p class="section-tag">THE BLUE ARMY</p><h2>${title}</h2></div>`;
        const grid = document.createElement("div"); grid.className = "players-grid";
        group.forEach(player => {
            const name = getName(player); const card = document.createElement("article"); card.className = "player-card";
            card.innerHTML = `<div class="player-image"><img src="${escapeHTML(getImage(name))}" alt="${escapeHTML(name)}" loading="lazy">${getJersey(player) ? `<span class="jersey-number">${escapeHTML(getJersey(player))}</span>` : ""}</div><div class="player-info"><h3>${escapeHTML(name).toUpperCase()}</h3><p>${escapeHTML(displayRole(player))} • ${escapeHTML(countryCode(getCountry(player)))}</p></div>`;
            card.querySelector("img").onerror = event => { event.currentTarget.src = FALLBACK_IMAGE; };
            grid.appendChild(card);
        });
        section.appendChild(grid); squadContainer.appendChild(section);
    });
}

async function loadSquad() {
    if (!squadContainer) return;
    squadStatus.textContent = "Loading Mumbai Indians squad...";
    try {
        const response = await fetch(`${API_BASE}/squad/mi`, { cache: "no-store" });
        if (!response.ok) throw new Error("Squad API unavailable");
        const apiPlayers = extractPlayers(await response.json()).filter(player => getName(player));
        const players = apiPlayers.length ? apiPlayers : FALLBACK_SQUAD;
        renderCaptain(players); renderSquad(players); squadStatus.style.display = "none";
    } catch (error) {
        console.error("Squad API Error:", error);
        renderCaptain(FALLBACK_SQUAD); renderSquad(FALLBACK_SQUAD); squadStatus.style.display = "none";
    }
}

loadSquad();
