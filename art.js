const artDirectoryApi =
  "https://api.github.com/repos/OliLeiriao/OliLeiriao.github.io/contents/Art%26Img/Art";
const gallery = document.getElementById("art-gallery");
const lightbox = document.getElementById("art-lightbox");
const lightboxImage = lightbox.querySelector(".photo-lightbox-image");
const imageFilePattern = /\.(avif|gif|jpe?g|png|webp)$/i;

const artworkDetails = [
  { file: "Japan_OL(2024).jpg", caption: 'Japan (2024), 36"x24", Acrylic on Canvas.' },
  { file: "Love_OL(2023).jpg", caption: 'Love (2023), 13.5"x16.5", Acrylic on Mixed Media Paper.' },
  { file: "HeadHunters_OL(2024).jpg", caption: 'Head Hunters (2024), 13.5"x16.5", Acrylic on Mixed Media Paper.' },
  { file: "Nostalgia_OL(2024).jpg", caption: 'Nostalgia (2024), 40"x30", Acrylic on Canvas.' },
  { file: "Labradorite_OL(2024).jpg", caption: 'Labradorite (2024), 30"x20", Acrylic on Canvas.' },
  { file: "GaspardDeLaNuit_OL(2024).jpg", caption: 'Gaspard de la Nuit (2024), 18"x24", Acrylic on Canvas.' },
  { file: "Amazonite_OL(2024).jpg", caption: 'Amazonite (2024), 18"x24", Acrylic on Canvas.' },
  { file: "GreenOnyx_OL(2024).jpg", caption: 'Green Onyx (2023), 24"x18", Acrylic on Canvas.' },
  { file: "RomeoAndJuliet_OL(2024).jpg", caption: 'Romeo & Juliet (2024), 13.5"x16.5", Acrylic on Mixed Media Paper.' },
  { file: "Tiles_OL(2024).jpg", caption: 'Tiles (2024), 18"x24", Acrylic on Canvas.' },
];

gallery.addEventListener("click", (event) => {
  const trigger = event.target.closest(".artwork-thumbnail");
  if (!trigger) return;

  lightboxImage.src = trigger.dataset.image;
  lightboxImage.alt = trigger.dataset.alt;
  lightbox.showModal();
});

lightbox.querySelector(".photo-lightbox-close").addEventListener("click", () => {
  lightbox.close();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

function showMessage(message, canRetry = false) {
  const container = document.createElement("div");
  container.className = "photo-gallery-message";

  const text = document.createElement("p");
  text.textContent = message;
  container.append(text);

  if (canRetry) {
    const retry = document.createElement("button");
    retry.className = "photo-gallery-retry";
    retry.type = "button";
    retry.textContent = "Try again";
    retry.addEventListener("click", loadArtwork);
    container.append(retry);
  }

  gallery.replaceChildren(container);
}

function renderArtwork(files) {
  const availableFiles = new Set(
    files.filter((file) => file.type === "file" && imageFilePattern.test(file.name))
      .map((file) => file.name),
  );
  const figures = artworkDetails
    .filter(({ file }) => availableFiles.has(file))
    .map(({ file, caption }) => {
      const imagePath = `Art&Img/Art/${encodeURIComponent(file)}`;
      const figure = document.createElement("figure");
      figure.className = "artwork-figure";

      const button = document.createElement("button");
      button.className = "artwork-thumbnail";
      button.type = "button";
      button.dataset.image = imagePath;
      button.dataset.alt = caption;
      button.setAttribute("aria-label", `View ${caption} enlarged`);

      const image = document.createElement("img");
      image.src = imagePath;
      image.alt = "";
      image.loading = "lazy";
      button.append(image);

      const figcaption = document.createElement("figcaption");
      figcaption.textContent = caption;
      figure.append(button, figcaption);
      return figure;
    });

  if (figures.length === 0) {
    showMessage("No artwork was found in the Art folder.");
    return;
  }

  const grid = document.createElement("div");
  grid.className = "artwork-grid";
  grid.append(...figures);
  gallery.replaceChildren(grid);
}

async function loadArtwork() {
  showMessage("Loading artwork...");

  try {
    const response = await fetch(artDirectoryApi, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const files = await response.json();
    if (!Array.isArray(files)) {
      throw new Error("GitHub returned an unexpected directory listing");
    }

    renderArtwork(files);
  } catch (error) {
    console.error("Unable to load the art gallery:", error);
    showMessage("Artwork could not be loaded. Please try again later.", true);
  }
}

loadArtwork();
