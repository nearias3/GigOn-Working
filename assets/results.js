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
      const [city, stateCountry] = locationInput
        .split(",")
        .map((item) => item.trim());
      fetchAndDisplayEvents(stateCountry, city);
    } else {
      alert("Please enter a city, state, or country code.");
    }
  });

  // Function to fetch events from Ticketmaster
  function fetchTicketmasterEvents(stateCountry, city) {
    const apiKey = "n99815RxaKoko5cmGtzeStgXENAleAVV";
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&stateCode=${stateCountry}&city=${city}`;

    console.log(`Fetching events from: ${url}`);

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("API response:", data);
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
    const storedArtists = JSON.parse(localStorage.getItem("top_artists")) || [];
    return storedArtists.map((artist) => artist.name);
  }

  // Function to filter events by stored artists and ensure only concerts are included
  function filterEventsByStoredArtists(events, storedArtists) {
    return events.filter((event) => {
      const isConcert =
        event.classifications &&
        event.classifications.some(
          (classification) =>
            classification.segment && classification.segment.name === "Music"
        );
      if (event._embedded && event._embedded.attractions && isConcert) {
        const artistNames = event._embedded.attractions.map(
          (attraction) => attraction.name
        );
        return artistNames.some((artistName) =>
          storedArtists.includes(artistName)
        );
      }
      return false;
    });
  }

  // Function to fetch and display events
  async function fetchAndDisplayEvents(stateCountry, city) {
    try {
      const events = await fetchTicketmasterEvents(stateCountry, city);
      const storedArtists = getStoredArtists();
      const filteredEvents = filterEventsByStoredArtists(events, storedArtists);

      displayEvents(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  // Function to display events on the page
  function displayEvents(events) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    events.forEach((event) => {
      const eventDiv = document.createElement("div");
      eventDiv.className = "event";

      const eventName = document.createElement("h2");
      eventName.textContent = event.name;
      eventDiv.appendChild(eventName);

      if (event.dates && event.dates.start && event.dates.start.dateTime) {
        const eventDate = document.createElement("p");
        eventDate.textContent = `Date: ${new Date(
          event.dates.start.dateTime
        ).toLocaleString()}`;
        eventDiv.appendChild(eventDate);
      }

      if (
        event._embedded &&
        event._embedded.venues &&
        event._embedded.venues.length > 0
      ) {
        const eventVenue = document.createElement("p");
        eventVenue.textContent = `Venue: ${event._embedded.venues[0].name}`;
        eventDiv.appendChild(eventVenue);
      }

      resultsDiv.appendChild(eventDiv);
    });
  }
});