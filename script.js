let currentUser = null;
let currentPlan = "Free";
let pendingPlan = null;
let toastTimer = null;
let currentVideo = null;

const trailerId = "969fc13f3fe02703f09ff1ff282bc86a";
/*const demoVideoUrl = "animate logo with without website.Mp4";*/
const dbKey = "vglopixsMemberDatabase";

const titles = [
    { title: "V GLOPIXS Spotlight", type: "movies", rail: "movies", premium: false, desc: "OTT app teaser - featured trailer", img: "company logo.png", video: "logo video 1 10 sec (1).mp4", likes: 18400, views: 252000, download: "Trailer HD" },
  { title: "", type: "movies", rail: "movies", premium: false, desc: "Action drama - English", img: "https://i.pinimg.com/736x/26/94/c5/2694c5616f5802c6e43f1b9d13cb4067.jpg", video: trailerId, likes: 18400, views: 252000, download: "Trailer HD" },
  { title: "", type: "movies", rail: "movies", premium: true, desc: "Action drama - English", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=700", video: trailerId, likes: 21400, views: 415000, download: "Episode HD" },
  { title: "", type: "movies", rail: "movies", premium: false, desc: "Epic drama - English", img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700", video: trailerId, likes: 31200, views: 620000, download: "Movie HD" },
  { title: "", type: "movies", rail: "movies", premium: false, desc: "Sci-fi action - English", img: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=700", video: trailerId, likes: 40800, views: 770000, download: "Movie HD" },
  { title: "Cristiano Ronaldo", type: "series", rail: "series", premium: false, desc: "Survival action - Hindi", img: "https://i.pinimg.com/1200x/2e/19/06/2e1906ac82a76f67a4c8317d6ad69e80.jpg", video: trailerId, likes: 27800, views: 512000, download: "Episode HD" },
  { title: "", type: "series", rail: "series", premium: false, desc: "Drama series - 10 episodes", img: "https://i.pinimg.com/736x/dd/3f/3e/dd3f3e84f4576eeeb97e935e0ddac4a5.jpg", video: trailerId, likes: 62400, views: 980000, download: "Episode HD" },
  { title: "", type: "series", rail: "series", premium: true, desc: "Tech thriller - 6 episodes", img: "https://i.pinimg.com/736x/8e/74/cf/8e74cfa97cf26daee85eb767f1b0ecfe.jpg", video: trailerId, likes: 46100, views: 840000, download: "Episode HD" },
  { title: "", type: "series", rail: "series", premium: false, desc: "Family comedy - Hindi", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700", video: trailerId, likes: 33900, views: 690000, download: "Episode HD" },
  { title: "", type: "romance", rail: "romance", premium: true, desc: "Romance stream - Hindi", img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=700", video: trailerId, likes: 71200, views: 1210000, download: "Movie HD" },
  { title: "", type: "romance", rail: "romance", premium: false, desc: "Romantic drama - Marathi", img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=700", video: trailerId, likes: 24700, views: 430000, download: "Movie HD" },
  { title: "", type: "romance", rail: "romance", premium: true, desc: "Modern romance - Hindi", img: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=700", video: trailerId, likes: 53600, views: 930000, download: "Movie HD" },
  { title: "", type: "kids", rail: "kids", premium: false, desc: "Kids adventure - Hindi", img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=700", video: trailerId, likes: 19200, views: 380000, download: "Episode HD" },
  { title: "", type: "kids", rail: "kids", premium: false, desc: "Animated sci-fi - English", img: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=700", video: trailerId, likes: 23100, views: 460000, download: "Episode HD" },
  { title: "", type: "kids", rail: "kids", premium: true, desc: "Family learning - English", img: "https://i.pinimg.com/736x/33/52/b2/3352b206b07100316ef7fab2e592a914.jpg", video: trailerId, likes: 16800, views: 310000, download: "Episode HD" }
];

function getDatabase() {
  const saved = localStorage.getItem(dbKey);
  if (!saved) return { loginMembers: [], subscriptionMembers: [], watchlist: [], likes: [] };

  try {
    const parsed = JSON.parse(saved);
    return {
      loginMembers: parsed.loginMembers || [],
      subscriptionMembers: parsed.subscriptionMembers || [],
      watchlist: parsed.watchlist || [],
      likes: parsed.likes || []
    };
  } catch {
    return { loginMembers: [], subscriptionMembers: [], watchlist: [], likes: [] };
  }
}

function saveDatabase(database) {
  localStorage.setItem(dbKey, JSON.stringify(database));
}

function upsertLoginMember(user) {
  const database = getDatabase();
  const existing = database.loginMembers.find(member => member.email === user.email);
  if (existing) {
    existing.name = user.name;
  } else {
    database.loginMembers.push({
      name: user.name,
      email: user.email,
      joined: new Date().toISOString().slice(0, 10)
    });
  }
  saveDatabase(database);
}

function upsertSubscriptionMember(user, planName, price) {
  const database = getDatabase();
  const existing = database.subscriptionMembers.find(member => member.email === user.email);
  const record = {
    name: user.name,
    email: user.email,
    plan: planName,
    price,
    status: "Active",
    updatedAt: new Date().toISOString()
  };

  if (existing) {
    Object.assign(existing, record);
  } else {
    database.subscriptionMembers.push(record);
  }

  saveDatabase(database);
}

function makeCard(item) {
  return `
    <article class="poster-card" ondblclick="playTrailer('${item.title}')" title="Double click to play">
      <img src="${item.img}" alt="${item.title}" loading="lazy">
      <div class="card-info">
        <span class="badge ${item.premium ? "" : "free"}">${item.premium ? "Premium" : "Free"}</span>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
      </div>
    </article>
  `;
}

function renderRows() {
  const movies = titles.filter(item => item.rail === "movies");
  const series = titles.filter(item => item.rail === "series");
  const romance = titles.filter(item => item.rail === "romance");
  const kids = titles.filter(item => item.rail === "kids");
  const trending = [...titles].sort((a, b) => Number(b.premium) - Number(a.premium)).slice(0, 10);

  document.getElementById("moviesRow").innerHTML = movies.map(item => makeCard(item)).join("");
  document.getElementById("seriesRow").innerHTML = series.map(item => makeCard(item)).join("");
  document.getElementById("romanceRow").innerHTML = romance.map(item => makeCard(item)).join("");
  document.getElementById("kidsRow").innerHTML = kids.map(item => makeCard(item)).join("");
  document.getElementById("trendingRow").innerHTML = trending.map(item => makeCard(item)).join("");
}

function searchTitles() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const section = document.getElementById("searchResults");
  const grid = document.getElementById("searchGrid");
  const count = document.getElementById("resultCount");

  if (!query) {
    section.classList.add("hidden");
    return;
  }

  const results = titles.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.type.toLowerCase().includes(query) ||
    item.desc.toLowerCase().includes(query)
  );

  section.classList.remove("hidden");
  count.textContent = `${results.length} found`;
  grid.innerHTML = results.length
    ? results.map(item => makeCard(item)).join("")
    : "<p>No titles found.</p>";
}

function filterBy(type) {
  const section = document.getElementById("searchResults");
  const grid = document.getElementById("searchGrid");
  const count = document.getElementById("resultCount");
  const results = type === "all"
    ? titles
    : type === "premium"
      ? titles.filter(item => item.premium)
      : titles.filter(item => item.type === type);

  section.classList.remove("hidden");
  count.textContent = `${results.length} found`;
  grid.innerHTML = results.map(item => makeCard(item)).join("");
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function playTrailer(title) {
  const item = titles.find(entry => entry.title === title);
  if (item?.premium && currentPlan === "Free") {
    showToast("Premium title. Please open My Space and choose a plan first.");
    openProfile();
    return;
  }

  const videoFrame = document.getElementById("videoFrame");
  const videoSource = item?.video || trailerId;
  const src = videoSource.endsWith(".mp4")
    ? videoSource
    : demoVideoUrl;
  currentVideo = item || null;
  document.getElementById("playerModal").classList.remove("hidden");
  videoFrame.src = src;
  videoFrame.load();
  videoFrame.play().catch(() => {});
  renderVideoDetails(item);
}

function closePlayer() {
  document.getElementById("playerModal").classList.add("hidden");
  document.getElementById("videoFrame").pause();
  document.getElementById("videoFrame").src = "";
  currentVideo = null;
}

function addToWatchlist(title) {
  const database = getDatabase();
  if (!database.watchlist.includes(title)) database.watchlist.push(title);
  saveDatabase(database);
  showToast(`${title} added to My List`);
  if (currentVideo?.title === title) renderVideoDetails(currentVideo);
}

function formatCount(value) {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
}

function renderVideoDetails(item) {
  const database = getDatabase();
  const inList = item ? database.watchlist.includes(item.title) : false;
  const liked = item ? database.likes.includes(item.title) : false;
  const calculatedLikes = (item?.likes || 0) + (liked ? 1 : 0);
  document.getElementById("videoType").textContent = item?.type || "Video";
  document.getElementById("videoTitle").textContent = item?.title || "Video";
  document.getElementById("videoDesc").textContent = item?.desc || "Video information";
  document.getElementById("videoLikes").textContent = `${formatCount(calculatedLikes)} Likes`;
  document.getElementById("videoViews").textContent = `${formatCount(item?.views)} Views`;
  document.getElementById("videoListStatus").textContent = inList ? "In My List" : "Not in List";
  document.getElementById("likeButton").classList.toggle("liked", liked);
}

function downloadCurrentVideo() {
  if (!currentVideo) return;
  showToast(`${currentVideo.download || "Video"} download will be available from backend upload.`);
}

function toggleLike() {
  if (!currentVideo) return;
  const database = getDatabase();
  const title = currentVideo.title;
  const index = database.likes.indexOf(title);

  if (index >= 0) {
    database.likes.splice(index, 1);
    showToast("Like removed");
  } else {
    database.likes.push(title);
    showToast("Liked");
  }

  saveDatabase(database);
  renderVideoDetails(currentVideo);
}

function updatePlaybackSetting(name, value) {
  showToast(`${name}: ${value}`);
}


function subscribe(planName, price) {
  if (!currentUser) {
    pendingPlan = { planName, price };
    showToast("Login first to activate this plan.");
    openLogin();
    return;
  }

  currentPlan = `${planName} - ${price}`;
  upsertSubscriptionMember(currentUser, planName, price);
  updateProfile();
  showToast(`Plan activated: ${currentPlan}`);
}

function openLogin() {
  document.getElementById("loginModal").classList.remove("hidden");
}

function closeLogin() {
  document.getElementById("loginModal").classList.add("hidden");
}

function login(event) {
  event.preventDefault();
  currentUser = {
    name: document.getElementById("nameInput").value.trim() || "User",
    email: document.getElementById("emailInput").value.trim()
  };

  upsertLoginMember(currentUser);

  if (pendingPlan) {
    currentPlan = `${pendingPlan.planName} - ${pendingPlan.price}`;
    upsertSubscriptionMember(currentUser, pendingPlan.planName, pendingPlan.price);
    pendingPlan = null;
  }

  updateProfile();
  closeLogin();
  openProfile();
  showToast(`Welcome, ${currentUser.name}`);
}

function openProfile() {
  updateProfile();
  document.getElementById("profilePanel").classList.remove("hidden");
}

function closeProfile() {
  document.getElementById("profilePanel").classList.add("hidden");
}

function updateProfile() {
  document.getElementById("profileName").textContent = currentUser?.name || "Guest";
  document.getElementById("profileEmail").textContent = currentUser?.email || "Login to manage your profile";
  document.getElementById("profilePlan").textContent = currentPlan;
  document.getElementById("guestActions").classList.toggle("hidden", Boolean(currentUser));
  document.getElementById("memberActions").classList.toggle("hidden", !currentUser);
}

function logout() {
  currentUser = null;
  currentPlan = "Free";
  updateProfile();
  closeProfile();
  showToast("Logged out");
}

function scrollHome() {
  closeProfile();
  document.getElementById("home").scrollIntoView({ behavior: "smooth" });
}

function scrollToRail(id, link) {
  document.querySelectorAll(".nav-link").forEach(navLink => navLink.classList.remove("active"));
  if (link) link.classList.add("active");
  closeProfile();
  document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2600);
}

document.addEventListener("DOMContentLoaded", () => {
  renderRows();
  updateProfile();
});
