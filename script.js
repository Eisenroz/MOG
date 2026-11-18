
const artworks = [
    {
        title: "Kikker",
        id: "200293120",
        memeImage: "images/pepe.jpg",
        resemblance: "Pepe the Frog",
        description: "Kikker translates to frog. This painting reminds me of Pepe the Frog. In a literal sense, this artwork is a sitting green frog much like Pepe."
    },
    {
        title: "Portrait of Pieter Willemsz Verhoeff",
        memeImage: "images/pepe.jpg",
        resemblance: "Pepe the Frog",
        description: "Doesn't he look like a human version of Pepe the Frog? was my first thought when I saw this painting. The eyes, the pose, even the lips, he screams Pepe."
    },
    {
        title: "Vijf lezende joodse mannen",
        id: "200657318",
        memeImage: "images/bookopen.webp",
        resemblance: "Golden Jimmy Butler Holding Up a Paper",
        description: "This one I thought was similar to the Golden Jimmy Butler holding up a paper meme. In the context of the meme, its used to to signify that something is peak. And in this artwork, God knows what the man in the middle is reading, but one thing for sure, he is telling all the people around him that its peak."
    },
    {
        title: "The Merry Drinker",
        memeImage: "images/leo2.webp",
        resemblance: "Leonardo Dicaprio Raising a Toast in The Great Gatsby",
        description: "When I was scrolling through the Rijksmuseum I came across this painting I thought it looked like that one meme of Leonardo Di Caprio in The Great Gatsby raising a toast. The pose, the smile, the drink, and the expression is very similiar."
    },
    {
        title: "The Merry Fiddler",
        memeImage: "images/leo1.jpg",
        resemblance: "Leonardo Dicaprio Holding a Drink in Django Unchained",
        description: "The figure's pose, expression, and even his face bears a uncanny and funny resemblance to the character that Leonardo Di Caprio plays in Django Unchained as well as the meme."
    },
    {
        title: "Self-portrait",
        id: "200107941",
        memeImage: "images/mr I.jpeg",
        resemblance: "Mr. Incredible",
        description: "When I was looking through memes that I could use as a reference, I came across the Mr. Incredible meme, the one where he has the gradually mortified expression. And when I saw this painting I thought that it looked like one of the expressions of Mr. Incredible in the meme. The composition, expression, and the lighting."
    },
    {
        title: "Portrait of Gerard Andriesz Bicker",
        memeImage: "images/dissapointed.jpg",
        resemblance: "Disappointed Fan",
        description: "The figure's expression and posture resemble the disappointed reaction of that one dissapointed fan meme."
    },
    {
        title: "The bodhisattva Lokeshvara",
        id: "20023619",
        memeImage: "images/holdlaugh.jpg",
        resemblance: "Speed Holding in His Laugh",
        description: "The figure's expression and angle reminded me of that one meme of popular streamer IshowSpeed holding in his laugh."
    },
    {
        title: "Self-portrait as the Apostle Paul",
        memeImage: "images/usure.jpeg",
        resemblance: "Are You Sure About That?",
        description: "The figure's questioning expression resembles that skeptic meme, which is often used to express doubt or disbelief. I also thought his expression just communicates that are you sure about that? vibe."
    },
    {
        title: "Girl in a White Kimono",
        memeImage: "images/sleepless.jpg",
        resemblance: "Up at Night, Sleeping Beauty",
        description: "I thought her face looked like she was up at night, unable to sleep, and the meme of Sleeping Beauty came to mind."
    },
    {
        title: "Tronende Christus met twee mannen",
        id: "200377526",
        memeImage: "images/absolutecinema.webp",
        resemblance: "Absolute Cinema",
        description: "In the meme, director Martin Scorsese raises his hands in praise of a movie he has just watched. As an established film director, his opinion carries significant weight. In this artwork, a religious figure is depicted raising both hands, but rather than celebrating a film, the gesture carries religious significance."
    },
    {
        title: "Laughing Young Man",
        memeImage: "images/troll.webp",
        resemblance: "Troll Face",
        description: "The figure's exaggerated smile and mischievous expression resemble the recognizable Troll Face meme."
    }
];


async function getArtwork(item) {
    let artworkID = item.id;

    if (!artworkID) {
        const searchURL =
            `https://data.rijksmuseum.nl/search/collection?type=painting&imageAvailable=true&title=${encodeURIComponent(item.title)}`;

        const searchResponse = await fetch(searchURL);

        if (!searchResponse.ok) {
            throw new Error(`Search failed for ${item.title}`);
        }

        const searchData = await searchResponse.json();

        if (!searchData.orderedItems || searchData.orderedItems.length === 0) {
            throw new Error(`No result found for ${item.title}`);
        }

        artworkID = searchData.orderedItems[0].id.split("/").pop();
    }

    const response = await fetch(
        `https://id.rijksmuseum.nl/${artworkID}?_profile=la-framed`
    );

    if (!response.ok) {
        throw new Error(`Could not retrieve ${item.title}`);
    }

    return await response.json();
}


async function getArtworkImage(artwork) {
    const directImage =
        artwork.subject_of?.[0]?.digitally_carried_by?.[0]?.access_point?.[0]?.id;

    if (directImage) {
        return directImage;
    }

    const visualItemID = artwork.shows?.[0]?.id;

    if (!visualItemID) {
        return null;
    }

    const visualResponse = await fetch(
        `${visualItemID}?_profile=la-framed`
    );

    if (!visualResponse.ok) {
        return null;
    }

    const visualData = await visualResponse.json();

    const digitalObjectID = visualData.digitally_shown_by?.[0]?.id;

    if (!digitalObjectID) {
        return null;
    }

    const digitalResponse = await fetch(
        `${digitalObjectID}?_profile=la-framed`
    );

    if (!digitalResponse.ok) {
        return null;
    }

    const digitalData = await digitalResponse.json();

    return digitalData.access_point?.[0]?.id || null;
}


