const API_BASE = "https://ipl-okn0.onrender.com";

const playerSections = {
    batters: document.querySelectorAll(".squad-section")[0],
    wicketkeepers: document.querySelectorAll(".squad-section")[1],
    allRounders: document.querySelectorAll(".squad-section")[2],
    bowlers: document.querySelectorAll(".squad-section")[3]
};

async function loadSquad() {
    try {
        const response = await fetch(`${API_BASE}/squad/mi`);

        if (!response.ok) {
            throw new Error("Unable to fetch squad data");
        }

        const data = await response.json();

        console.log("MI Squad API:", data);

        const squad = data.squad || {};

        const players = Object.values(squad);

        if (!players.length) {
            console.error("No squad data available");
            return;
        }

        renderSquad(players);

    } catch (error) {
        console.error("Squad API Error:", error);
    }
}


function renderSquad(players) {

    const sections = {
        batters: [],
        wicketkeepers: [],
        allRounders: [],
        bowlers: []
    };

    players.forEach(player => {

        const name = player.Name || "Player";
        const style = (player.Style || "").toLowerCase();
        const isWicketkeeper = player.Wicketkeeper === true;

        if (isWicketkeeper) {
            sections.wicketkeepers.push(player);
            return;
        }

        if (
            style.includes("bowl") ||
            style.includes("arm bowl")
        ) {
            sections.bowlers.push(player);
            return;
        }

        if (
            name.toLowerCase().includes("hardik") ||
            name.toLowerCase().includes("will jacks") ||
            name.toLowerCase().includes("corbin bosch") ||
            name.toLowerCase().includes("raj angad bawa")
        ) {
            sections.allRounders.push(player);
            return;
        }

        sections.batters.push(player);
    });

    renderPlayers(playerSections.batters, sections.batters);
    renderPlayers(playerSections.wicketkeepers, sections.wicketkeepers);
    renderPlayers(playerSections.allRounders, sections.allRounders);
    renderPlayers(playerSections.bowlers, sections.bowlers);
}


function renderPlayers(section, players) {

    if (!section || !players.length) return;

    const grid = section.querySelector(".players-grid");

    if (!grid) return;

    grid.innerHTML = "";

    players.forEach(player => {

        const card = document.createElement("div");

        card.className = "player-card";

        const name = player.Name || "Player";
        const nationality = player.Nationality || "IND";
        const role = getDisplayRole(player);

        card.innerHTML = `
            <div class="player-image">

                <div class="player-placeholder">
                    <i class="fa-solid fa-user"></i>
                </div>

            </div>

            <div class="player-info">

                <h3>${name.toUpperCase()}</h3>

                <p>${role} • ${nationality}</p>

            </div>
        `;

        grid.appendChild(card);
    });
}


function getDisplayRole(player) {

    if (player.Wicketkeeper === true) {
        return "WICKET KEEPER";
    }

    const style = (player.Style || "").toLowerCase();

    if (style.includes("bowl")) {
        return "BOWLER";
    }

    const name = (player.Name || "").toLowerCase();

    if (
        name.includes("hardik") ||
        name.includes("will jacks") ||
        name.includes("corbin bosch") ||
        name.includes("raj angad bawa")
    ) {
        return "ALL-ROUNDER";
    }

    return "BATTER";
}


loadSquad();
