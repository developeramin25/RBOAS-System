import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const SUPABASE_URL = "https://dgusnyfhcizbmdmryjbj.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_swxw_VUy3QCvdtmEbSdNBA_DIN1t5sg";
const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
const mode = document.body.dataset.page;
const $ = (id) => document.getElementById(id);
const display = (id, message, good = false) => {
  const node = $(id);
  if (!node) return;
  node.textContent = message;
  node.classList.toggle("good", good);
};
const setBusy = (button, busy, normal, pending) => {
  if (!button) return;
  button.disabled = busy;
  button.textContent = busy ? pending : normal;
};
const notice = new URLSearchParams(location.search);
document.querySelectorAll("[data-toggle]").forEach(button => {
  button.addEventListener("click", () => {
    const input = $(button.dataset.toggle);
    if (!input) return;
    const masked = input.type === "password";
    input.type = masked ? "text" : "password";
    button.textContent = masked ? "Hide" : "Show";
    button.setAttribute("aria-label", masked ? "Hide password" : "Show password");
  });
});
async function callBackend(action, payload = {}) {
  const res = await supabase.functions.invoke("rboas-api", { body: { action, ...payload } });
  if (res.error) {
    let message = res.error.message || "Request failed";
    if (res.error.context?.json) {
      try { message = (await res.error.context.json()).error || message; } catch {}
    }
    throw new Error(message);
  }
  if (res.data?.error) throw new Error(res.data.error);
  return res.data?.data;
}
async function getVerifiedInvitedUser() {
  const response = await supabase.auth.getUser();
  const user = response.data?.user;
  if (response.error || !user) return null;
  if (!user.email_confirmed_at || !user.invited_at) return null;
  return user;
}
async function setupLogin() {
  if (notice.get("registered") === "1") {
    display("formMessage", "Registration complete. Sign in using your new password.", true);
  }
  const form = $("loginForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = $("submitButton");
    const email = String($("email").value || "").trim().toLowerCase();
    const password = $("password").value;
    display("formMessage", "");
    setBusy(button, true, "Sign in to dashboard →", "Signing in securely…");
    try {
      const session = await supabase.auth.signInWithPassword({ email, password });
      if (session.error) throw session.error;
      const user = session.data?.user;
      if (!user || !user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error("Verify your email before signing in.");
      }
      const profile = await supabase.from("user_profiles")
        .select("id,display_name,active")
        .eq("id", user.id).maybeSingle();
      if (profile.error) throw profile.error;
      if (!profile.data) {
        if (user.invited_at) {
          location.replace("/register.html");
          return;
        }
        await supabase.auth.signOut();
        throw new Error("Your account has not been approved. Contact the administrator.");
      }
      if (profile.data.active !== true) {
        await supabase.auth.signOut();
        throw new Error("This account is disabled. Contact the administrator.");
      }
      // The dashboard reads the authenticated session and loads role-appropriate data.
      location.replace("/");
    } catch (error) {
      display("formMessage", error.message || "Unable to sign in.");
      setBusy(button, false, "Sign in to dashboard →", "");
    }
  });
  $("forgotPassword").addEventListener("click", async () => {
    const email = String($("email").value || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      display("formMessage", "Enter your email address above, then select Forgot password.");
      $("email").focus();
      return;
    }
    const button = $("forgotPassword");
    button.disabled = true;
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin + "/"
      });
      if (result.error) throw result.error;
      display("formMessage", "If the address has a registered account, a password-reset email will arrive.", true);
    } catch (error) {
      display("formMessage", error.message || "Unable to request a password reset.");
    } finally { button.disabled = false; }
  });
}
async function setupRegistration() {
  const result = await supabase.auth.getSession();
  if (result.data?.session) {
    const user = await getVerifiedInvitedUser();
    if (user) {
      showProfile(user);
    } else {
      await supabase.auth.signOut();
      display("enrollMessage", "A verified invitation is required to create an RBOAS profile.");
    }
  }
  $("enrollmentForm").addEventListener("submit", async event => {
    event.preventDefault();
    const button = $("enrollSubmit");
    const email = String($("enrollEmail").value || "").trim().toLowerCase();
    setBusy(button, true, "Request registration link →", "Sending invitation…");
    display("enrollMessage", "");
    try {
      // The server responds generically and only invites pre-approved addresses.
      const response = await supabase.functions.invoke("rboas-enrollment", { body: { email } });
      if (response.error) throw response.error;
      display("enrollMessage", "If your email is approved, check your inbox for a secure invitation. Open the link, then complete registration.", true);
      $("enrollmentForm").reset();
    } catch {
      display("enrollMessage", "We could not request an invitation. Try again later or contact your administrator.");
    } finally {
      setBusy(button, false, "Request registration link →", "");
    }
  });
  $("profileForm").addEventListener("submit", async event => {
    event.preventDefault();
    const button = $("profileSubmit");
    const name = String($("profileName").value || "").trim();
    const password = String($("profilePassword").value || "");
    const confirmed = String($("profileConfirm").value || "");
    display("profileMessage", "");
    if (name.length < 2 || name.length > 120) {
      display("profileMessage", "Enter a full name between 2 and 120 characters.");
      return;
    }
    if (password.length < 12) {
      display("profileMessage", "Choose a unique password with at least 12 characters.");
      return;
    }
    if (confirmed !== password) {
      display("profileMessage", "The confirmation password does not match.");
      return;
    }
    setBusy(button, true, "Complete registration →", "Securing your profile…");
    try {
      const user = await getVerifiedInvitedUser();
      if (!user) throw new Error("Your invitation session expired. Request a new invitation and verify your email.");
      const updated = await supabase.auth.updateUser({
        password,
        data: { display_name: name, rboas_profile_completed: true }
      });
      if (updated.error) throw updated.error;
      // Preapproved Administrator/Manager profiles are created server-side.
      // Trainee profiles are created by the Administrator's invite workflow.
      const profile = await supabase.from("user_profiles")
        .select("id,active")
        .eq("id",user.id).maybeSingle();
      if (profile.error) throw profile.error;
      if (!profile.data) {
        await callBackend("activate_preapproved");
      } else if (!profile.data.active) {
        throw new Error("Your account was disabled. Contact the administrator.");
      }
      await callBackend("profile_setup", { display_name: name });
      const out = await supabase.auth.signOut();
      if (out.error) throw out.error;
      // Registration ends here. Users always sign in explicitly afterward.
      location.replace("/login.html?registered=1");
    } catch (error) {
      display("profileMessage", error.message || "Unable to complete registration.");
      setBusy(button, false, "Complete registration →", "");
    }
  });
}
function showProfile(user) {
  $("enrollmentView").hidden = true;
  $("profileView").hidden = false;
  $("verifiedEmail").textContent = user.email || "";
  $("profileName").value = user.user_metadata?.display_name || "";
  const assigned = user.app_metadata?.rboas_role;
  const niceRole = assigned === "admin" ? "Administrator"
    : assigned === "manager" ? "Manager / HR"
    : assigned === "trainee" ? "Trainee"
    : "Approved role assigned during registration";
  $("profileRole").value = niceRole;
  const first = $("profileName");
  if (first && !first.value) first.focus();
}
try {
  if (mode === "login") await setupLogin();
  else if (mode === "register") await setupRegistration();
} catch (error) {
  display(mode === "register" ? "enrollMessage" : "formMessage",
    error.message || "Authentication is currently unavailable. Refresh the page.");
}
