document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-form__field");
    const catalogItems = document.querySelectorAll(".become__list .catalog__item");
    const suggestionsContainer = searchInput.closest("form").querySelector(".search-suggestions");

    if (!searchInput || !suggestionsContainer || catalogItems.length === 0) {
        return;
    }

    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase().trim();
        suggestionsContainer.innerHTML = "";

        if (searchText === "") {
            suggestionsContainer.style.display = "none";
            return;
        }

        let matchedItems = [];

        catalogItems.forEach(item => {
            const itemText = item.querySelector(".catalog__text").textContent.trim().toLowerCase();
            const itemImage = item.querySelector("img").src; // Получаем изображение товара
            if (itemText.includes(searchText)) {
                matchedItems.push({ text: itemText, link: item.href, image: itemImage });
            }
        });

        if (matchedItems.length > 0) {
            matchedItems.forEach(item => {
                const suggestionItem = document.createElement("div");
                suggestionItem.classList.add("suggestion-item");
                
                const imgElement = document.createElement("img");
                imgElement.src = item.image;
                imgElement.alt = item.text;
                imgElement.classList.add("suggestion-image");
                
                const textElement = document.createElement("span");
                textElement.textContent = item.text;
                
                suggestionItem.appendChild(imgElement);
                suggestionItem.appendChild(textElement);
                
                suggestionItem.addEventListener("click", (e) => {
                    e.preventDefault();
                    searchInput.value = item.text;
                    suggestionsContainer.innerHTML = "";
                    suggestionsContainer.style.display = "none";
                    if (item.link) {
                        window.location.href = item.link;
                    }
                });

                suggestionsContainer.appendChild(suggestionItem);
            });
            suggestionsContainer.style.display = "block";
        } else {
            suggestionsContainer.style.display = "none";
        }
    });

    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = "none";
        }
    });
});