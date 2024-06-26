document.addEventListener("DOMContentLoaded", () => {
  // Show the modal when the "Enter Location" button is clicked
  document.getElementById("open-modal-button").addEventListener("click", () => {
    const modal = document.getElementById("location-modal");
    modal.classList.add("is-active");
  });

  // Hide the modal when the close button or cancel button is clicked
  document
    .querySelectorAll(".modal .delete, .modal .cancel-button")
    .forEach(($close) => {
      const $target = $close.closest(".modal");

      $close.addEventListener("click", () => {
        $target.classList.remove("is-active");
      });
    });

  // Handle the search button click to fetch concerts
  document.getElementById("search-button").addEventListener("click", () => {
    const location = document.getElementById("location-input").value;
    const modal = document.getElementById("location-modal");

    if (location) {
      fetchConcerts(location);
      modal.classList.remove("is-active");
    } else {
      alert("Please enter a city or zip code.");
    }
  });
});

async function fetchConcerts(location) {
  const topArtists = JSON.parse(localStorage.getItem("top_artists"));
  const apiKey = "311009ad05c5e835188a55a88b9d2955";
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  if (!topArtists || topArtists.length === 0) {
    resultsContainer.innerHTML = "<p>No top artists found.</p>";
    return;
  }

  const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=geo.getEvents&location=${encodeURIComponent(
    location
  )}&api_key=${apiKey}&format=json`;
  console.log(`Fetching events with URL: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (response.ok && data.events && data.events.event) {
      const filteredEvents = data.events.event.filter((event) =>
        topArtists.some((artist) => event.artists.artist.includes(artist.name))
      );

      if (filteredEvents.length > 0) {
        filteredEvents.forEach((event) => {
          const eventElement = document.createElement("div");
          eventElement.innerHTML = `
            <h2>${event.title}</h2>
            <p>${event.venue.name}, ${event.venue.location.city}</p>
            <p>${event.startDate}</p>
          `;
          resultsContainer.appendChild(eventElement);
        });
      } else {
        resultsContainer.innerHTML = `<p>No concerts found for your top artists in ${location}.</p>`;
      }
    } else {
      console.error(
        `Error fetching events: ${data.message || "Unknown error"}`
      );
      resultsContainer.innerHTML = `<p>Error fetching concerts. Please try again later.</p>`;
    }
  } catch (error) {
    console.error(`Error fetching events:`, error);
    resultsContainer.innerHTML = `<p>Error fetching concerts. Please try again later.</p>`;
  }
}
