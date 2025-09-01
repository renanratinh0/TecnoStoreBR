

const PRODUCTS_PER_PAGE = 50;

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;

document.addEventListener('DOMContentLoaded', initializeProductsPage);

function normalizeText(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

async function applyFilters() {

    const term = document.getElementById('index-search-input').value.trim();
    const normalizedTerm = normalizeText(term);
    const onlyAvailable = document.getElementById('filter-stock')?.checked || false;
    const selectedCategory = document.getElementById('filter-category')?.value || '';


    filteredProducts = allProducts.filter(p => {
        const matchesCategoryFilter = !selectedCategory || p['Categoria'] === selectedCategory;
        const hasStock = !onlyAvailable || (p['Stock'] === "Sob Consulta" || (p['Stock'] && Number(p['Stock']) > 0));
        const matchesSearch = !normalizedTerm ||
            normalizeText(p['Descricao']).includes(normalizedTerm) ||
            normalizeText(p['Categoria']).includes(normalizedTerm) ||
            normalizeText(p['Descricao_complementar']).includes(normalizedTerm) ||
            normalizeText(p['Codigo_SKU']).includes(normalizedTerm);
        return matchesCategoryFilter && hasStock && matchesSearch;
    });

    renderPage(1);
}

async function initializeProductsPage() {
    const loadingPlaceholder = document.getElementById('loading-placeholder');
    try {
        const response = await fetch(FIREBASE_DB_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        allProducts = data ? Object.values(data) : [];
        filteredProducts = [...allProducts];

        renderPage(1);
        setupEventListeners();


        const urlParams = new URLSearchParams(window.location.search);
        const queryFromUrl = urlParams.get('q');
        if (queryFromUrl) {
            document.getElementById('index-search-input').value = queryFromUrl;
            applyFilters();
        }

    } catch (err) {
        console.error('Falha ao inicializar a página de produtos:', err);
        displayErrorMessage();
    } finally {
        if (loadingPlaceholder) loadingPlaceholder.remove();
    }
    const urlParams = new URLSearchParams(window.location.search);
    const queryFromUrl = urlParams.get('q');

    if (queryFromUrl) {
        const searchInput = document.getElementById('index-search-input');
        const categorySelect = document.getElementById('filter-category');


        searchInput.value = queryFromUrl;



        const normalizedQuery = normalizeText(queryFromUrl);



        const matchedOption = Array.from(categorySelect.options).find(option => {

            return normalizeText(option.text) === normalizedQuery;
        });


        if (matchedOption) {

            categorySelect.value = matchedOption.value;
            console.log(`Categoria "${matchedOption.value}" selecionada via busca.`);
        }


        applyFilters();
    }
}

function setupEventListeners() {
    const stockCheckbox = document.getElementById('filter-stock');
    const categorySelect = document.getElementById('filter-category');


    if (stockCheckbox) stockCheckbox.addEventListener('change', applyFilters);
    if (categorySelect) categorySelect.addEventListener('change', applyFilters);
}

function renderPage(page) {
    currentPage = page;
    displayProducts(page);
    renderPagination();
}

function displayProducts(page) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-16">Nenhum produto encontrado.</p>`;
        document.getElementById('pagination-controls').innerHTML = '';
        return;
    }

    const start = (page - 1) * PRODUCTS_PER_PAGE;
    const productsToShow = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
    const fragment = document.createDocumentFragment();

    productsToShow.forEach(p => {


        const cardElement = createProductCard(p);
        fragment.appendChild(cardElement);
    });

    grid.appendChild(fragment);
}

function renderPagination() {
    const ctr = document.getElementById('pagination-controls');
    ctr.innerHTML = '';
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    if (totalPages <= 1) return;



    const makeBtn = (label, page, disabled, active, icon = false) => {
        const btn = document.createElement('button');
        btn.disabled = disabled;
        btn.className = 'pagination-btn' + (active ? ' active' : '');
        btn.innerHTML = icon ? `<i class="fas ${label}"></i>` : label;
        btn.addEventListener('click', () => !disabled && renderPage(page));
        return btn;
    };

    ctr.appendChild(makeBtn('fa-angle-double-left', 1, currentPage === 1, false, true));
    ctr.appendChild(makeBtn('fa-angle-left', currentPage - 1, currentPage === 1, false, true));

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
        ctr.appendChild(makeBtn(i, i, false, i === currentPage));
    }

    ctr.appendChild(makeBtn('fa-angle-right', currentPage + 1, currentPage === totalPages, false, true));
    ctr.appendChild(makeBtn('fa-angle-double-right', totalPages, currentPage === totalPages, false, true));
}

function displayErrorMessage() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = `<div class="col-span-full text-center text-red-400 py-16">
        <i class="fas fa-exclamation-triangle fa-3x mb-4"></i>
        <p class="text-lg font-semibold">Falha ao carregar os produtos.</p>
    </div>`;
}