const generateAiBtn = document.getElementById("generateAiBtn");
const aiStatus = document.getElementById("aiStatus");

if (generateAiBtn) {
  generateAiBtn.addEventListener("click", async () => {
    const location = document.querySelector(
      '[name="listing[location]"]',
    )?.value;

    const country = document.querySelector('[name="listing[country]"]')?.value;

    const price = document.querySelector('[name="listing[price]"]')?.value;

    const description = document.querySelector(
      '[name="listing[description]"]',
    )?.value;

    if (!location) {
      aiStatus.textContent = "Please enter a location first.";
      return;
    }

    generateAiBtn.disabled = true;
    aiStatus.textContent = "Generating with AI...";

    try {
      const response = await fetch("/ai/generate-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          location,
          country,
          price,
          existingDescription: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI request failed.");
      }

      const parts = data.result.split("DESCRIPTION:");

      const titlePart = parts[0].replace("TITLE:", "").trim();

      const descriptionPart = parts[1] ? parts[1].trim() : data.result.trim();

      const titleInput = document.querySelector('[name="listing[title]"]');

      const descriptionInput = document.querySelector(
        '[name="listing[description]"]',
      );

      if (titleInput) {
        titleInput.value = titlePart;
      }

      if (descriptionInput) {
        descriptionInput.value = descriptionPart;
      }

      aiStatus.textContent = "Generated! Review it before saving.";
    } catch (error) {
      console.error("AI Error:", error);

      aiStatus.textContent = error.message || "Something went wrong.";
    } finally {
      generateAiBtn.disabled = false;
    }
  });
}
