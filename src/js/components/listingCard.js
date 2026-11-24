const SVG_NS = "http://www.w3.org/2000/svg";

// Icons

function createSvgIcon() {
  const icon = document.createElementNS(SVG_NS, "svg");

  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");

  icon.classList.add("listing-icon");

  return icon;
}

function createCoinIcon() {
  const icon = createSvgIcon();

  for (const y of [3, 10, 17]) {
    const coin = document.createElementNS(SVG_NS, "rect");

    coin.setAttribute("x", "3");
    coin.setAttribute("y", String(y));
    coin.setAttribute("width", "18");
    coin.setAttribute("height", "5");
    coin.setAttribute("rx", "2.5");
    coin.setAttribute("fill", "var(--color-cta)");
    coin.setAttribute("stroke", "var(--color-modal)");
    coin.setAttribute("stroke-width", "1.2");

    icon.append(coin);
  }

  return icon;
}

function createClockIcon() {
  const icon = createSvgIcon();

  icon.classList.add("listing-card-clock-icon");

  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");

  const face = document.createElementNS(SVG_NS, "circle");

  face.setAttribute("cx", "12");
  face.setAttribute("cy", "12");
  face.setAttribute("r", "9");

  const hands = document.createElementNS(SVG_NS, "path");

  hands.setAttribute("d", "M12 7v5l3 2");

  icon.append(face, hands);

  return icon;
}

// Auction Data

function getHighestBid(bids = []) {
  const amounts = bids.map((bid) => Number(bid.amount)).filter(Number.isFinite);

  return amounts.length ? Math.max(...amounts) : null;
}

function getTimeRemaining(endsAt) {
  const endTime = new Date(endsAt).getTime();

  if (!Number.isFinite(endTime)) {
    return "End time unavailable";
  }

  const hoursLeft = Math.ceil((endTime - Date.now()) / 3600000);

  if (hoursLeft <= 0) {
    return "Auction ended";
  }

  const days = Math.floor(hoursLeft / 24);
  const hours = hoursLeft % 24;

  if (days === 0) {
    return `${hours} hrs left`;
  }

  return `${days} ${days === 1 ? "day" : "days"} ${hours} hrs left`;
}

// Listing Card

export function createListingCard(listing) {
  const card = document.createElement("article");
  card.className = "listing-card";

  const titleText = listing.title || "Untitled auction";
  const firstImage = listing.media?.[0];

  // Image

  const placeholder = document.createElement("div");
  placeholder.className = "listing-card-image listing-card-placeholder";

  const imageIcon = document.createElementNS(SVG_NS, "svg");
  imageIcon.setAttribute("viewBox", "0 0 24 24");
  imageIcon.setAttribute("fill", "none");
  imageIcon.setAttribute("stroke", "currentColor");
  imageIcon.setAttribute("stroke-width", "1.5");
  imageIcon.setAttribute("aria-hidden", "true");
  imageIcon.classList.add("size-8");

  const iconPath = document.createElementNS(SVG_NS, "path");
  iconPath.setAttribute("d", "M4 4h16v16H4z M4 17l5-5 4 4 3-3 4 4 M16 8h.01");

  imageIcon.append(iconPath);

  const placeholderText = document.createElement("span");
  placeholderText.className = "listing-card-caption-text";
  placeholderText.textContent = "No image available";

  placeholder.append(imageIcon, placeholderText);

  if (firstImage?.url) {
    const image = document.createElement("img");

    image.src = firstImage.url;
    image.alt = firstImage.alt || titleText;
    image.className = "listing-card-image";
    image.loading = "lazy";

    image.addEventListener("error", () => image.replaceWith(placeholder), {
      once: true,
    });

    card.append(image);
  } else {
    card.append(placeholder);
  }

  // Title and Tag

  const title = document.createElement("h3");

  title.className = "listing-card-title listing-card-title-text";

  title.textContent = titleText;

  card.append(title);

  const category = document.createElement("span");

  category.className = "listing-card-category listing-card-tag-text";

  category.textContent = listing.category || "Other";

  card.append(category);

  // Highest Bid

  const highestBid = getHighestBid(listing.bids ?? []);

  const bidRow = document.createElement("div");

  bidRow.className = "listing-card-bid listing-card-bid-text";

  const bidAmount = document.createElement("span");

  bidAmount.textContent =
    highestBid === null
      ? "No bids yet"
      : `${new Intl.NumberFormat("nb-NO").format(highestBid)} credits`;

  bidRow.append(createCoinIcon(), bidAmount);

  card.append(bidRow);

  const bidCaption = document.createElement("p");

  bidCaption.className = "listing-card-bid-label listing-card-caption-text";

  bidCaption.textContent =
    highestBid === null ? "Be the first to bid" : "Current highest bid";

  card.append(bidCaption);

  // Time Remaining

  const timeRow = document.createElement("p");

  timeRow.className = "listing-card-time listing-card-time-text";

  const timeText = document.createElement("span");

  timeText.textContent = getTimeRemaining(listing.endsAt);

  timeRow.append(createClockIcon(), timeText);

  card.append(timeRow);

  // View Details

  const detailsLink = document.createElement("a");

  detailsLink.href = `/listing/${encodeURIComponent(listing.id)}`;

  detailsLink.className = "listing-card-view-details listing-card-action-text";

  detailsLink.textContent = "View details";

  detailsLink.setAttribute("aria-label", `View details for ${titleText}`);

  card.append(detailsLink);

  return card;
}
