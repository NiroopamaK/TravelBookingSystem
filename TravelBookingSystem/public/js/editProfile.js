document.addEventListener("DOMContentLoaded", () => {

    // ============================
    // PROFILE ELEMENTS
    // ============================
    const firstName = document.getElementById("editFirstName")
    const lastName = document.getElementById("editLastName")
    const telephone = document.getElementById("editTelephone")
    const address = document.getElementById("editAddress")
    const saveProfileBtn = document.getElementById("saveProfileBtn")
    const savePasswordBtn = document.getElementById("savePasswordBtn")

    // Store initial values
    const initialValues = {
        firstName: firstName?.value || "",
        lastName: lastName?.value || "",
        telephone: telephone?.value || "",
        address: address?.value || ""
    }

    // Disable buttons initially
    if(saveProfileBtn) saveProfileBtn.disabled = true
    if(savePasswordBtn) savePasswordBtn.disabled = true

    // ============================
    // ENABLE EDITING & SHOW RULES
    // ============================
    document.querySelectorAll(".input-edit").forEach(section => {
        section.addEventListener("click", (e) => {
            if (!e.target.closest(".edit-icon")) return

            const field = section.querySelector("input, textarea")
            if(!field) return

            field.disabled = false
            field.focus()
            field.style.border = "1px solid #2d89ef"
            field.style.background = "#fff"

            // Show rules only if invalid
            const rules = section.querySelector(".rules")
            if(rules) rules.classList.add("hidden")
        })
    })

    // ============================
    // PROFILE VALIDATION
    // ============================
    function validateProfile(){
        if(!firstName || !lastName || !telephone || !address) return

        const phoneRegex = /^[0-9]{7,12}$/

        const firstValid = firstName.value.trim().length >= 1
        const lastValid = lastName.value.trim().length >= 1
        const phoneValid = phoneRegex.test(telephone.value.trim())
        const addressValid = address.value.trim().length >= 5

        toggleRule("editFirstNameRules", firstValid, firstName)
        toggleRule("editLastNameRules", lastValid, lastName)
        toggleRule("editTelephoneRules", phoneValid, telephone)
        toggleRule("editAddressRules", addressValid, address)

        const changed = firstName.value !== initialValues.firstName ||
                        lastName.value !== initialValues.lastName ||
                        telephone.value !== initialValues.telephone ||
                        address.value !== initialValues.address

        if(saveProfileBtn)
            saveProfileBtn.disabled = !(firstValid && lastValid && phoneValid && addressValid && changed)
    }

    function toggleRule(id, valid, field){
        const el = document.getElementById(id)
        if(!el) return
        if(field.disabled){
            el.classList.add("hidden")
        } else {
            el.classList.toggle("hidden", valid)
        }
    }

    ;[firstName,lastName,telephone,address].forEach(f => f?.addEventListener("input", validateProfile))

    // Enable all inputs before submit
    document.getElementById("profileForm")?.addEventListener("submit", () => {
        document.querySelectorAll("#profileForm input, #profileForm textarea").forEach(f => f.disabled = false)
    })

    // ============================
    // PASSWORD TOGGLE
    // ============================
    const profileSection = document.getElementById("profileSection")
    const passwordSection = document.getElementById("passwordSection")

    document.getElementById("changePasswordBtn")?.addEventListener("click", () => {
        if(profileSection) profileSection.style.display = "none"
        if(passwordSection) passwordSection.style.display = "block"

        // Reset password inputs and hide rules
        if(document.getElementById("password")) document.getElementById("password").value = ""
        if(document.getElementById("confirmPassword")) document.getElementById("confirmPassword").value = ""
        passwordRules?.classList.add("hidden")
        confirmRules?.classList.add("hidden")
        if(savePasswordBtn) savePasswordBtn.disabled = true
    })

    document.getElementById("backToProfileBtn")?.addEventListener("click", () => {
        if(passwordSection) passwordSection.style.display = "none"
        if(profileSection) profileSection.style.display = "block"
    })

// ============================
// PASSWORD VALIDATION
// ============================
const password = document.getElementById("password")
const confirmPassword = document.getElementById("confirmPassword")
const passwordRules = document.getElementById("passwordRules")
const confirmRules = document.getElementById("password2Rules")

let passwordValid = false
let confirmValid = false

// Show new password rules when typing
password?.addEventListener("input", () => {
    if(passwordRules?.classList.contains("hidden")){
        passwordRules.classList.remove("hidden")
    }
    validatePassword()
})

// Show confirm password rules only when typing in confirm password
confirmPassword?.addEventListener("input", () => {
    if(confirmRules?.classList.contains("hidden")){
        confirmRules.classList.remove("hidden")
    }
    validateConfirmPassword()
})

function validatePassword() {
    if(!password) return
    const pass = password.value

    const lengthValid = pass.length >= 8
    const upperValid = /[A-Z]/.test(pass)
    const lowerValid = /[a-z]/.test(pass)
    const numberValid = /\d/.test(pass)
    const specialValid = /[\W_]/.test(pass)

    togglePasswordRule("ruleLength", lengthValid)
    togglePasswordRule("ruleUpper", upperValid)
    togglePasswordRule("ruleLower", lowerValid)
    togglePasswordRule("ruleNumber", numberValid)
    togglePasswordRule("ruleSpecial", specialValid)

    // password is valid only if all rules are met
    passwordValid = lengthValid && upperValid && lowerValid && numberValid && specialValid

    // If user typed in confirm password, re-validate it
    if(confirmPassword.value.length > 0) validateConfirmPassword()

    updateSavePasswordBtn()
}

function validateConfirmPassword() {
    if(!password || !confirmPassword) return

    confirmValid = password.value === confirmPassword.value && confirmPassword.value !== ""
    if(confirmRules) confirmRules.classList.toggle("hidden", confirmValid)

    updateSavePasswordBtn()
}

function updateSavePasswordBtn() {
    if(!savePasswordBtn) return
    savePasswordBtn.disabled = !(passwordValid && confirmValid)
}

function togglePasswordRule(id, valid){
    const el = document.getElementById(id)
    if(!el) return
    el.classList.toggle("valid", valid)
    el.classList.toggle("invalid", !valid)
    el.classList.remove("hidden") // always show when typing
}

    // ============================
    // PROFILE IMAGE PREVIEW
    // ============================
    document.getElementById("profileUpload")?.addEventListener("change", function(){
        const file = this.files[0]
        if(!file) return
        const reader = new FileReader()
        reader.onload = e => document.getElementById("sidebarProfilePic").src = e.target.result
        reader.readAsDataURL(file)
    })

    // ============================
    // LOGOUT
    // ============================
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("token")
        window.location.href = "/"
    })

    // ============================
// DASHBOARD NAVIGATION
// ============================
const dashboardBtn = document.getElementById("dashboardBtn");

dashboardBtn?.addEventListener("click", () => {
    const role = dashboardBtn.dataset.role;

    switch (role) {
        case "ADMIN":
            window.location.href = "/admin/adminDashboard";
            break;
        case "TRAVELLER":
            window.location.href = "/traveller/dashboard";
            break;
        case "TRAVEL_AGENT":
            window.location.href = "/agent/agentDashboard";
            break;
        default:
            window.location.href = "/";
    }
});

})