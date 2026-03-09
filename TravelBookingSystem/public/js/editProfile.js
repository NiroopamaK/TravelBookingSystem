// ============================
// Enable editing of profile fields when clicking pen icon
// ============================

document.querySelectorAll(".edit-icon").forEach(icon => {
    icon.addEventListener("click", () => {
        const container = icon.closest(".input-edit") // find parent .input-edit
        const input = container.querySelector("input, textarea") // get input/textarea inside
        if (input) {
            input.removeAttribute("disabled")  // enable editing
            input.focus()                      // focus for convenience
            input.style.borderColor = "#2d89ef" // optional highlight
        }
    })
})

// ============================
// Section toggle: Profile <-> Password
// ============================

const profileSection = document.getElementById("profileSection")
const passwordSection = document.getElementById("passwordSection")
const profileTitle = document.getElementById("profileTitle")
const passwordTitle = document.getElementById("passwordTitle")

// Show password section
document.getElementById("changePasswordBtn").addEventListener("click", () => {
    profileSection.style.display = "none"
    passwordSection.style.display = "flex"
    profileTitle.style.display = "none"
    passwordTitle.style.display = "block"
})

// Back arrow in password section
document.getElementById("backToProfileBtn").addEventListener("click", () => {
    showProfileSection()
})

// Function to show profile section
function showProfileSection() {
    profileSection.style.display = "flex"
    passwordSection.style.display = "none"
    profileTitle.style.display = "block"
    passwordTitle.style.display = "none"

    // Optional: re-disable inputs when going back
    document.querySelectorAll(".profile-section input, .profile-section textarea").forEach(el => {
        el.setAttribute("disabled", "true")
        el.style.borderColor = "#ccc"
    })
}

// ============================
// Save buttons
// ============================

// Save profile changes
document.getElementById("saveProfileBtn").addEventListener("click", () => {
    showProfileSection()
})

// Save password changes with validation
document.getElementById("savePasswordBtn").addEventListener("click", (e) => {
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value

    if(password.length > 0 && password !== confirmPassword){
        e.preventDefault()
        alert("Passwords do not match")
    } else {
        showProfileSection()
        // Clear password fields
        document.getElementById("password").value = ""
        document.getElementById("confirmPassword").value = ""
    }
})

// ============================
// Profile picture preview
// ============================

document.getElementById("profileUpload").addEventListener("change", function(){
    const file = this.files[0]
    if(file){
        const reader = new FileReader()
        reader.onload = function(e){
            document.getElementById("sidebarProfilePic").src = e.target.result
        }
        reader.readAsDataURL(file)
    }
})

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token"); // remove token
    window.location.href = "/";        // redirect to login page
});