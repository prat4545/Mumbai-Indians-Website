/* =========================================================
   MUMBAI INDIANS — CENTRAL AUTHENTICATION
   Shared authentication foundation for all pages.
========================================================= */

const SUPABASE_URL = "https://ukksxlhopvemunyibusg.supabase.co";
const SUPABASE_KEY = "sb_publishable_0hFYgocoBicqr-nAMRuXYw_Zrecb0Qo";

/* Keep one shared client on window so page-specific scripts can
   gradually migrate without creating multiple Supabase clients. */
if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
}

const supabaseClient = window.supabaseClient;

/* ---------------------------------------------------------
   Current user/session helpers
--------------------------------------------------------- */
async function getCurrentUser() {
    try {
        const { data, error } = await supabaseClient.auth.getUser();

        if (error) {
            console.error("Auth user error:", error);
            return null;
        }

        return data?.user || null;
    } catch (error) {
        console.error("Auth user exception:", error);
        return null;
    }
}

async function getCurrentSession() {
    try {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
            console.error("Auth session error:", error);
            return null;
        }

        return data?.session || null;
    } catch (error) {
        console.error("Auth session exception:", error);
        return null;
    }
}

/* ---------------------------------------------------------
   Protected-page helper
--------------------------------------------------------- */
async function requireAuth(loginPath = "login.html") {
    const user = await getCurrentUser();

    if (!user) {
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        const redirect = encodeURIComponent(currentPage);
        window.location.href = `${loginPath}?redirect=${redirect}`;
        return null;
    }

    return user;
}

/* ---------------------------------------------------------
   Safe redirect helper
--------------------------------------------------------- */
const AUTH_ALLOWED_PAGES = new Set([
    "index.html",
    "matches.html",
    "squad.html",
    "store.html",
    "about.html",
    "account.html",
    "booking.html",
    "login.html",
    "register.html"
]);

function getSafeRedirect(defaultPage = "index.html") {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (redirect && AUTH_ALLOWED_PAGES.has(redirect)) {
        return redirect;
    }

    return defaultPage;
}

/* ---------------------------------------------------------
   Navbar authentication state
--------------------------------------------------------- */
async function updateNavbarAuth() {
    const authLink = document.querySelector(".login-btn");
    if (!authLink) return;

    const user = await getCurrentUser();

    if (user) {
        authLink.textContent = "My Account";
        authLink.href = "account.html";
    } else {
        authLink.textContent = "Login";
        authLink.href = "login.html";
    }
}

/* ---------------------------------------------------------
   Central logout helper
--------------------------------------------------------- */
async function logoutUser(redirectPage = "index.html") {
    try {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error("Logout error:", error);
            return { success: false, error };
        }

        window.location.href = redirectPage;
        return { success: true };
    } catch (error) {
        console.error("Logout exception:", error);
        return { success: false, error };
    }
}

/* ---------------------------------------------------------
   Auth state listener
--------------------------------------------------------- */
supabaseClient.auth.onAuthStateChange(() => {
    updateNavbarAuth();
});

document.addEventListener("DOMContentLoaded", () => {
    updateNavbarAuth();
});

/* Shared API for page scripts and the next migration steps. */
window.MIAuth = {
    client: supabaseClient,
    getCurrentUser,
    getCurrentSession,
    requireAuth,
    getSafeRedirect,
    updateNavbarAuth,
    logoutUser
};
