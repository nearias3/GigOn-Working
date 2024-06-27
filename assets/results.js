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
      const [city, countryCode] = locationInput
        .split(",")
        .map((item) => item.trim());
      fetchAndDisplayConcerts(countryCode, city);
      document.getElementById("location-modal").classList.remove("is-active");
    } else {
      alert("Please enter a city or zip code.");
    }
  });
});

// Function to fetch events from Ticketmaster
function fetchTicketmasterEvents(countryCode, city) {
  const apiKey = "n99815RxaKoko5cmGtzeStgXENAleAVV";
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&countryCode=${countryCode}&city=${city}`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data._embedded && data._embedded.events) {
        return data._embedded.events;
      } else {
        throw new Error("No events found");
      }
    })
    .catch((error) => {
      console.error("Error fetching events from Ticketmaster:", error);
      throw error;
    });
}

// Function to retrieve stored artists from local storage
function getStoredArtists() {
  const storedArtists = JSON.parse(localStorage.getItem("artists")) || [];
  return storedArtists;
}

// Function to filter events by stored artists
function filterEventsByStoredArtists(events, storedArtists) {
  return events.filter((event) => {
    const artistNames = event._embedded.attractions
      ? event._embedded.attractions.map((attraction) => attraction.name)
      : [];
    return artistNames.some((artistName) => storedArtists.includes(artistName));
  });
}

// Function to fetch and display concerts
async function fetchAndDisplayConcerts(countryCode, city) {
  try {
    const events = await fetchTicketmasterEvents(countryCode, city);
    const storedArtists = getStoredArtists();
    const filteredEvents = filterEventsByStoredArtists(events, storedArtists);

    displayConcerts(filteredEvents);
  } catch (error) {
    console.error("Error fetching concerts:", error);
  }
}

// Function to display concerts on the page
function displayConcerts(events) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  events.forEach((event) => {
    const eventDiv = document.createElement("div");
    eventDiv.className = "event";

    const eventName = document.createElement("h2");
    eventName.textContent = event.name;
    eventDiv.appendChild(eventName);

    const eventDate = document.createElement("p");
    eventDate.textContent = `Date: ${new Date(
      event.dates.start.dateTime
    ).toLocaleString()}`;
    eventDiv.appendChild(eventDate);

    const eventVenue = document.createElement("p");
    eventVenue.textContent = `Venue: ${event._embedded.venues[0].name}`;
    eventDiv.appendChild(eventVenue);

    resultsDiv.appendChild(eventDiv);
  });
}