function getArtistName(artwork) {
    const production = artwork.produced_by;

    if (!production) {
        return "Anonymous";
    }

    const descriptions = production.referred_to_by || [];

    const englishDescription = descriptions.find(description =>
        description.language?.some(language =>
            language.id === "http://vocab.getty.edu/aat/300388277"
        )
    );

    let artistName = englishDescription?.content;

    if (!artistName && descriptions.length > 0) {
        artistName = descriptions[0].content;
    }

    if (!artistName) {
        for (const part of production.part || []) {
            const artist = part.carried_out_by?.[0];

            if (artist?.notation) {
                const englishName = artist.notation.find(
                    name => name["@language"] === "en"
                );

                if (englishName) {
                    artistName = englishName["@value"];
                    break;
                }

                artistName = artist.notation[0]["@value"];
                break;
            }
        }
    }

    if (!artistName) {
        return "Anonymous";
    }

    artistName = artistName
        .replace(/^painter:\s*/i, "")
        .replace(/^printmaker:\s*/i, "")
        .replace(/\s*\(signed by artist\)/i, "")
        .replace(/\s*\(mentioned on object\)/i, "")
        .trim();

    if (/^anonymous$/i.test(artistName)) {
        return "Anonymous";
    }

    if (/^anonymous,\s*cambodja$/i.test(artistName)) {
        return "Anonymous, Cambodia";
    }

    return artistName;
}


async function getGallery() {
    const results = document.getElementById("results");

    results.innerHTML = "<p>Loading artworks...</p>";

    const galleryGrid = document.createElement("div");
    galleryGrid.className = "gallery-grid";

    for (const item of artworks) {
        try {
            const artwork = await getArtwork(item);
            const imageURL = await getArtworkImage(artwork);

            if (!imageURL) {
                console.warn(`No image found for ${item.title}`);
                continue;
            }

            const card = document.createElement("div");
            card.className = "artwork-card";

            const imageBox = document.createElement("div");
            imageBox.className = "card-image";

            const image = document.createElement("img");
            image.src = imageURL;
            image.alt = item.title;

            const heading = document.createElement("h3");
            heading.textContent = item.title;

            imageBox.appendChild(image);
            card.appendChild(imageBox);
            card.appendChild(heading);

            card.addEventListener("click", () => {
                showArtworkDetails(artwork, imageURL, item);
            });

            galleryGrid.appendChild(card);

        } catch (error) {
            console.error(`Error loading ${item.title}:`, error);
        }
    }

    if (galleryGrid.children.length === 0) {
        results.innerHTML =
            "<p>No artworks could be loaded. Check the console for errors.</p>";
        return;
    }

    results.replaceChildren(galleryGrid);
}


function showArtworkDetails(artwork, imageURL, item) {
    const details = document.getElementById("artworkDetails");

    details.innerHTML = "";

    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", closeArtworkDetails);

    const content = document.createElement("div");
    content.className = "detail-content";

    const imageContainer = document.createElement("div");
    imageContainer.className = "detail-image-container";

    const viewport = document.createElement("div");
    viewport.className = "image-viewport";

    const originalImage = document.createElement("img");
    originalImage.className = "original-detail-image";
    originalImage.src = imageURL;
    originalImage.alt = item.title;

    const memeImage = document.createElement("img");
    memeImage.className = "meme-detail-image";
    memeImage.src = item.memeImage;
    memeImage.alt = `Meme comparison for ${item.title}`;

    viewport.appendChild(originalImage);
    viewport.appendChild(memeImage);
    imageContainer.appendChild(viewport);

    const heading = document.createElement("h2");
    heading.textContent = item.title;

    const artist = document.createElement("p");
    artist.textContent = `Artist: ${getArtistName(artwork)}`;

    const descriptionBox = document.createElement("div");
    descriptionBox.className = "meme-description";

    const resemblance = document.createElement("h3");
    resemblance.textContent = `Resemblance: ${item.resemblance}`;

    const description = document.createElement("p");
    description.textContent = item.description;

    descriptionBox.appendChild(resemblance);
    descriptionBox.appendChild(description);

    content.appendChild(imageContainer);
    content.appendChild(heading);
    content.appendChild(artist);
    content.appendChild(descriptionBox);

    details.appendChild(closeButton);
    details.appendChild(content);

    details.style.display = "block";

    function matchImageSizes() {
        if (!originalImage.naturalWidth) {
            return;
        }

        const viewportWidth = viewport.clientWidth;
        const viewportHeight = viewport.clientHeight;

        const imageRatio =
            originalImage.naturalWidth / originalImage.naturalHeight;

        const viewportRatio = viewportWidth / viewportHeight;

        let width;
        let height;

        if (imageRatio > viewportRatio) {
            width = viewportWidth;
            height = viewportWidth / imageRatio;
        } else {
            height = viewportHeight;
            width = viewportHeight * imageRatio;
        }

        originalImage.style.width = `${width}px`;
        originalImage.style.height = `${height}px`;

        memeImage.style.width = `${width}px`;
        memeImage.style.height = `${height}px`;
    }

    if (originalImage.complete) {
        matchImageSizes();
    } else {
        originalImage.addEventListener("load", matchImageSizes, { once: true });
    }

    details.scrollIntoView({ behavior: "smooth" });
}


function closeArtworkDetails() {
    document.getElementById("artworkDetails").style.display = "none";
}


document.addEventListener("DOMContentLoaded", getGallery);
