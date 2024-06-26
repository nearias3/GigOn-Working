document.getElementById("search-button").addEventListener("click", () => {
  const location = document.getElementById("location-input").value;
  if (location) {
    fetchConcerts(location);
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
    try {
      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=artist.getevents&artist=${artist.name}&api_key=${apiKey}&format=json`
      );
      const data = await response.json();

      if (data.events && data.events.event) {
        data.events.event.forEach((event) => {
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
    } catch (error) {
      console.error(`Error fetching events for ${artist.name}:`, error);
      resultsContainer.innerHTML += `<p>Error fetching concerts for ${artist.name}. Please try again later.</p>`;
    }
  }
}