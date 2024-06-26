document.getElementById("open-modal-button").addEventListener("click", () => {
  const modal = document.getElementById("location-modal");
  modal.classList.add("is-active");
});

document
  .querySelectorAll(".modal .delete, .modal .cancel-button")
  .forEach(($close) => {
    const $target = $close.closest(".modal");

    $close.addEventListener("click", () => {
      $target.classList.remove("is-active");
    });
  });

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

async function fetchConcerts(location) {
  const topArtists = JSON.parse(localStorage.getItem("top_artists"));
  const apiKey = "311009ad05c5e835188a55a88b9d2955";
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  if (!topArtists || topArtists.length === 0) {
    resultsContainer.innerHTML = "<p>No top artists found.</p>";
    return;
  }

  for (const artist of topArtists) {
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getevents&artist=${encodeURIComponent(
      artist.name
    )}&api_key=${apiKey}&format=json`;
    console.log(`Fetching events for ${artist.name} with URL: ${apiUrl}`);

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok && data.events && data.events.event) {
        const filteredEvents = data.events.event.filter(
          (event) =>
            event.venue.location.city
              .toLowerCase()
              .includes(location.toLowerCase()) ||
            event.venue.location.zip
              .toLowerCase()
              .includes(location.toLowerCase())
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
          resultsContainer.innerHTML += `<p>No concerts found for ${artist.name} in ${location}.</p>`;
        }
      } else {
        console.error(
          `Error fetching events: ${data.message || "Unknown error"}`
        );
        resultsContainer.innerHTML += `<p>Error fetching concerts for ${artist.name}. Please try again later.</p>`;
      }
    } catch (error) {
      console.error(`Error fetching events for ${artist.name}:`, error);
      resultsContainer.innerHTML += `<p>Error fetching concerts for ${artist.name}. Please try again later.</p>`;
    }
  }
}
