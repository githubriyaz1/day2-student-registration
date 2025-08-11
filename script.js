document.getElementById("registrationForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let department = document.getElementById("department").value.trim();
    let year = document.getElementById("year").value.trim();
    let project = document.getElementById("project").value.trim();

    if (!name || !email || !department || !year || !project) {
        alert("Please fill out all fields.");
        return;
    }

    let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
        alert("Please enter a valid email address.");
        return;
    }

    alert("Registration Successful ✅");
});
