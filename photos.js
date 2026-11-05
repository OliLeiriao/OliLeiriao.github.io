const photosDirectoryApi =
  "https://api.github.com/repos/OliLeiriao/OliLeiriao.github.io/contents/Art%26Img/Photos";
const gallery = document.getElementById("photo-gallery");
const lightbox = document.getElementById("photo-lightbox");
const lightboxImage = lightbox.querySelector(".photo-lightbox-image");
const imageFilePattern = /\.(avif|gif|jpe?g|png|webp)$/i;

gallery.addEventListener("click", (event) => {
  const trigger = event.target.closest(".photo-grid button");
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

function getLocation(filename) {
  return filename.replace(/\.[^.]+$/, "").replace(/\d+$/, "");
}

function titleCase(location) {
  return location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
}

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
    retry.addEventListener("click", loadPhotos);
    container.append(retry);
  }

  gallery.replaceChildren(container);
}

function renderPhotos(files) {
  const locations = new Map();

  files
    .filter((file) => file.type === "file" && imageFilePattern.test(file.name))
    .sort((first, second) => first.name.localeCompare(second.name, undefined, { numeric: true }))
    .forEach((file) => {
      const location = getLocation(file.name);
      if (!location) return;

      const key = location.toLowerCase();
      if (!locations.has(key)) {
        locations.set(key, { name: titleCase(location), files: [] });
      }
      locations.get(key).files.push(file);
    });

  const sections = [...locations.values()]
    .sort((first, second) => first.name.localeCompare(second.name))
    .map(({ name, files: locationFiles }) => {
      const section = document.createElement("section");
      section.className = "photo-location";

      const heading = document.createElement("h3");
      heading.textContent = name;
      section.append(heading);

      const grid = document.createElement("div");
      grid.className = "photo-grid";

      locationFiles.forEach((file, index) => {
        const imagePath = `Art&Img/Photos/${encodeURIComponent(file.name)}`;
        const figure = document.createElement("figure");
        const button = document.createElement("button");
        button.className = "photo-thumbnail";
        button.type = "button";
        button.dataset.image = imagePath;
        button.dataset.alt = `${name} photo ${index + 1}`;
        button.setAttribute("aria-label", `View ${name} photo ${index + 1} enlarged`);

        const image = document.createElement("img");
        image.src = imagePath;
        image.alt = "";
        image.loading = "lazy";
        button.append(image);
        figure.append(button);
        grid.append(figure);
      });

      section.append(grid);
      return section;
    });

  if (sections.length === 0) {
    showMessage("No photos were found in the Photos folder.");
    return;
  }

  gallery.replaceChildren(...sections);
}

async function loadPhotos() {
  showMessage("Loading photos...");

  try {
    const response = await fetch(photosDirectoryApi, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const files = await response.json();
    if (!Array.isArray(files)) {
      throw new Error("GitHub returned an unexpected directory listing");
    }

    renderPhotos(files);
  } catch (error) {
    console.error("Unable to load the photo gallery:", error);
    showMessage("Photos could not be loaded. Please try again later.", true);
  }
}

loadPhotos();
