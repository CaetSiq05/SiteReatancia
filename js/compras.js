// 0. INTEGRAÇÃO COM A BASE DE DADOS

async function carregarProdutosDoBanco() {
    try {
        const resposta = await fetch('http://localhost:3000/api/produtos');
        const produtosDb = await resposta.json();

        produtosDb.forEach(prod => {
            // Encontra o botão correspondente no HTML original pelo ID do produto
            const btn = document.querySelector(`.btn-add-cart[data-id="${prod.id}"]`);
            if (btn) {
                // Atualiza os dados invisíveis do botão com a informação real da base de dados
                btn.dataset.name = prod.nome;
                btn.dataset.price = prod.preco;
                btn.dataset.img = prod.imagem_url;
                btn.dataset.type = prod.tipo;

                // Atualiza o texto do preço e do nome visualmente no ecrã
                const card = btn.closest('.product-card');
                if (card) {
                    const nomeEl = card.querySelector('h2');
                    const precoEl = card.querySelector('.price');
                    if (nomeEl) nomeEl.innerText = prod.nome;
                    if (precoEl) precoEl.innerText = `R$ ${parseFloat(prod.preco).toFixed(2).replace('.', ',')}`;
                }
            }
        });
    } catch (error) {
        console.error('Erro ao ligar ao servidor de produtos:', error);
    }
}

// Executa a procura na base de dados assim que o ficheiro é lido
carregarProdutosDoBanco();


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

// Adiciona os eventos aos botões da loja
document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', function() {
        // Criamos uma cópia nova dos dados do botão
        const prod = {
            id: this.dataset.id, 
            name: this.dataset.name,
            price: parseFloat(this.dataset.price), 
            img: this.dataset.img, 
            type: this.dataset.type,
            tamanho: null // Inicia sem tamanho por padrão
        };

        if (prod.type === 'roupa') {
            // Salva uma cópia independente no pendingProduct
            pendingProduct = { ...prod };
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            document.getElementById('confirm-size-btn').disabled = true;
            openModal('modal-size');
        } else {
            addToCart({ ...prod });
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

// Botão de confirmação de tamanho no modal
document.getElementById('confirm-size-btn').addEventListener('click', () => {
    if (pendingProduct && selectedSize) {
        // Criamos um novo objeto com os dados finais da roupa
        const itemFinal = {
            ...pendingProduct,
            tamanho: selectedSize,
            name: `${pendingProduct.name} (Tam: ${selectedSize})`
        };

        addToCart(itemFinal);
        closeModal('modal-size');
        showToast();

        // Reseta as variáveis temporárias
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
        cartContainer.innerHTML = '<p style="text-align:center; color:gray;">O seu carrinho está vazio.</p>';
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
    
    if (document.getElementById('pagamento-metodo').value === 'credito') {
        gerarParcelas();
    }
}

// 3. FLUXO DE CHECKOUT E MÁSCARAS

document.getElementById('btn-open-cart').addEventListener('click', () => openModal('modal-cart'));

document.getElementById('btn-checkout').addEventListener('click', () => {
    if(cart.length === 0) {
        alert("O seu carrinho está vazio!");
        return;
    }
    
    // VERIFICAÇÃO DE SEGURANÇA: Só prossegue se o utilizador tiver feito login
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Tem de iniciar sessão para finalizar a compra!");
        // Redireciona para o login e avisa que veio da loja
        window.location.href = 'login_2.html?origem=loja';
        return;
    }

    closeModal('modal-cart');
    updateCheckoutTotal();
    openModal('modal-checkout');
});

// Máscaras e API de CEP
const cepInput = document.getElementById('cep-input');
cepInput.addEventListener('input', async function(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
    e.target.value = v;

    if (v.length === 9) {
        const cepLimpo = v.replace('-', '');
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('rua-input').value = data.logradouro;
                document.getElementById('bairro-input').value = data.bairro;
                document.getElementById('cidade-input').value = `${data.localidade} / ${data.uf}`;
                document.getElementById('num-input').focus();
                
                valorFrete = 15.90;
                document.getElementById('frete-display').innerText = `Frete Transportadora: R$ 15,90`;
                if(document.getElementById('pagamento-metodo').value === 'credito') gerarParcelas();
                updateCheckoutTotal();
            } else {
                alert("CEP não encontrado. Verifique e tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao procurar CEP:", error);
        }
    }
});

// Máscaras do Cartão
const numCartaoInput = document.getElementById('cartao-numero');
numCartaoInput.addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, ''); 
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');    
    e.target.value = v;
});

const validadeCartaoInput = document.getElementById('cartao-validade');
validadeCartaoInput.addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, ''); 
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4); 
    e.target.value = v;
});

const cvvInput = document.getElementById('cartao-cvv');
cvvInput.addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, ''); 
});

// Lógica de Pagamento
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

selectParcela.addEventListener('change', updateCheckoutTotal);

function updateCheckoutTotal() {
    let totalGeral = subtotal + valorFrete;
    
    if (selectMetodo.value === 'credito' && selectParcela.options.length > 0) {
        const juros = parseFloat(selectParcela.options[selectParcela.selectedIndex].dataset.juros);
        totalGeral = totalGeral * juros;
    }

    checkoutTotalDisplay.innerText = `Total a pagar: R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
}

// Validação Final
document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 1. Validações de pagamento (apenas se for cartão)
    if (selectMetodo.value !== 'pix') {
        const numero = numCartaoInput.value;
        const validade = validadeCartaoInput.value;
        const cvv = cvvInput.value;

        if (numero.length < 19) {
            alert("Por favor, preencha o número do cartão corretamente (16 dígitos).");
            return;
        }

        if (validade.length < 5) {
            alert("A validade deve estar no formato MM/AA.");
            return;
        }

        const mes = parseInt(validade.split('/')[0]);
        const ano = parseInt(validade.split('/')[1]);
        const anoAtual = parseInt(String(new Date().getFullYear()).slice(-2)); 

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

    // 2. Cálculo do parcelamento (usando as variáveis já declaradas no arquivo)
    let parcelasQtd = 1;
    if (selectMetodo.value === 'credito' && selectParcela.value) {
        parcelasQtd = parseInt(selectParcela.value) || 1;
    }

    // 3. Formatação do total e captura dos dados
    const totalTexto = checkoutTotalDisplay.innerText.replace('Total a pagar: R$ ', '').replace(',', '.');
    const valorTotal = parseFloat(totalTexto);
    const token = localStorage.getItem('token');

    // 4. Montagem do payload
    const payload = {
        total: valorTotal,
        metodo_pagamento: selectMetodo.value,
        parcelas: parcelasQtd,
        cartao_numero: numCartaoInput.value,
        itens: cart,
        endereco: {
            cep: document.getElementById('cep-input').value,
            rua: document.getElementById('rua-input').value,
            numero: document.getElementById('num-input').value,
            complemento: document.getElementById('comp-input').value,
            bairro: document.getElementById('bairro-input').value,
            cidade: document.getElementById('cidade-input').value
        }
    };

    // 5. Requisição para a API
    try {
        const resposta = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const dados = await resposta.json();

        if (resposta.status === 201) {
            alert(dados.mensagem + " A Reatância agradece a sua compra!");
            cart = [];
            valorFrete = 0;
            updateCartUI();
            closeModal('modal-checkout');
            window.location.href = 'index.html'; 
        } else {
            alert("Erro ao finalizar compra: " + (dados.mensagem || "Erro desconhecido"));
        }
    } catch (erro) {
        console.error("Erro na comunicação com a API:", erro);
        alert("Falha de comunicação com o servidor.");
    }
});