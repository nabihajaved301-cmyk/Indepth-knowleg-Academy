document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("student-registration-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        try {

            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {

                alert("🎉 Thank you for registering! We will contact you on WhatsApp/Email soon.'");

                form.reset();

            } else {

                alert("❌ Something went wrong.\n" + result.message);

            }

        } catch (error) {

            alert("❌ Network error. Please try again.");

            console.error(error);

        }

    });

});