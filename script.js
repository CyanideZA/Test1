

// Shopping Cart Functionality
document.addEventListener('DOMContentLoaded', function() {
  let cart = [];

  // Notification function
  function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = isError ? 'notification error show' : 'notification show';

    setTimeout(() => {
      notification.className = 'notification';
    }, 3000);
  }

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

  // Payment method toggle
  document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'stripe') {
        document.getElementById('stripe-payment-element').style.display = 'block';
        document.getElementById('eft-instructions').style.display = 'none';
        document.getElementById('button-text').textContent = 'Pay with Card';
      } else {
        document.getElementById('stripe-payment-element').style.display = 'none';
        document.getElementById('eft-instructions').style.display = 'block';
        document.getElementById('button-text').textContent = 'Place Order';
      }
    });
  });

  // Form submission
  document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (cart.length === 0) {
      showNotification('Your cart is empty!', true);
      return;
    }

    const formData = new FormData(this);
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

    // Show loading state
    document.getElementById('button-text').style.display = 'none';
    document.getElementById('button-spinner').style.display = 'inline-block';
    document.getElementById('submit-order').disabled = true;

    try {
      if (paymentMethod === 'stripe') {
        // Simulate Stripe payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In a real implementation, you would use Stripe's API here
        // For demo purposes, we'll assume the payment was successful
      }

      // Process order
      const orderData = {
        to: formData.get('email'),
        customer_name: formData.get('name'),
        customer_email: formData.get('email'),
        customer_phone: formData.get('phone'),
        customer_address: formData.get('address'),
        customization: formData.get('customization'),
        order_ref: 'SL' + Date.now(),
        order_date: new Date().toLocaleDateString('en-ZA'),
        order_items: generateOrderItemsHTML(),
        order_total: calculateOrderTotal(),
        payment_method: paymentMethod === 'stripe' ? 'Credit Card' : 'Bank Transfer (EFT)',
        admin_email: 'a.lawry98@gmail.com' // Send admin email to this address
      };

      // Send order data to server (simulated)
      const response = await sendOrderToServer(orderData);

      if (response.success) {
        // Show success modal with order details
        document.getElementById('order-ref').textContent = orderData.order_ref;
        document.getElementById('customer-name').textContent = orderData.customer_name;
        document.getElementById('order-total').textContent = 'R' + orderData.order_total;
        document.getElementById('success-modal').classList.add('active');

        // Reset cart and form
        cart = [];
        updateCart();
        this.reset();
      } else {
        throw new Error(response.error || 'Failed to process order');
      }

    } catch (error) {
      console.error('Order processing error:', error);
      showNotification('Error: ' + error.message, true);
    } finally {
      // Reset button state
      document.getElementById('button-text').style.display = 'inline';
      document.getElementById('button-spinner').style.display = 'none';
      document.getElementById('submit-order').disabled = false;
    }
  });

  // Close modal functionality
  document.getElementById('modal-close').addEventListener('click', function() {
    document.getElementById('success-modal').classList.remove('active');
  });

  // Helper functions
  function generateOrderItemsHTML() {
    let itemsHTML = '';
    cart.forEach(item => {
      itemsHTML += `<div class="item">${item.product} - R${item.price} x ${item.quantity} = R${(item.price * item.quantity).toFixed(2)}</div>`;
    });
    return itemsHTML;
  }

  function calculateOrderTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  }

  // Simulate sending order data to server
  async function sendOrderToServer(orderData) {
    // In a real implementation, this would be a fetch request to your server
    // For this demo, we'll simulate a successful API call

    console.log('Sending order data to server:', orderData);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate successful response
    return {
      success: true,
      message: 'Order processed successfully',
      order_ref: orderData.order_ref
    };
  }

  // Initialize cart
  updateCart();
});

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('nav ul');

  mobileMenuBtn.addEventListener('click', function() {
    navMenu.classList.toggle('show');
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      window.scrollTo({
        top: targetSection.offsetTop - 80,
        behavior: 'smooth'
      });

      // Close mobile menu after clicking
      if (navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
      }
    });
  });

  // Form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

