


let productImages = [];
let currentImageIndex = 0;
let currentProductData = null;






function ADDcarrinho() {
    // 1. Depende de 'currentProductData', que só existe nesta página
    if (!currentProductData) {
        alert("Erro: Os dados do produto ainda não foram carregados.");
        return;
    }
    const productToAdd = {
        // 2. Lê informações de variáveis que só existem em produtoUnico.js
        sku: currentProductData['Codigo_SKU'],
        name: currentProductData['Descricao'],
        price: parseFloat(String(currentProductData['Preco']).replace(',', '.')) || 0,
        image: productImages[0],
        // 3. Lê o valor de um input que só existe na página produto.html
        quantity: parseInt(document.getElementById('quantity-input').value)
    };

    // Usa as "ferramentas" da caixa de ferramentas (ui.js)
    addToCart(productToAdd);
    showNotification(productToAdd.name, "foi adicionado ao carrinho!", productToAdd.image);
}

function comprarViaWhatsApp() {
    // 1. Verifica se os dados do produto já foram carregados
    if (!currentProductData) {
        alert("Erro: Os dados do produto ainda não foram carregados. Por favor, aguarde.");
        return;
    }

    // 2. Pega a quantidade selecionada pelo usuário no input
    const quantityInput = document.getElementById('quantity-input');
    const quantity = parseInt(quantityInput.value, 10);

    // 3. Reúne as informações do produto
    const name = currentProductData['Descricao'];
    const sku = currentProductData['Codigo_SKU'];
    const price = parseFloat(String(currentProductData['Preco']).replace(',', '.')) || 0;

    // Reutiliza a função que já está em ui.js para formatar o preço!
    const formattedPrice = formatCurrency(price);
    const itemTotal = formatCurrency(price * quantity);

    // 4. Monta a mensagem personalizada
    let mensagem = `Olá, TecnoShop! Tenho interesse neste produto e gostaria de um orçamento:\n\n`;
    mensagem += `*Produto:* ${name}\n`;
    mensagem += `*SKU:* ${sku}\n`;
    mensagem += `*Quantidade:* ${quantity}\n`;
    mensagem += `*Preço Unit.:* ${formattedPrice}\n`;
    mensagem += `*Subtotal:* ${itemTotal}\n\n`;
    mensagem += "Aguardo o contato para combinar o frete. Obrigado!";

    // 5. Cria o link e abre em uma nova aba
    // A variável WHATSAPP_NUMBER vem do arquivo config.js
    const linkWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(linkWhatsApp, '_blank');
}



/**
 * Preenche todos os elementos do HTML com os dados do produto carregado.
 * @param {object} productData - Os dados do produto vindos do Firebase.
 */
function updateDOM(productData) {
    const safeText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    const safeHTML = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    const nome = productData['Descricao'] || '';
    const categoria = productData['Categoria'] || '';
    const sku = productData['Codigo_SKU'] || '';
    const precoRaw = productData['Preco'] || '0';
    const preco = parseFloat(String(precoRaw).replace(',', '.')) || 0;
    const estoqueRaw = productData['Estoque'] || '';
    const estoqueNum = Number(estoqueRaw) || 0;
    const descCurta = productData['Descricao_complementar'] || '';


    const categoryLink = `produtos.html?q=${encodeURIComponent(categoria)}`;

    document.title = `${nome || 'Produto'} – TecnoStoreBR`;


    const breadcrumbCategoryEl = document.getElementById('breadcrumb-category');
    if (breadcrumbCategoryEl) {
        breadcrumbCategoryEl.textContent = categoria;
        breadcrumbCategoryEl.href = categoryLink;
    }


    const productCategoryEl = document.getElementById('product-category');
    if (productCategoryEl) {
        productCategoryEl.textContent = categoria;
        productCategoryEl.href = categoryLink;
    }

    safeText('breadcrumb-product-name', nome);
    safeText('product-title', nome);
    safeText('product-sku', `SKU: ${sku}`);

    const stockHTML = (estoqueNum > 0)
        ? `<i class="fas fa-check-circle text-lime-400 mr-1"></i>${estoqueNum}<span> Em estoque</span>`
        : `<i class="fas fa-times-circle text-red-500 mr-1"></i><span>Esgotado</span>`;
    safeHTML('product-stock-status', stockHTML);

    const formatter = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'});
    safeText('product-price', formatter.format(preco));
    safeText('product-short-description', descCurta);

    const fullDescRaw = productData['Descrição complementar'] || productData['Descrição completa'] || '';
    const fullHTML = String(fullDescRaw).split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('');
    safeHTML('product-full-description', fullHTML || `<p>${descCurta}</p>`);
}


function renderThumbnails() {
    const container = document.getElementById('product-thumbnails');
    if (!container) return;
    container.innerHTML = '';
    productImages.forEach((url, i) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = `Miniatura ${i + 1}`;
        img.className = 'product-gallery-thumb';
        img.dataset.index = i;
        img.loading = 'lazy';
        container.appendChild(img);
    });
}


