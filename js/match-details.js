document.addEventListener("DOMContentLoaded", async () => {
    const client = window.MIAuth?.client;
    const params = new URLSearchParams(window.location.search);
    const matchId = params.get("match_id");
    const $ = id => document.getElementById(id);

    const safe = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;","\"":"&quot;"}[c]));
    const shortName = value => String(value || "TBA").split(/\s+/).map(x => x[0]).join("").slice(0,4).toUpperCase();

    if (!client || !matchId || !/^\d+$/.test(matchId)) {
        $("message").textContent = "This match could not be found. Please return to Matches.";
        $("message").style.display = "block";
        return;
    }

    try {
        const [{ data: match, error: matchError }, { data: tickets, error: ticketError }] = await Promise.all([
            client.from("matches").select("id,opponent,match_date,match_time,venue,city,status,ticket_status").eq("id", matchId).single(),
            client.from("tickets").select("category,price,total_seats,available_seats").eq("match_id", Number(matchId)).order("price", { ascending: true })
        ]);

        if (matchError || !match) throw new Error("Match details are unavailable.");

        $("title").textContent = `${match.opponent || "Opponent"} Match | Mumbai Indians`;
        $("title").textContent = `vs ${match.opponent || "Opponent"} | Mumbai Indians`;
        $("opponent").textContent = match.opponent || "Opponent";
        $("opponentShort").textContent = shortName(match.opponent);
        $("date").textContent = match.match_date ? new Date(`${match.match_date}T00:00:00`).toLocaleDateString("en-IN", {day:"2-digit",month:"short",year:"numeric"}) : "Date TBA";
        $("time").textContent = match.match_time ? String(match.match_time).slice(0,5) : "Time TBA";
        $("venue").textContent = match.venue || "Venue TBA";
        $("city").textContent = match.city || "City TBA";
        $("title").textContent = `Match Details | Mumbai Indians`;

        const statusText = match.status || "UPCOMING";
        $("status").textContent = String(statusText).toUpperCase();

        const ticketContainer = $("tickets");
        if (ticketError) {
            ticketContainer.innerHTML = '<div class="empty">Ticket availability is temporarily unavailable.</div>';
        } else if (!tickets?.length) {
            ticketContainer.innerHTML = '<div class="empty">Ticket categories are not available for this match yet.</div>';
        } else {
            ticketContainer.innerHTML = tickets.map(ticket => {
                const available = Math.max(0, Number(ticket.available_seats) || 0);
                const sold = available === 0;
                return `<div class="ticket-row"><span>${safe(ticket.category || "Ticket")} · ₹${Number(ticket.price || 0).toLocaleString("en-IN")}</span><strong class="${sold ? "sold" : "available"}">${sold ? "SOLD OUT" : `${available} seats available`}</strong></div>`;
            }).join("");
        }

        const hasAvailableTickets = !ticketError && tickets?.some(t => Number(t.available_seats) > 0);
        const completed = /won|lost|draw|tie|completed|finished|result/i.test(String(match.status || ""));
        const booking = $("bookingLink");
        if (completed || !hasAvailableTickets) {
            booking.textContent = completed ? "Match Completed" : "Tickets Unavailable";
            booking.removeAttribute("href");
            booking.setAttribute("aria-disabled", "true");
            booking.style.opacity = ".6";
            booking.style.pointerEvents = "none";
        } else {
            booking.href = `booking.html?match_id=${encodeURIComponent(matchId)}`;
        }
    } catch (error) {
        console.error("Match Details Error:", error);
        $("message").textContent = error.message || "Unable to load match details. Please try again.";
        $("message").style.display = "block";
    }
});