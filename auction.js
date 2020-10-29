// auction cage price
var cagePrice = 29.9;
var smallBandagePrice = 15.9;
var bandagePrice = 19.9;
var mazPrice = 19.9;
(function() {
    document.onclick = function (event) {
        if (event.target.className && event.target.className.indexOf('priceInput') === 0) {
            var clickedPriceBox = event.target;
            var parentRow = clickedPriceBox.parentElement.parentElement;
            var itemType = +parentRow.cells[0].firstElementChild.getAttribute('item-type');
            var price = 0;
            var amount = 1;
            // get quantity
            var nameAndQuantityCell = parentRow.cells[1];
            if (nameAndQuantityCell.childElementCount > 1) {
                amount = +nameAndQuantityCell.lastElementChild.textContent.match(/\d+/)[0];
            }
            // Set price for specific item type
            if (itemType === 119) {
                price = window['cagePrice'];
            } else if (itemType === 117) {
                price = window['smallBandagePrice'];
            } else if (itemType === 118) {
                price = window['bandagePrice'];
            } else if (itemType === 112) {
                price = window['mazPrice'];
            }
            // Actual price Per Item
            var actualPricePerItem = 0;
            if (amount > 1) {
                actualPricePerItem = +parentRow.cells[4].getAttribute('tooltip-data').match(/\d+.?\d*/)[0]
            } else {
                actualPricePerItem = +parentRow.cells[4].textContent.match(/\d+/)[0];
            }

            // console.log('actual price per item, price', actualPricePerItem, price);

            if (amount * price === 0) {
                return;
            }
            // Set Amount into Price Cell
            if (actualPricePerItem < price) {
                clickedPriceBox.value = Math.round(amount * price);
                clickedPriceBox.dispatchEvent(new Event('change'));
            } else {
                clickedPriceBox.style.background = 'red';
            }
        }
    }
})();
