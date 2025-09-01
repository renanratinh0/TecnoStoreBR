
document.addEventListener('DOMContentLoaded', () => {


    const searchInput = document.getElementById('index-search-input');
    const searchButton = document.getElementById('index-search-button');



    if (!searchInput || !searchButton) {
        return;
    }

    const performSearch = () => {
        const searchTerm = searchInput.value.trim();

        if (searchTerm) {

            window.location.href = `produtos.html?q=${encodeURIComponent(searchTerm)}`;
        } else {

            window.location.href = `produtos.html`;
        }
    };



    searchButton.addEventListener('click', performSearch);


    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            performSearch();
        }
    });
});