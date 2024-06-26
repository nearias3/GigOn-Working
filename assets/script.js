const clientId = "8348b3df28ea43d7b78702da44acb211";
const redirectUrl = "https://nearias3.github.io/GigOn-Working/";

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = "user-read-private user-read-email user-top-read";

const currentToken = {
  get access_token() {
    return localStorage.getItem("access_token") || null;
  },
  get refresh_token() {
    return localStorage.getItem("refresh_token") || null;
  },
  get expires_in() {
    return localStorage.getItem("expires_in") || null;
  },
  get expires() {
    return localStorage.getItem("expires") || null;
  },

  save: function (response) {
    const { access_token, refresh_token, expires_in } = response;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("expires_in", expires_in);

    const now = new Date();
    const expiry = new Date(now.getTime() + expires_in * 1000);
    localStorage.setItem("expires", expiry);
  },
};

async function handleRedirectCallback() {
const args = new URLSearchParams(window.location.search);
const code = args.get("code");

if (code) {
    const token = await getToken(code);
    currentToken.save(token);

    const url = new URL(window.location.href);
    url.searchParams.delete("code");

    const updatedUrl = url.search ? url.href : url.href.replace("?", "");
    window.history.replaceState({}, document.title, updatedUrl);
    
    loadData();
    } else {
      if (currentToken.access_token) {
        loadData();
      } else {
      renderTemplate("main", "login");
    }
  }
}

async function loadData() {
    const userData = await getUserData();
    const topArtists = await getTopArtists();
    const topTracks = await getTopTracks();

    const combinedData = {
      ...userData,
      top_artists: topArtists,
      top_tracks: topTracks,
    };

    console.log("User data fetched:", combinedData);
    renderTemplate("main", "logged-in-template", combinedData);
    renderTemplate("oauth", "oauth-template", currentToken);
  }

async function redirectToSpotifyAuthorize() {
  console.log("Redirecting to Spotify for authorization...");

  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const randomString = randomValues.reduce(
    (acc, x) => acc + possible.charAt(x % possible.length),
    ""
  );

  const code_verifier = randomString;
  const data = new TextEncoder().encode(code_verifier);
  const hashed = await crypto.subtle.digest("SHA-256", data);

  const code_challenge_base64 = btoa(
    String.fromCharCode(...new Uint8Array(hashed))
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  window.localStorage.setItem("code_verifier", code_verifier);

  const authUrl = new URL(authorizationEndpoint);
  const params = {
    response_type: "code",
    client_id: clientId,
    scope: scope,
    code_challenge_method: "S256",
    code_challenge: code_challenge_base64,
    redirect_uri: redirectUrl,
  };

  authUrl.search = new URLSearchParams(params).toString();
  console.log(`Auth URL: ${authUrl.toString()}`);
  window.location.href = authUrl.toString();
}

async function getToken(code) {
  const code_verifier = localStorage.getItem("code_verifier");

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUrl,
      code_verifier: code_verifier,
    }),
  });

  return await response.json();
}

async function refreshToken() {
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: currentToken.refresh_token,
    }),
  });

  const token = await response.json();
  currentToken.save(token);
  return token;
}

async function getUserData() {
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: "Bearer " + currentToken.access_token },
  });

  if (response.status === 401) {
    await refreshToken();
    return getUserData();
  }

  return await response.json();
}

async function getTopArtists() {
  const response = await fetch("https://api.spotify.com/v1/me/top/artists", {
    method: "GET",
    headers: { Authorization: "Bearer " + currentToken.access_token },
  });

  if (response.status === 401) {
    await refreshToken();
    return getTopArtists();
  }

  return await response.json();
}

async function getTopTracks() {
  const response = await fetch("https://api.spotify.com/v1/me/top/tracks", {
    method: "GET",
    headers: { Authorization: "Bearer " + currentToken.access_token },
  });

  if (response.status === 401) {
    await refreshToken();
    return getTopTracks();
  }

  return await response.json();
}

async function loginWithSpotifyClick() {
  await redirectToSpotifyAuthorize();
}

async function logoutClick() {
  localStorage.clear();
  window.location.href = redirectUrl;
}

async function refreshTokenClick() {
  const token = await refreshToken();
  currentToken.save(token);
  renderTemplate("oauth", "oauth-template", currentToken);
}

function renderTemplate(targetId, templateId, data = null) {
  const template = document.getElementById(templateId);
  if (!template) {
    console.error(`Template with ID '${templateId}' not found.`);
    return;
  }

  const clone = template.content.cloneNode(true);

  const elements = clone.querySelectorAll(
    "[data-bind], [data-bind-onclick], [data-bind-src], [data-bind-alt], [data-bind-href]"
  );
  elements.forEach((ele) => {
    if (ele.hasAttribute("data-bind")) {
      const bindAttr = ele.getAttribute("data-bind");
      if (data && data[bindAttr]) {
        ele.textContent = data[bindAttr];
      }
    }
    if (ele.hasAttribute("data-bind-onclick")) {
      const bindAttr = ele.getAttribute("data-bind-onclick");
      ele.addEventListener("click", eval(bindAttr));
    }
    if (ele.hasAttribute("data-bind-src")) {
      const bindAttr = ele.getAttribute("data-bind-src");
      if (data && data[bindAttr]) {
        ele.src = data[bindAttr];
      }
    }
    if (ele.hasAttribute("data-bind-alt")) {
      const bindAttr = ele.getAttribute("data-bind-alt");
      if (data && data[bindAttr]) {
        ele.alt = data[bindAttr];
      }
    }
    if (ele.hasAttribute("data-bind-href")) {
      const bindAttr = ele.getAttribute("data-bind-href");
      if (data && data[bindAttr]) {
        ele.href = data[bindAttr];
      }
    }
  });

  const target = document.getElementById(targetId);
  if (!target) {
    console.error(`Target element with ID '${targetId}' not found.`);
    return;
  }
  target.innerHTML = "";
  target.appendChild(clone);

  if (data && data.top_artists && data.top_tracks) {
    const topArtistsList = document.getElementById("top-artists-list");
    const topTracksList = document.getElementById("top-tracks-list");

    if (topArtistsList) {
      data.top_artists.items.forEach((artist) => {
        const li = document.createElement("li");
        li.textContent = artist.name;
        topArtistsList.appendChild(li);
      });
    }

    if (topTracksList) {
      data.top_tracks.items.forEach((track) => {
        const li = document.createElement("li");
        li.textContent = track.name;
        topTracksList.appendChild(li);
      });
    }
  }
}