document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu functionality
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector("nav ul");

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll("a").forEach(anchor => {
      anchor.addEventListener("click", function() {
        navMenu.classList.remove("active");
      });
    });
  }

  // Close menu when window is resized to desktop size
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && navMenu) {
      navMenu.classList.remove('active');
    }
  });

  // Shopping cart functionality (only for shop page)
  if (document.querySelector('.add-to-cart')) {
    let cart = [];

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', function() {
        const product = this.dataset.product;
        const price = parseFloat(this.dataset.price);

        // Check if product already in cart
        const existingItem = cart.find(item => item.product === product);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            product: product,
            price: price,
            quantity: 1
          });
        }

        updateCart();
        showNotification(`${product} added to cart!`);
      });
    });

    // Update cart display
    function updateCart() {
      const cartItems = document.querySelector('.cart-items');
      const cartTotal = document.getElementById('cart-total');

      if (!cartItems || !cartTotal) return;

      // Clear current cart items
      cartItems.innerHTML = '';

      // Add items to cart
      let total = 0;

      if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = 'R0.00';
        return;
      }

      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
          <div>
            <strong>${item.product}</strong>
            <p>R${item.price.toFixed(2)} x ${item.quantity}</p>
          </div>
          <div>
            <p>R${itemTotal.toFixed(2)}</p>
            <button class="remove-item" data-index="${index}">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;

        cartItems.appendChild(cartItem);
      });

      // Update total
      cartTotal.textContent = `R${total.toFixed(2)}`;

      // Add event listeners to remove buttons
      document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
          const index = parseInt(this.dataset.index);
          const removedItem = cart[index].product;
          cart.splice(index, 1);
          updateCart();
          showNotification(`${removedItem} removed from cart`);
        });
      });
    }

    // Notification function
    function showNotification(message, isError = false) {
      // Create notification element if it doesn't exist
      let notification = document.querySelector('.notification');
      if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
      }

      notification.textContent = message;
      notification.className = `notification ${isError ? 'error' : ''}`;
      notification.classList.add('show');

      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }

    // Initialize cart
    updateCart();
  }
});