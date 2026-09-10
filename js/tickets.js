const API_BASE = "https://ipl-okn0.onrender.com";
const ticketMatches = document.getElementById("ticketMatches");
const FALLBACK_IMAGE = "https://www.mumbaiindians.com/static-assets/waf-images/c7/6e/c1/16-9/592-444/DAtzKSYFre.jpg";

function value(match, keys, fallback = "") { for (const key of keys) if (match?.[key] != null && match[key] !== "") return match[key]; return fallback; }
function teamName(team) { return typeof team === "object" ? value(team,["name","team"],"Opponent") : String(team || "Opponent"); }
function getTeams(match) { const a=teamName(value(match,["team1","teamA","homeTeam"],match?.teams?.[0])); const b=teamName(value(match,["team2","teamB","awayTeam"],match?.teams?.[1])); return a.toLowerCase().includes("mumbai") ? [a,b] : [b,a]; }
function matchDate(match) { return value(match,["date","matchDate","startDate","start_time"],""); }
function formatDate(date) { const d=new Date(date); return Number.isNaN(d.getTime()) ? "DATE TBA" : d.toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}).toUpperCase(); }
function escapeHTML(value) { return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function createCard(match) {
    const [mi, opponent] = getTeams(match);
    const id = value(match,["id","match_id","matchId"],"");
    const date = matchDate(match);
    const time = value(match,["time","matchTime"],"Time TBA");
    const venue = value(match,["venue","stadium"],"Venue TBA");
    const card = document.createElement("article");
    card.className = "ticket-card";
    card.innerHTML = `<div class="ticket-card-image"><span class="ticket-badge">MI MATCH DAY</span><img src="${FALLBACK_IMAGE}" alt="Mumbai Indians match day"></div><div class="ticket-card-content"><span class="ticket-date">${escapeHTML(formatDate(date))}</span><h3>Mumbai Indians vs ${escapeHTML(opponent)}</h3><div class="ticket-meta"><span><i class="fa-regular fa-clock"></i>${escapeHTML(time)}</span><span><i class="fa-solid fa-location-dot"></i>${escapeHTML(venue)}</span></div><div class="ticket-card-actions"><a class="book-btn" href="${id ? `booking.html?match_id=${encodeURIComponent(id)}` : "matches.html"}"><i class="fa-solid fa-ticket"></i> Book Tickets</a><a class="details-btn" href="${id ? `match-details.html?match_id=${encodeURIComponent(id)}` : "matches.html"}">Details</a></div></div>`;
    return card;
}
async function loadTicketMatches() {
    try {
        const response = await fetch(`${API_BASE}/ipl-2026-schedule`, { cache: "no-store" });
        if (!response.ok) throw new Error("Schedule unavailable");
        const data = await response.json();
        const matches = (Array.isArray(data) ? data : data.matches || data.data || []).filter(match => getTeams(match)[0].toLowerCase().includes("mumbai"));
        matches.sort((a,b) => new Date(matchDate(a)) - new Date(matchDate(b)));
        const upcoming = matches.filter(match => { const t = new Date(matchDate(match)).getTime(); return Number.isNaN(t) || t >= Date.now(); });
        const visible = (upcoming.length ? upcoming : matches).slice(0, 8);
        ticketMatches.innerHTML = "";
        if (!visible.length) throw new Error("No matches");
        visible.forEach(match => ticketMatches.appendChild(createCard(match)));
    } catch (error) {
        console.error("Ticket Match Error:", error);
        ticketMatches.innerHTML = `<article class="ticket-card"><div class="ticket-card-image"><span class="ticket-badge">MI MATCH DAY</span><img src="${FALLBACK_IMAGE}" alt="Mumbai Indians match day"></div><div class="ticket-card-content"><span class="ticket-date">MATCH CENTRE</span><h3>Tickets & Match Information</h3><p class="ticket-meta">Open the Match Centre to see the latest Mumbai Indians fixtures and available booking options.</p><div class="ticket-card-actions"><a class="book-btn" href="matches.html"><i class="fa-solid fa-calendar-days"></i> View Matches</a></div></div></article>`;
    }
}
loadTicketMatches();
