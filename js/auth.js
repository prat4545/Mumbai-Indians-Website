/* =========================================================
   MUMBAI INDIANS — CENTRAL AUTHENTICATION & NAVIGATION
========================================================= */

const SUPABASE_URL = "https://ukksxlhopvemunyibusg.supabase.co";
const SUPABASE_KEY = "sb_publishable_0hFYgocoBicqr-nAMRuXYw_Zrecb0Qo";

if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const supabaseClient = window.supabaseClient;

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

const AUTH_ALLOWED_PAGES = new Set([
    "index.html", "matches.html", "squad.html", "store.html", "about.html",
    "account.html", "booking.html", "login.html", "register.html", "reset-password.html"
]);

function getSafeRedirect(defaultPage = "index.html") {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    return redirect && AUTH_ALLOWED_PAGES.has(redirect) ? redirect : defaultPage;
}

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

function setupMobileNavigation() {
    const nav = document.querySelector("nav#mainNav, header nav");
    const header = nav?.closest("header");
    if (!nav || !header || nav.dataset.mobileReady === "true") return;

    nav.dataset.mobileReady = "true";
    nav.setAttribute("aria-label", "Main navigation");

    if (!nav.querySelector('a[href="booking.html"]')) {
        const bookingLink = document.createElement("a");
        bookingLink.href = "booking.html";
        bookingLink.textContent = "Tickets";
        const storeLink = nav.querySelector('a[href="store.html"]');
        if (storeLink) storeLink.insertAdjacentElement("beforebegin", bookingLink);
        else nav.appendChild(bookingLink);
    }

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-menu-toggle";
    toggle.setAttribute("aria-label", "Open navigation menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    header.insertBefore(toggle, nav);

    if (!document.getElementById("miMobileNavStyles")) {
        const style = document.createElement("style");
        style.id = "miMobileNavStyles";
        style.textContent = `
            .mobile-menu-toggle{display:none;background:transparent;border:0;color:inherit;font-size:24px;cursor:pointer;padding:8px;line-height:1;}
            .mobile-menu-toggle:focus-visible,a:focus-visible,button:focus-visible{outline:3px solid rgba(245,184,0,.85);outline-offset:3px;border-radius:5px;}
            @media(max-width:760px){
                header.navbar{position:relative;}
                .mobile-menu-toggle{display:inline-flex;align-items:center;justify-content:center;margin-left:auto;}
                header.navbar nav{display:none;position:absolute;top:100%;left:0;right:0;z-index:1000;flex-direction:column;gap:0;padding:10px 6%;background:#00245f;box-shadow:0 12px 28px rgba(0,0,0,.18);}
                header.navbar nav.mobile-open{display:flex;}
                header.navbar nav a{width:100%;padding:13px 8px;}
            }
            @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important;}}
        `;
        document.head.appendChild(style);
    }

    const closeMenu = () => {
        nav.classList.remove("mobile-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");
        toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    };

    toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("mobile-open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        toggle.innerHTML = open
            ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });

    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
        if (window.innerWidth > 760) closeMenu();
    });
}

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

supabaseClient.auth.onAuthStateChange(() => updateNavbarAuth());
document.addEventListener("DOMContentLoaded", () => {
    updateNavbarAuth();
    setupMobileNavigation();
});

window.MIAuth = {
    client: supabaseClient,
    getCurrentUser,
    getCurrentSession,
    requireAuth,
    getSafeRedirect,
    updateNavbarAuth,
    setupMobileNavigation,
    logoutUser
};
