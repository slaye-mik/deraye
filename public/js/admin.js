// Modify the form submit handler
document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const product = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        pcs: document.getElementById('pcs').value,
        image: document.getElementById('image').value
    };

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...product,
                pcs: Number(product.pcs) // Convert to number
            })
        });

        const result = await response.json(); // <-- Add this
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to add product');
        }

        alert('Product added successfully!');
        document.getElementById('add-product-form').reset();
        loadProducts();
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`); // Show actual error message
    }
});

// Load existing products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        const productList = document.getElementById('admin-product-list');
        
        productList.innerHTML = products.map(product => `
            <div class="product-item">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Category: ${product.category}</p>
                <p>Stock: ${product.pcs}</p>
                <button onclick="deleteProduct('${product._id}')">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${id}?password=${ADMIN_PASSWORD}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadProducts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    }
  }
  // Add edit button to product items
function createProductItem(product) {
    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>Category: ${product.category}</p>
        <p>Stock: ${product.pcs}</p>
        <div class="product-actions">
          <button class="edit-btn" onclick="showEditForm('${product._id}')">Edit</button>
          <button class="delete-btn" onclick="deleteProduct('${product._id}')">Delete</button>
        </div>
      </div>
      <form class="edit-form" id="edit-${product._id}" style="display: none;">
        <input type="text" value="${product.name}" required>
        <select>
          <option ${product.category === 'drinks' ? 'selected' : ''}>drinks</option>
          <option ${product.category === 'cakes' ? 'selected' : ''}>cakes</option>
          <option ${product.category === 'chips' ? 'selected' : ''}>chips</option>
          <option ${product.category === 'gums-candy' ? 'selected' : ''}>gums-candy</option>
          <option ${product.category === 'others' ? 'selected' : ''}>others</option>
        </select>
        <input type="number" value="${product.pcs}" required>
        <input type="text" value="${product.image}" required>
        <button type="button" onclick="updateProduct('${product._id}')">Save</button>
      </form>
    `;
    return div;
  }
  
// Delete Product with Confirmation
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  
  try {
      const response = await fetch(`/api/products/${id}?password=deraye22mahmud`, {
          method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Delete failed');
      loadProducts();
  } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
  }
}

// Edit Product Functionality
function showEditForm(product) {
  const form = document.createElement('form');
  form.className = 'edit-form';
  form.innerHTML = `
      <h3>Edit Product</h3>
      <input type="text" value="${product.name}" id="edit-name" required>
      <select id="edit-category" required>
          <option value="drinks" ${product.category === 'drinks' ? 'selected' : ''}>Drinks</option>
          <option value="cakes" ${product.category === 'cakes' ? 'selected' : ''}>Cakes</option>
          <option value="chips" ${product.category === 'chips' ? 'selected' : ''}>Chips</option>
          <option value="gums-candy" ${product.category === 'gums-candy' ? 'selected' : ''}>Gums/Candy</option>
          <option value="others" ${product.category === 'others' ? 'selected' : ''}>Others</option>
      </select>
      <input type="number" value="${product.pcs}" id="edit-pcs" required>
      <input type="text" value="${product.image}" id="edit-image" required>
      <div class="form-buttons">
          <button type="button" onclick="submitEdit('${product._id}')">Save</button>
          <button type="button" onclick="cancelEdit()">Cancel</button>
      </div>
  `;
  
  document.body.appendChild(form);
  form.style.display = 'block';
}

async function submitEdit(id) {
  const updatedProduct = {
      name: document.getElementById('edit-name').value,
      category: document.getElementById('edit-category').value,
      pcs: document.getElementById('edit-pcs').value,
      image: document.getElementById('edit-image').value
  };

  try {
      const response = await fetch(`/api/products/${id}?password=deraye22mahmud`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
      });

      if (response.ok) {
          loadProducts();
          cancelEdit();
      }
  } catch (error) {
      console.error('Update error:', error);
  }
}

function cancelEdit() {
  const form = document.querySelector('.edit-form');
  if (form) form.remove();
}

// Initial load
loadProducts();