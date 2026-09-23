// 1. CARROSSEL DE PRODUTOS
document.querySelectorAll('.product-card[data-images]').forEach(card => {
    const images = JSON.parse(card.getAttribute('data-images'));
    const imgElement = card.querySelector('.product-img');
    const prevBtn = card.querySelector('.prev-btn');
    const nextBtn = card.querySelector('.next-btn');
    let currentIndex = 0;
    if (images && images.length > 1) {
        const updateImage = (i) => { imgElement.src = images[i]; };
        nextBtn.addEventListener('click', () => { currentIndex = (currentIndex + 1) % images.length; updateImage(currentIndex); });
        prevBtn.addEventListener('click', () => { currentIndex = (currentIndex - 1 + images.length) % images.length; updateImage(currentIndex); });
    }
});

// 2. LÓGICA DO CARRINHO E MODAIS
let cart = [];
let subtotal = 0;
let valorFrete = 0;
let pendingProduct = null;

const cartCount = document.getElementById('cart-count');
const cartContainer = document.getElementById('cart-items-container');
const cartTotalDisplay = document.getElementById('cart-total-display');
const checkoutTotalDisplay = document.getElementById('checkout-total');

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', function() {
        const prod = {
            id: this.dataset.id, name: this.dataset.name,
            price: parseFloat(this.dataset.price), img: this.dataset.img, type: this.dataset.type
        };

        if(prod.type === 'roupa') {
            pendingProduct = prod;
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            document.getElementById('confirm-size-btn').disabled = true;
            openModal('modal-size');
        } else {
            addToCart(prod);
            showToast();
        }
    });
});

let selectedSize = null;
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        selectedSize = this.innerText;
        document.getElementById('confirm-size-btn').disabled = false;
    });
});

document.getElementById('confirm-size-btn').addEventListener('click', () => {
    if(pendingProduct && selectedSize) {
        pendingProduct.name = `${pendingProduct.name} (Tam: ${selectedSize})`;
        addToCart(pendingProduct);
        closeModal('modal-size');
        showToast();
        pendingProduct = null;
        selectedSize = null;
    }
});

