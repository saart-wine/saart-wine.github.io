// TODO: buy
populateCart();
toggleBasket();

var addButtons = document.querySelectorAll("button[data-id]");

addButtons.forEach(butt => {
  butt.addEventListener("click", event => {
    var data = { ...butt.dataset };
    console.log(`${data.id} clicked - ${JSON.stringify(data)}`);
    addToCart(data);
  });
});

document.querySelectorAll(".basket__container").forEach(basket => {
  basket.addEventListener("click", event => {
    toggleBasket();
  });
});

function toggleBasket() {
  document.querySelectorAll(".cart").forEach(cart => {
    cart.style.visibility = (cart.style.visibility === 'hidden') ? 'visible' : 'hidden';
    console.log(cart.style.visibility)
  })
}
function populateCart() {
  // var cartBody = 
  document.querySelectorAll(".cart__content > tbody").forEach(cartBody => {
    var cart = getCart();
    // update total
    var totalEl = document.getElementsByClassName("total");
    for (const totalE in totalEl) {
      var total = Object.keys(cart).reduce((prev, curr) => {
        var q = cart[curr].quantity;
        var p = cart[curr].data.price;
        return prev + (q * p);
      }, 0);
      console.log(total);
      totalDollars = total;
      totalEl[totalE].innerText = `${totalDollars}kr`;
    }

    // remove all cart items
    while (cartBody.firstChild) {
      cartBody.removeChild(cartBody.firstChild);
    }

    // add cart items back
    num_items = 0;
    for (var item in cart) {
      var cartItem = cart[item];
      var tr = document.createElement("tr");
      var desc = document.createElement("td");
      desc.innerText = cartItem.data.title;
      tr.appendChild(desc);

      var img = document.createElement("td");
      var imagetag = document.createElement("img");
      imagetag.src = cartItem.data.image;
      imagetag.alt = cartItem.data.description;
      imagetag.title = cartItem.data.title;
      img.appendChild(imagetag);
      tr.appendChild(img);

      var quantity = document.createElement("td");
      quantity.innerText = cartItem.quantity;
      tr.appendChild(quantity);
      num_items += cartItem.quantity;

      var price = document.createElement("td");
      var dollars = cartItem.data.price;
      price.innerText = `${dollars}kr`;
      tr.appendChild(price);

      var rem = document.createElement("td");
      var butDecrease = document.createElement("button");
      var butIncrease = document.createElement("button");

      function removeListener(id) {
        return function (e) {
          removeFromCart(id);
        }
      }
      butDecrease.addEventListener("click", removeListener(item));
      butDecrease.innerText = "-";
      butDecrease.setAttribute('class', 'button__small')
      rem.appendChild(butDecrease);
      function addListener(id) {
        return function (e) {
          addToCart(id);
        }
      }
      butIncrease.addEventListener("click", addListener(cartItem.data));
      butIncrease.innerText = "+";
      butIncrease.setAttribute('class', 'button__small')
      rem.appendChild(butIncrease);
      tr.appendChild(rem);

      cartBody.appendChild(tr);
    }
    if (num_items > 0) {
      document.querySelector(".basket__badge").setAttribute('data-badge', num_items + "");
    } else {
      document.querySelector(".basket__badge").removeAttribute('data-badge');
    }
  });
}

function addToCart(data) {
  var cart = getCart()
  var prevQuantity = cart[data.id] ? cart[data.id].quantity : 0;
  cart[data.id] = {
    quantity: prevQuantity + 1,
    data,
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  populateCart();
}

function removeFromCart(id) {
  var cart = getCart();
  if (!cart[id]) {
    console.error(`${id} not found in cart`);
    return;
  }

  var prevQuantity = cart[id].quantity;
  if (prevQuantity === 1) {
    // remove item if will go to 0
    delete cart[id];
  } else {
    cart[id].quantity = prevQuantity - 1;
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  populateCart();
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || {};
}
function clearCart() {
  localStorage.removeItem('cart');
  populateCart();
}
window.addEventListener("storage", function (e) {
  populateCart();
})

function orderViaMail() {
  cart = getCart();
  switch (lang) {
    case 'en':
      hello = 'Hi Sårt i wish to order the following:\n';
      total_txt = "\nTotal:\t";
      ship_to = "\n\nShip to:";
      post_txt = "\n\n\nSend this mail and we will get get back to you regarding your order and delivery.\nThank you!";
      break;
    default:
      hello = 'Hej Sårt jeg ønsker at bestille følgende:\n';
      total_txt = "\nTotal\t";
      ship_to = "\n\nSendes til:"
      post_txt = "\n\n\nSend denn mail, så vil vi svare tilbage på den for at koordinere din ordre.\nTak!";
  }
  total = 0;
  mailText = hello;
  for (let item in cart) {
    mailText += item + ':\t' + cart[item].quantity + '\n';
    total += cart[item].quantity * cart[item].data.price;
  };
  mailText += total_txt + total + "kr";
  mailText += ship_to;
  form = document.getElementById("shoppingForm");
  var data = new FormData(form);
  for (var [key, value] of data) {
    mailText += '\n' + key + ':\t' + value;
  }
  mailText += post_txt;
  console.log(mailText);
  var mailToLink = "mailto:saart.wine@gmail.com?subject=Bestilling&body=" + encodeURIComponent(mailText);
  window.location.href = mailToLink;
}