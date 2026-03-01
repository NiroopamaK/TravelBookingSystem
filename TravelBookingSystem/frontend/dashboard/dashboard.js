// admin.js
fetch("../navigation/top-navbar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("navbar-container").innerHTML = html;

    const script = document.createElement("script");
    script.src = "../navigation/top-navbar.js";
    document.body.appendChild(script);
  });

//render sidebar