function addToCart(product) {
    cart.push(product);
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    cartCount.innerText = cart.length;
    cartContainer.innerHTML = '';
    subtotal = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; color:gray;">Seu carrinho está vazio.</p>';
    } else {
        cart.forEach((item, index) => {
            subtotal += item.price;
            cartContainer.innerHTML += `
                <div class="cart-item">
                    <div style="display:flex; align-items:center;">
                        <img src="${item.img}" alt="${item.name}">
                        <div>
                            <h4 style="font-size:0.9rem;">${item.name}</h4>
                            <p style="color:var(--text-gold); font-size:0.9rem;">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${index})">&times;</button>
                </div>
            `;
        });
    }
    cartTotalDisplay.innerText = `Total: R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    
    // Atualiza as parcelas sempre que um item for adicionado/removido do carrinho
    if(document.getElementById('pagamento-metodo').value === 'credito') {
        gerarParcelas();
    }
}

// 3. FLUXO DE CHECKOUT E MÁSCARAS
document.getElementById('btn-open-cart').addEventListener('click', () => openModal('modal-cart'));

document.getElementById('btn-checkout').addEventListener('click', () => {
    if(cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    closeModal('modal-cart');
    updateCheckoutTotal();
    openModal('modal-checkout');
});

// Máscaras e API de CEP
const cepInput = document.getElementById('cep-input');
cepInput.addEventListener('input', async function(e) {
    // Formata o CEP: 00000-000
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
    e.target.value = v;

    // Quando bater 9 caracteres (completo), busca o endereço automaticamente
    if (v.length === 9) {
        const cepLimpo = v.replace('-', '');
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('rua-input').value = data.logradouro;
                document.getElementById('bairro-input').value = data.bairro;
                document.getElementById('cidade-input').value = `${data.localidade} / ${data.uf}`;
                document.getElementById('num-input').focus(); // Joga o cursor pro número
                
                // Simula frete e atualiza valores
                valorFrete = 15.90;
                document.getElementById('frete-display').innerText = `Frete Transportadora: R$ 15,90`;
                if(document.getElementById('pagamento-metodo').value === 'credito') gerarParcelas();
                updateCheckoutTotal();
            } else {
                alert("CEP não encontrado. Verifique e tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    }
});

// Máscaras do Cartão
const numCartaoInput = document.getElementById('cartao-numero');
numCartaoInput.addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');    // Adiciona espaço a cada 4 dígitos
    e.target.value = v;
});

const validadeCartaoInput = document.getElementById('cartao-validade');
validadeCartaoInput.addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, ''); 
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4); // MM/AA
    e.target.value = v;
});

const cvvInput = document.getElementById('cartao-cvv');
cvvInput.addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, ''); 
});

// --- Lógica de Pagamento ---
const selectMetodo = document.getElementById('pagamento-metodo');
const containerCartao = document.getElementById('dados-cartao');
const containerParcela = document.getElementById('parcelamento-container');
const selectParcela = document.getElementById('parcelamento-select');

selectMetodo.addEventListener('change', function() {
    const val = this.value;
    if (val === 'pix') {
        containerCartao.classList.add('hidden');
        containerParcela.classList.add('hidden');
        document.querySelectorAll('#dados-cartao input').forEach(inp => inp.required = false);
    } else {
        containerCartao.classList.remove('hidden');
        document.querySelectorAll('#dados-cartao input').forEach(inp => inp.required = true);
        
        if (val === 'credito') {
            containerParcela.classList.remove('hidden');
            gerarParcelas();
        } else {
            containerParcela.classList.add('hidden');
        }
    }
    updateCheckoutTotal();
});

function gerarParcelas() {
    let baseTotal = subtotal + valorFrete;
    selectParcela.innerHTML = '';
    const taxas = [1.00, 1.03, 1.045, 1.06, 1.075];

    for (let i = 1; i <= 5; i++) {
        let jurosMult = taxas[i-1];
        let valorComJuros = baseTotal * jurosMult;
        let valorParcela = valorComJuros / i;
        
        let textoJuros = i === 1 ? "sem juros" : "com juros";
        selectParcela.innerHTML += `<option value="${i}" data-juros="${jurosMult}">${i}x de R$ ${valorParcela.toFixed(2).replace('.', ',')} (${textoJuros})</option>`;
    }
}

// Quando a parcela muda, apenas recálcula o total, sem recriar as opções
selectParcela.addEventListener('change', updateCheckoutTotal);

function updateCheckoutTotal() {
    let totalGeral = subtotal + valorFrete;
    
    // Se for crédito e existirem parcelas criadas
    if (selectMetodo.value === 'credito' && selectParcela.options.length > 0) {
        const juros = parseFloat(selectParcela.options[selectParcela.selectedIndex].dataset.juros);
        totalGeral = totalGeral * juros;
    }

    checkoutTotalDisplay.innerText = `Total a pagar: R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}

// --- Validação Final ---
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Validação extra caso o método seja cartão (débito ou crédito)
    if (selectMetodo.value !== 'pix') {
        const numero = numCartaoInput.value;
        const validade = validadeCartaoInput.value;
        const cvv = cvvInput.value;

        // 16 dígitos + 3 espaços = 19 caracteres
        if (numero.length < 19) {
            alert("Por favor, preencha o número do cartão corretamente (16 dígitos).");
            return;
        }

        // Validação da Data
        if (validade.length < 5) {
            alert("A validade deve estar no formato MM/AA.");
            return;
        }

        const mes = parseInt(validade.split('/')[0]);
        const ano = parseInt(validade.split('/')[1]);
        const anoAtual = parseInt(String(new Date().getFullYear()).slice(-2)); // Ex: 2026 -> 26

        if (mes < 1 || mes > 12) {
            alert("Mês de validade inválido. Use um valor de 01 a 12.");
            return;
        }

        if (ano < anoAtual) {
            alert("O cartão informado já está vencido!");
            return;
        }

        if (cvv.length < 3) {
            alert("O código CVV deve ter 3 ou 4 dígitos.");
            return;
        }
    }

    alert("Pedido confirmado com sucesso! A Reatância está chegando na sua casa!");
    cart = [];
    valorFrete = 0;
    updateCartUI();
    closeModal('modal-checkout');
    window.location.href = 'index.html'; 
});