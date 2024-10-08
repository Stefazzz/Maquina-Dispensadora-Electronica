//MENSAJE IMPORTANTE!!! DEBIDO A LA POLITICA DE PRIVACIDAD DE MICROSOFT EDGE, 
//BLOQUEA LA POSIBILIDAD DE REALIZAR LOS PAGOS, POR TANTO SE HA USADO OPERA PARA LA INTEGRACION DEL PROYECTO
const modalContainer = document.getElementById("modal-container");
const modalOverlay = document.getElementById("modal-overlay");
const cartBtn = document.getElementById("car-btn");
const cartCounter = document.getElementById("cart-counter");
let checkoutButton = null; // Variable global para manejar la instancia del botón de Mercado Pago

const displayCart = () => {
    modalContainer.innerHTML = "";
    modalContainer.style.display = "block";
    modalOverlay.style.display = "block";

    const modalHeader = document.createElement("div");
    const modalClose = document.createElement("div");
    modalClose.innerText = "❌";
    modalClose.className = "modal-close";
    modalHeader.append(modalClose);

    modalClose.addEventListener("click", () => {
        modalContainer.style.display = "none";
        modalOverlay.style.display = "none";
    });

    const modalTitle = document.createElement("div");
    modalTitle.innerText = "Carrito";
    modalTitle.className = "modal-title";
    modalHeader.append(modalTitle);

    modalContainer.append(modalHeader);

    if (cart.length > 0) {
        // MODAL BODY
        cart.forEach((product) => {
            const modalBody = document.createElement("div");
            modalBody.className = "modal-body";
            modalBody.innerHTML = `
                <div class="product">
                    <img class="product-img" src="${product.img}" />
                    <div class="product-info">
                        <h4>${product.productName}</h4>
                    </div>
                    <div class="quantity">
                        <span class="quantity-btn-decrease">-</span>
                        <span class="quantity-input">${product.quanty}</span>
                        <span class="quantity-btn-increase">+</span>
                    </div>
                    <div class="price">$ ${product.price * product.quanty} </div>
                    <div class="delete-product">❌</div>
                </div>
            `;
            modalContainer.append(modalBody);

            const decrease = modalBody.querySelector(".quantity-btn-decrease");
            decrease.addEventListener("click", () => {
                if (product.quanty !== 1) {
                    product.quanty--;
                    displayCart();
                }
                displayCartCounter();
            });

            const increase = modalBody.querySelector(".quantity-btn-increase");
            increase.addEventListener("click", () => {
                product.quanty++;
                displayCart();
                displayCartCounter();
            });

            const deleteProduct = modalBody.querySelector(".delete-product");
            deleteProduct.addEventListener("click", () => {
                deleteCarProduct(product.id);
            });
        });

        // MODAL FOOTER
        const total = cart.reduce((acc, el) => acc + el.price * el.quanty, 0);

        const modalFooter = document.createElement("div");
        modalFooter.className = "modal-footer";
        modalFooter.innerHTML = `
            <div class="total-price">Total ${total}</div>
            <button class="btn-primary" id="checkout-btn">Ir a pagar</button>
            <div id="wallet_container"></div>
        `;
        modalContainer.append(modalFooter);

        // INTEGRACION DE MERCADO PAGO
        //public key
        const mp = new MercadoPago("APP_USR-4e2f244f-c2c2-4702-9a30-c373255367de", {
            locale: "es-MX",
        });

        const generateCartDescription = () => {
            return cart.map(product => `${product.productName} (x${product.quanty})`).join(', ');
        };

        document.getElementById("checkout-btn").addEventListener("click", async () => {
            try {
                const orderData = {
                    title: generateCartDescription(),
                    quantity: 1,
                    price: total,
                };

                const response = await fetch("http://localhost:3000/create_preference", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderData),
                });

                const preference = await response.json();
                createCheckoutButton(preference.id);

            } catch (error) {
                console.log(error);
                alert("Error!");
            }
        });

        const createCheckoutButton = (preferenceId) => {
            const bricksBuilder = mp.bricks();

            const renderComponent = async () => {
                // Desmontar el botón anterior si existe
                if (checkoutButton) {
                    checkoutButton.unmount();
                    checkoutButton = null; // Limpia la instancia
                }

                // Crear el nuevo botón
                checkoutButton = await bricksBuilder.create("wallet", "wallet_container", {
                    initialization: {
                        preferenceId: preferenceId,
                        redirectMode: 'modal',
                    },
                });
            };

            renderComponent();
        };
    } else {
        const modalText = document.createElement("h2");
        modalText.className = "modal-body";
        modalText.innerText = "Tu carrito está vacío";
        modalContainer.append(modalText);
    }
};

cartBtn.addEventListener("click", displayCart);

const deleteCarProduct = (id) => {
    const foundId = cart.findIndex((element) => element.id === id);
    cart.splice(foundId, 1);
    displayCart();
    displayCartCounter();
};

const displayCartCounter = () => {
    const cartLength = cart.reduce((acc, el) => acc + el.quanty, 0);
    if (cartLength > 0) {
        cartCounter.style.display = "block";
        cartCounter.innerText = cartLength;
    } else {
        cartCounter.style.display = "none";
    }
};
