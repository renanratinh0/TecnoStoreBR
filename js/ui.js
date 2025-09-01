/**
 * Cria e retorna um elemento HTML para um card de produto.
 * @param {object} product - O objeto de produto vindo do Firebase.
 * @returns {HTMLElement} - O elemento <div> do card pronto para ser adicionado à página.
 */
function createProductCard(product) {
    const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    const imageUrl = product['URL_imagem_externa_1'] || 'https://placehold.co/500x500/111827/ffffff?text=Sem+Imagem';
    const category = product['Categoria'] || 'Sem Categoria';
    const name = product['Descricao'] || 'Produto sem nome';
    const price = parseFloat(product['Preco']) || 0;
    const description = product['Descricao_complementar'] || 'Sem descrição detalhada.';
    const sku = product['Codigo_SKU'] || '';

    // 1. O card agora é uma tag <a>, fazendo dele um link.
    const card = document.createElement('a');
    card.className = 'product-card-immersive group';
    card.href = `produto.html?sku=${encodeURIComponent(sku)}`;
    card.style.backgroundImage = `url('${imageUrl}')`;

    // Categoria
    const categoryLink = document.createElement('a');
    categoryLink.href = `produtos.html?q=${encodeURIComponent(category)}`;
    categoryLink.className = 'absolute top-4 right-4 z-10 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-blue-700 transition-colors';
    categoryLink.textContent = category;

    // 2. Adicionamos um evento de clique que impede a navegação do card principal.
    categoryLink.addEventListener('click', (event) => {
        event.stopPropagation(); // Impede que o clique "vaze" para o card <a> pai.
        window.location.href = categoryLink.href; // Navega para a categoria manualmente.
    });

    // Conteúdo do Card
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    const title = document.createElement('h4');
    title.className = 'font-bold text-lg mb-1 line-clamp-2';
    title.textContent = name;

    const priceText = document.createElement('p');
    priceText.className = 'text-xl font-black highlight-accent-text mb-2';
    priceText.textContent = formatter.format(price);

    const descriptionWrapper = document.createElement('div');
    descriptionWrapper.className = 'description';
    const descriptionText = document.createElement('p');
    descriptionText.className = 'text-sm text-gray-300 line-clamp-3';
    descriptionText.textContent = description;
    descriptionWrapper.appendChild(descriptionText);

    // Botão Comprar
    const buyButton = document.createElement('button');
    buyButton.className = 'buy-button highlight-accent font-bold py-2 px-4 rounded-lg text-md w-full text-center block transform hover:scale-105 transition-transform';
    buyButton.innerHTML = 'Comprar Agora <i class="fas fa-shopping-cart ml-1"></i>';

    // 3. O evento de clique do botão também impede a navegação do card principal.
    buyButton.addEventListener('click', (event) => {
        event.preventDefault();  // Impede a ação padrão do link pai.
        event.stopPropagation(); // Impede que o clique "vaze" para o card <a> pai.

        // Chama a função de adicionar ao carrinho que já existe.
        adicionarCarrinho(sku, name, price, imageUrl);
    });

    // Montando a estrutura
    cardContent.appendChild(title);
    cardContent.appendChild(priceText);
    cardContent.appendChild(descriptionWrapper);
    cardContent.appendChild(buyButton);

    card.appendChild(categoryLink);
    card.appendChild(cardContent);

    return card;
}
/**
 * Exibe uma notificação animada no canto da tela.
 * @param {string} title - O título principal da notificação (ex: nome do produto).
 * @param {string} message - A mensagem secundária (ex: "foi adicionado ao carrinho!").
 * @param {string} imageUrl - A URL da imagem a ser exibida na notificação.
 */
function showNotification(title, message, imageUrl) {
    const notification = document.getElementById('notification');
    const notificationImageBg = document.getElementById('notification-image-bg');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');

    if (!notification || !notificationImageBg || !notificationTitle || !notificationMessage) {
        console.error("Erro: A estrutura HTML para a notificação não foi encontrada na página.");
        return;
    }

    notificationImageBg.style.backgroundImage = `url('${imageUrl}')`;
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// ===================================================================
// INÍCIO DAS FUNÇÕES DO CARRINHO (MOVIDAS DE cart.js PARA CÁ)
// ===================================================================

/**
 * Formata um número para o padrão de moeda brasileiro (BRL).
 * @param {number} value - O valor a ser formatado.
 * @returns {string} - O valor formatado como "R$ 1.234,56".
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Pega os itens do carrinho salvos no localStorage.
 * @returns {Array} Um array de objetos de produto.
 */
function getCartItems() {
    // Usando 'shoppingCart' para consistência com o resto do código.
    const cart = localStorage.getItem('shoppingCart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Salva o array do carrinho no localStorage e dispara um evento para atualizar a UI.
 * @param {Array} cart - O array de itens do carrinho a ser salvo.
 */
function saveCartItems(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    // Dispara um evento global para que outras partes da UI (como o badge) possam ser atualizadas.
    window.dispatchEvent(new Event('cartUpdated'));
}

/**
 * Adiciona um produto ao carrinho ou atualiza sua quantidade se já existir.
 * @param {object} product - O objeto do produto a ser adicionado.
 */
function addToCart(product) {
    let cart = getCartItems();
    const existingItemIndex = cart.findIndex(item => item.sku === product.sku);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += product.quantity;
    } else {
        cart.push(product);
    }

    saveCartItems(cart);
}

/**
 * Função chamada pelos botões "Comprar Agora" nos cards de produto.
 * Cria o objeto do produto e o adiciona ao carrinho, mostrando uma notificação.
 */
function adicionarCarrinho(sku, name, price, imageUrl, quantity = 1) {
    const productToAdd = {
        sku: sku,
        name: name,
        price: price,
        image: imageUrl, // Padronizando para 'image'
        quantity: quantity
    };
    addToCart(productToAdd);
    showNotification(name, "foi adicionado ao carrinho!", imageUrl);
}

/**
 * Atualiza o número exibido no ícone do carrinho no header.
 */
function updateCartBadge() {
    const cart = getCartItems();
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// --- Event Listeners para o Carrinho ---
// Atualiza o badge sempre que o carrinho for modificado.
window.addEventListener('cartUpdated', updateCartBadge);
// Atualiza o badge quando a página carrega pela primeira vez.
document.addEventListener('DOMContentLoaded', updateCartBadge);