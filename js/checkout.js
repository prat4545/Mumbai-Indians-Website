document.addEventListener('DOMContentLoaded', async () => {
  const user = await window.MIAuth.requireAuth('login.html');
  if (!user) return;

  const form = document.getElementById('checkoutForm');
  const summary = document.getElementById('summary');
  const message = document.getElementById('message');
  const button = document.getElementById('placeOrderBtn');

  let cart = [];
  try {
    const saved = JSON.parse(localStorage.getItem('mi_cart') || '[]');
    cart = Array.isArray(saved) ? saved : [];
  } catch {
    cart = [];
  }

  const showMessage = (text, type = 'error') => {
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = text ? 'block' : 'none';
  };

  const escapeHTML = (value) => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  if (!cart.length) {
    summary.innerHTML = '<div class="empty">Your cart is empty.<br><br><a href="store.html">Return to Store</a></div>';
    button.disabled = true;
    return;
  }

  const ids = [...new Set(cart.map(item => Number(item.id)).filter(Number.isInteger && Number.isSafeInteger))];
  if (!ids.length) {
    showMessage('Your cart contains invalid items. Please return to the store.');
    button.disabled = true;
    return;
  }

  const { data: products, error } = await window.MIAuth.client
    .from('products')
    .select('id,name,price,stock,is_active')
    .in('id', ids)
    .eq('is_active', true);

  if (error || !products?.length) {
    showMessage('We could not verify your cart right now. Please refresh and try again.');
    button.disabled = true;
    return;
  }

  const byId = new Map(products.map(p => [Number(p.id), p]));
  let total = 0;
  const validItems = [];
  const lines = [];

  for (const item of cart) {
    const product = byId.get(Number(item.id));
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      showMessage('One or more cart items are no longer valid. Please review your cart.');
      button.disabled = true;
      return;
    }
    if (Number(product.stock) < quantity) {
      showMessage(`${product.name} does not have enough stock for this quantity.`);
      button.disabled = true;
      return;
    }
    const subtotal = Number(product.price) * quantity;
    total += subtotal;
    validItems.push({ product_id: Number(product.id), quantity });
    lines.push(`<div class="summary-row"><span>${escapeHTML(product.name)} × ${quantity}</span><strong>₹${subtotal.toLocaleString('en-IN')}</strong></div>`);
  }

  lines.push(`<div class="summary-row" style="border:0;font-size:1.15rem"><strong>Total</strong><strong>₹${total.toLocaleString('en-IN')}</strong></div>`);
  summary.innerHTML = lines.join('');

  const profile = await window.MIAuth.client.from('profiles').select('full_name,mobile').eq('id', user.id).maybeSingle();
  if (profile.data) {
    document.getElementById('name').value = profile.data.full_name || '';
    document.getElementById('mobile').value = profile.data.mobile || '';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage('');

    const name = document.getElementById('name').value.trim();
    const mobile = document.getElementById('mobile').value.replace(/\D/g, '');
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const pincode = document.getElementById('pincode').value.replace(/\D/g, '');

    if (name.length < 2 || mobile.length !== 10 || address.length < 5 || city.length < 2 || pincode.length !== 6) {
      showMessage('Please enter valid name, 10-digit mobile, complete address, city and 6-digit pincode.');
      return;
    }

    button.disabled = true;
    button.textContent = 'Processing…';

    const { data, error: orderError } = await window.MIAuth.client.rpc('create_store_order', {
      p_items: validItems,
      p_shipping_name: name,
      p_shipping_mobile: mobile,
      p_shipping_address: address,
      p_shipping_city: city,
      p_shipping_pincode: pincode
    });

    if (orderError) {
      showMessage(orderError.message || 'Unable to place your order. Please try again.');
      button.disabled = false;
      button.textContent = 'Place Order';
      return;
    }

    localStorage.removeItem('mi_cart');
    const reference = data?.order_reference || 'your order';
    showMessage(`Order placed successfully. Reference: ${reference}`, 'success');
    button.textContent = 'Order Confirmed';
    setTimeout(() => { window.location.href = `account.html?order=${encodeURIComponent(reference)}`; }, 900);
  });
});