function updateNavButtons() {
    const show = productImages.length > 1 ? 'flex' : 'none';
    document.getElementById('main-img-prev')?.style.setProperty('display', show, 'important');
    document.getElementById('main-img-next')?.style.setProperty('display', show, 'important');
    document.getElementById('lightbox-prev')?.style.setProperty('display', show, 'important');
    document.getElementById('lightbox-next')?.style.setProperty('display', show, 'important');
}

/**
 * Atualiza a imagem principal e a miniatura ativa.
 * @param {number} newIndex - O índice da nova imagem a ser mostrada.
 * @param {boolean} initial - Se é o carregamento inicial da página.
 */
function updateGalleryView(newIndex, initial = false) {
    currentImageIndex = newIndex;
    const mainImg = document.getElementById('main-product-image');
    if (!mainImg) return;

    const nextSrc = productImages[newIndex];
    if (!initial) {
        mainImg.style.opacity = '0';
        setTimeout(() => {
            mainImg.src = nextSrc;
            mainImg.style.opacity = '1';
        }, 180);
    } else {
        mainImg.src = nextSrc;
    }

    document.querySelectorAll('.product-gallery-thumb').forEach((t, idx) => t.classList.toggle('active', idx === newIndex));
    const active = document.querySelector(`.product-gallery-thumb[data-index="${newIndex}"]`);
    if (active) active.scrollIntoView({block: 'nearest', inline: 'center', behavior: initial ? 'auto' : 'smooth'});

    const lbImg = document.getElementById('lightbox-image');
    if (lbImg) lbImg.src = nextSrc;

    updateNavButtons();
}

/**
 * Navega para a imagem anterior ou seguinte.
 * @param {number} dir - A direção (-1 para anterior, 1 para seguinte).
 */
function navigateGallery(dir) {
    const total = productImages.length;
    if (total <= 1) return;
    let idx = (currentImageIndex + dir + total) % total;
    updateGalleryView(idx);
}

function openLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleLightboxKeys);
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleLightboxKeys);
}

function handleLightboxKeys(e) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') navigateGallery(-1);
    else if (e.key === 'ArrowRight') navigateGallery(1);
}


function setupAllEventListeners() {
    const thumbsContainer = document.getElementById('product-thumbnails');
    if (thumbsContainer) {
        thumbsContainer.addEventListener('click', e => {
            if (e.target && e.target.matches && e.target.matches('.product-gallery-thumb')) {
                updateGalleryView(+e.target.dataset.index);
            }
        });
    }
    document.getElementById('main-img-prev')?.addEventListener('click', () => navigateGallery(-1));
    document.getElementById('main-img-next')?.addEventListener('click', () => navigateGallery(1));
    document.getElementById('main-product-image')?.addEventListener('click', openLightbox);
    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
    document.getElementById('lightbox')?.addEventListener('click', e => {
        if (e.target.id === 'lightbox') closeLightbox();
    });
    document.getElementById('lightbox-prev')?.addEventListener('click', () => navigateGallery(-1));
    document.getElementById('lightbox-next')?.addEventListener('click', () => navigateGallery(1));


    document.getElementById('thumb-scroll-up')?.addEventListener('click', () => navigateGallery(-1));
    document.getElementById('thumb-scroll-down')?.addEventListener('click', () => navigateGallery(1));
}

/**
 * Atualiza o campo de quantidade (ligado aos botões + e - no HTML).
 */
window.updateQuantity = function(change) {
    const inp = document.getElementById('quantity-input');
    if (!inp) return;
    let v = parseInt(inp.value || '1', 10) + change;
    inp.value = v < 1 ? 1 : v;
};


async function loadProduct() {
    const sku = new URLSearchParams(window.location.search).get('sku');
    if (!sku) {
        document.getElementById('product-title').textContent = 'SKU do produto não fornecido.';
        return;
    }
    try {
        const url = `${FIREBASE_DB_URL.replace('.json', '')}/${sku}.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Produto não encontrado (HTTP ${res.status})`);

        const productData = await res.json();
        if (!productData) {
            document.getElementById('product-title').textContent = `Produto com SKU "${sku}" não encontrado.`;
            return;
        }

        currentProductData = productData;

        let imgs = [];
        for (let i = 1; i <= 16; i++) {
            if (productData[`URL_imagem_externa_${i}`]) {
                imgs.push(productData[`URL_imagem_externa_${i}`]);
            }
        }
        if (imgs.length === 0) imgs.push('https://placehold.co/800x800/111827/ffffff?text=Sem+Imagem');

        productImages = imgs;

        updateDOM(productData);
        renderThumbnails();
        setupAllEventListeners();
        updateGalleryView(0, true);

    } catch (err) {
        console.error("Erro ao carregar o produto:", err);
        document.getElementById('product-title').textContent = 'Erro ao carregar o produto.';
    }
}


document.addEventListener('DOMContentLoaded', loadProduct);

