document.addEventListener("DOMContentLoaded", function () {
  const openModalButton = document.getElementById("open-modal-button");
  const closeModalButtons = document.querySelectorAll(
    ".delete, .cancel-button"
  );
  const searchButton = document.getElementById("search-button");

  // Open modal event listener
  openModalButton.addEventListener("click", function () {
    const locationModal = document.getElementById("location-modal");
    locationModal.classList.add("is-active");
  });

  // Close modal event listeners
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const locationModal = document.getElementById("location-modal");
      locationModal.classList.remove("is-active");
    });
  });

  // Search button event listener
  searchButton.addEventListener("click", function () {
    const locationInput = document
      .getElementById("location-input")
      .value.trim();
    if (locationInput) {
      fetchAndDisplayConcerts(locationInput);
    } else {
      alert("Please enter a city or zip code.");
    }
  });

  // Function to fetch and display concerts
  async function fetchAndDisplayConcerts(location) {
    try {
      const events = await fetchEventbriteEvents(location);
      displayConcerts(events);
    } catch (error) {
      console.error("Error fetching concerts:", error);
      alert("Error fetching concerts. Please try again later.");
    }
  }

  // Function to fetch events from Eventbrite
  async function fetchEventbriteEvents(location) {
    const apiKey = "3IHMABF7MOOXV3HPLEC5"
    const url = `https://www.eventbriteapi.com/v3/events/search/?location.address=${location}&token=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      return data.events;
    } else {
      console.error("Error fetching events from Eventbrite:", data.error);
      throw new Error(data.error);
    }
  }

  // Function to display concerts
  function displayConcerts(events) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (events.length === 0) {
      resultsDiv.textContent = "No concerts found.";
      return;
    }

    events.forEach((event) => {
      const eventElement = document.createElement("div");
      eventElement.classList.add("event");

      const eventTitle = document.createElement("h2");
      eventTitle.textContent = event.name.text;

      const eventDate = document.createElement("p");
      eventDate.textContent = new Date(event.start.utc).toLocaleString();

      const eventLink = document.createElement("a");
      eventLink.href = event.url;
      eventLink.textContent = "View Event";
      eventLink.target = "_blank";

      eventElement.appendChild(eventTitle);
      eventElement.appendChild(eventDate);
      eventElement.appendChild(eventLink);

      resultsDiv.appendChild(eventElement);
    });
  }
});
