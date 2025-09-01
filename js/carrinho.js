


document.addEventListener('DOMContentLoaded', () => {
    renderCartPage();
});


function renderCartPage() {
    const cart = getCartItems();
    const container = document.getElementById('cart-items-container');
    const checkoutButton = document.getElementById('whatsapp-checkout-button');
    container.innerHTML = '';

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="text-center py-16">
                <i class="fas fa-shopping-cart fa-4x text-gray-600 mb-4"></i>
                <h2 class="text-2xl font-bold text-white">O seu carrinho está vazio</h2>
                <p class="text-gray-400 mt-2">Adicione produtos para os ver aqui.</p>
                <a href="produtos.html" class="highlight-accent font-bold py-3 px-6 rounded-lg inline-block mt-6">Ver Produtos</a>
            </div>
        `;
        updateSummary(0);
        if (checkoutButton) checkoutButton.disabled = true;
        return;
    }

    if (checkoutButton) checkoutButton.disabled = false;
    let subtotal = 0;


    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700/50';

        const imageUrl = item.image || 'https://placehold.co/100x100/1f2937/a3e635?text=Produto';
        itemElement.innerHTML = `
            <div class="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-contain bg-center bg-no-repeat rounded-md" style="background-image: url('${imageUrl}')"></div>
            <div class="flex-1 text-center sm:text-left">
                <h3 class="font-bold text-lg text-white">${item.name}</h3>
                <p class="text-sm text-gray-400">SKU: ${item.sku}</p>
                <p class="text-lg font-bold highlight-accent-text mt-1">${formatCurrency(item.price)}</p>
            </div>
            <div class="flex items-center border border-gray-600 rounded-lg">
                <button onclick="updateCartItemQuantity('${item.sku}', -1)" class="px-3 py-2 text-lg text-gray-300 hover:bg-gray-700 rounded-l-md">-</button>
                <input type="number" value="${item.quantity}" class="w-12 text-center bg-gray-800 border-x border-gray-600 text-white font-bold focus:outline-none" readonly>
                <button onclick="updateCartItemQuantity('${item.sku}', 1)" class="px-3 py-2 text-lg text-gray-300 hover:bg-gray-700 rounded-r-md">+</button>
            </div>
            <button onclick="removeCartItem('${item.sku}')" class="p-3 text-gray-400 hover:text-red-500 transition-colors">
                <i class="fas fa-trash-alt fa-lg"></i>
            </button>
        `;
        container.appendChild(itemElement);
        subtotal += item.price * item.quantity;
    });

    updateSummary(subtotal);
}

/**
 * Atualiza a quantidade de um item específico no carrinho.
 * @param {string} sku - O SKU do item a ser atualizado.
 * @param {number} change - A mudança na quantidade (-1 ou 1).
 */
window.updateCartItemQuantity = (sku, change) => {
    let cart = getCartItems();
    const itemIndex = cart.findIndex(item => item.sku === sku);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    saveCartItems(cart);
    renderCartPage();
};

/**
 * Remove um item do carrinho.
 * @param {string} sku - O SKU do item a ser removido.
 */
window.removeCartItem = (sku) => {
    let cart = getCartItems();
    const updatedCart = cart.filter(item => item.sku !== sku);
    saveCartItems(updatedCart);
    renderCartPage();
};

/**
 * Atualiza o resumo do pedido (subtotal e total).
 * @param {number} subtotal - O valor do subtotal dos itens.
 */
function updateSummary(subtotal) {
    const total = subtotal;
    document.getElementById('summary-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('summary-total').textContent = formatCurrency(total);
}


window.solicitarOrcamentoWhatsApp = () => {
    const cart = getCartItems();
    const paymentSelect = document.getElementById('payment-method-select');
    const selectedPaymentMethod = paymentSelect.value;

    if (cart.length === 0) return;

    if (!selectedPaymentMethod) {
        paymentSelect.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => {
            paymentSelect.classList.remove('ring-2', 'ring-red-500');
        }, 3000);
        return;
    }

    let total = 0;
    let mensagem = "Olá, TecnoShop! Gostaria de solicitar um orçamento para os seguintes itens do meu carrinho:\n\n";

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        mensagem += `*Produto:* ${item.name}\n`;
        mensagem += `*SKU:* ${item.sku}\n`;
        mensagem += `*Quantidade:* ${item.quantity}\n`;
        mensagem += `*Preço Unit.:* ${formatCurrency(item.price)}\n`;
        mensagem += `------------------------\n`;
    });

    mensagem += `\n*Subtotal do Pedido:* ${formatCurrency(total)}\n`;
    mensagem += `*Forma de Pagamento Preferida:* ${selectedPaymentMethod}\n\n`;
    mensagem += "Aguardo o contato para combinar o frete. Obrigado!";


    const linkWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(linkWhatsApp, '_blank');
};
