
$(document).ready(function(){

  $("div.desc").hide();
  //$("aside.shippinginfo").hide();

  $("a.product").hover(function(e){
    e.preventDefault();
    $(this).children('div.desc').fadeToggle(150);
  });

  $("span.cart").hover(function(e){
      $(".counter").toggleClass("cart-circle-hovered");
      $(".js-cart-counter").toggleClass("cart-circle-span-hovered");
  });

  $("span.cart a").click(function(e){
    e.preventDefault();
    $("#product-cart").fadeToggle(200);
    $("span.cart a").toggleClass("cartclicked");
    $("span.cart figure").toggleClass("cartclicked");
    $("div.closebtn").fadeToggle(300);
  });

  $("a#addproduct").click(function(e){
    e.preventDefault();
    $("section.cart-disp-full").fadeToggle(200);
    $("span.cart a").toggleClass("cartclicked");
    $("span.cart figure").toggleClass("cartclicked");
    $("div.closebtn").fadeToggle(300);
  });

  /*$('#show-shipping').click(function () {
    $(".shippinginfo").fadeToggle(this.checked);
    $("a.right").toggleClass("centered",this.checked);
  });*/

$("div.product-index-desc").hide();
  
  $("a.product").hover(function(){
    $(this).children('div.product-index-desc').fadeToggle(150);
  });

$("#purchase").click(function() {
    doBounce($("#cartcounter"), 2, '5px', 100);   
});


function doBounce(element, times, distance, speed) {
    for(i = 0; i < times; i++) {
        element.animate({top: '-='+distance},speed)
            .animate({top: '+='+distance},speed);
    }        
}

$(".scroll").click(function(event){   
    event.preventDefault();
    $('html,body').animate({scrollTop:$(this.hash).offset().top}, 1000);
  });
  
  
 $('#features').waypoint({
    handler: function(event, direction) {
        $('a.to-top').toggleClass("slideright", direction == 'down')
      }
  });
  
  $('#selectcolorsize').click(function(){
  setTimeout(function() {
    $('#color').focus();},1250);
      });

});




(function (window, $) {
  // gets filled in on DOM ready
  var ui = {};

  var messages = {
    ShopifyAddingItemToCart: 'shopify.adding_item_to_cart'
  , ShopifyOnError: 'shopify.on_error'
  , ShopifyOnCartUpdate: 'shopify.on_cart_update'
  , ShopifyOnCartShippingRatesUpdate: 'shopify.on_cart_shipping_rates_update'
  , ShopifyOnItemAdded: 'shopify.on_item_added'
  , ShopifyOnProduct: 'shopify.on_product'
  };

  Shopify.onError = function(XMLHttpRequest, textStatus) {
    // Shopify returns a description of the error in XMLHttpRequest.responseText.
    // It is JSON.
    // Example: {"description":"The product 'Amelia - Small' is already sold out.","status":500,"message":"Cart Error"}
    PubSub.publish(messages.ShopifyOnError, { XMLHttpRequest:XMLHttpRequest, textStatus:textStatus });
  };

  Shopify.onCartUpdate = function(cart) {
    //alert('There are now ' + cart.item_count + ' items in the cart.');
    App.cart = cart;
    PubSub.publish(messages.ShopifyOnCartUpdate, cart);
  };

  Shopify.onCartShippingRatesUpdate = function(rates, shipping_address) {
    //var readable_address = '';
    //if (shipping_address.zip) readable_address += shipping_address.zip + ', ';
    //if (shipping_address.province) readable_address += shipping_address.province + ', ';
    //readable_address += shipping_address.country
    //alert('There are ' + rates.length + ' shipping rates available for ' + readable_address +', starting at '+ Shopify.formatMoney(rates[0].price) +'.');
    PubSub.publish(messages.ShopifyOnCartShippingRatesUpdate, { rates:rates, shipping_address: shipping_address });
  };

  Shopify.onItemAdded = function(line_item) {
    //alert(line_item.title + ' was added to your shopping cart.');
    PubSub.publish(messages.ShopifyOnItemAdded, line_item);
  };

  Shopify.onProduct = function(product) {
    //alert('Received everything we ever wanted to know about ' + product.title);
    PubSub.publish(messages.ShopifyOnProduct, product);
  };

  var addProductToCart = function (e) {
    e.preventDefault();
    PubSub.publish(messages.ShopifyAddingItemToCart, e);
    Shopify.addItemFromForm('add-product-form');
  };

  var renderCart = function (msg) {
    var template = $('#cart-template').html();
    var html = _.template(template, App.cart);

    ui.productCart.html(html);
  };

  var updateCartCount = function (msg, cart) {
    ui.cartCounter.text(cart.item_count);
  };

  var removeLineItem = function (e) {
    e.preventDefault();
    var variantId = $(e.currentTarget).closest('.js-cart-line-item').data('variantId');
    if (!variantId) throw new Error("missing variantId")
    Shopify.removeItem(variantId);
  };


  var changeQuantity = function (e) {
    var $target = $(e.currentTarget);
    var lineItemData = $target.closest('.js-cart-line-item').data();
    var direction = $target.data('direction') == 'up' ? 1 : -1;
    var newQuantity = lineItemData.quantity + direction;

    Shopify.changeItem(lineItemData.variantId, newQuantity);
  };

  var updateCartLink = function (msg, cart) {

    ui.productCart.find('.checkout').attr('href', 'foo');
  };

  var init = function () {
    ui = {
      cartCounter: $('.js-cart-counter')
    , productCart: $('#product-cart')
    };

    $('body').on('click', '.js-add-product-to-cart', addProductToCart);
    $('body').on('click', '.js-remove-line-item', removeLineItem);
    $('body').on('click', '.js-change-quantity', changeQuantity);

    PubSub.subscribe('shopify', function () { console.log('on shoify:', this, arguments); })

    // when a product is added, get the latest cart info
    PubSub.subscribe(messages.ShopifyOnItemAdded, Shopify.getCart);


    PubSub.subscribe(messages.ShopifyOnCartUpdate, renderCart);
    PubSub.subscribe(messages.ShopifyOnCartUpdate, updateCartCount);
    PubSub.subscribe(messages.ShopifyOnCartUpdate, updateCartLink);

    // not rendered on server so need to render it on page load
    renderCart();
  };

  $(init);

})(this, jQuery);


