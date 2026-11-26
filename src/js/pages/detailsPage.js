export function createDetailsPage(id) {
  const container = document.createElement("div");
  container.className = "page-container";

  const heading = document.createElement("h1");
  heading.textContent = "Auction Details";

  const message = document.createElement("p");
  message.textContent = `Listing ID: ${id}`;

  container.append(heading, message);

  return container;
}
