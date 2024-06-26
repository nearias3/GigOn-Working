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
