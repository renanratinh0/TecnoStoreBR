async function loadFeaturedProducts() {
    // Defina aqui a lista de SKUs que você quer exibir na sua vitrine.
    const featuredSkus = [
        "0000100-13",
        "0003184-1",
        "0021026-2",
        "0029049"
    ];

    const productGrid = document.getElementById('product-grid');
    const baseUrl = 'https://estoque-c4f41-default-rtdb.firebaseio.com/products';

    try {
        // 1. Criar um array de promessas de 'fetch', uma para cada SKU.
        const fetchPromises = featuredSkus.map(sku => {
            const productUrl = `${baseUrl}/${sku}.json`;
            return fetch(productUrl);
        });

        // 2. Executar todas as requisições em paralelo.
        const responses = await Promise.all(fetchPromises);

        // 3. Verificar as respostas e extrair o JSON.
        const productsData = await Promise.all(responses.map(res => res.ok ? res.json() : null));

        // 4. Filtrar quaisquer resultados nulos.
        const selectedProducts = productsData.filter(product => product !== null);

        productGrid.innerHTML = '';

        if (selectedProducts.length === 0) {
            productGrid.innerHTML = '<p class="col-span-full text-center text-gray-400">Nenhum produto em destaque encontrado.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        selectedProducts.forEach(product => {
            const cardElement = createProductCard(product);
            fragment.appendChild(cardElement);
        });

        productGrid.appendChild(fragment);

    } catch (error) {
        console.error("Erro ao carregar produtos em destaque:", error);
        productGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Falha ao carregar os produtos.</p>';
    }
}

// Esta linha está correta e chama a função quando a página carrega.
document.addEventListener('DOMContentLoaded', loadFeaturedProducts);