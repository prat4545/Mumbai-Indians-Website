const SUPABASE_URL = "https://ukksxlhopvemunyibusg.supabase.co";
const SUPABASE_KEY = "sb_publishable_0hFYgocoBicqr-nAMRuXYw_Zrecb0Qo";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


async function updateNavbarAuth() {

    const { data } = await supabaseClient.auth.getUser();

    const authLink = document.querySelector(".login-btn");

    if (!authLink) return;


    if (data.user) {

        authLink.textContent = "My Account";
        authLink.href = "account.html";

    } else {

        authLink.textContent = "Login";
        authLink.href = "login.html";

    }

}


document.addEventListener(
    "DOMContentLoaded",
    updateNavbarAuth
);
