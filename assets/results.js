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
    const country = "USA";
    try {
      const filteredArtists = await filterTopArtistsByStored(country);
      // Use filteredArtists and location to fetch concerts from another API or service
      // Example: displayConcerts(filteredArtists, location);
      console.log("Filtered Artists:", filteredArtists);
      console.log("Location:", location);
    } catch (error) {
      console.error("Error fetching concerts:", error);
      alert("Error fetching concerts. Please try again later.");
    }
  }

  // Function to fetch top artists from Last.fm
  function fetchTopArtists(country) {
    const apiKey = "311009ad05c5e835188a55a88b9d2955";
    const url = `https://ws.audioscrobbler.com/2.0/?method=geo.gettopartists&country=${country}&api_key=${apiKey}&format=json`;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Extract the list of artists from the response
        const topArtists = data.topartists.artist.map((artist) => artist.name);
        return topArtists;
      })
      .catch((error) => {
        console.error("Error fetching top artists:", error);
        throw error; // Propagate the error for handling further up
      });
  }

  // Function to retrieve stored artists from local storage
  function getStoredArtists() {
    const storedArtists = JSON.parse(localStorage.getItem("artists")) || [];
    return storedArtists;
  }

  // Function to filter top artists by stored artists
  async function filterTopArtistsByStored(country) {
    try {
      const topArtists = await fetchTopArtists(country);
      const storedArtists = getStoredArtists();

      // Filter top artists based on stored artists
      const filteredArtists = topArtists.filter((artist) =>
        storedArtists.includes(artist)
      );

      return filteredArtists;
    } catch (error) {
      console.error("Error filtering top artists:", error);
      throw error; // Propagate the error for handling further up
    }
  }
});
