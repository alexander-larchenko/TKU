// auction cage price
var cagePrice = 49;
(function() {
    document.onclick = function (event) {
        if (event.target.className && event.target.className.indexOf('priceInput') === 0) {
            var clickedPriceBox = event.target;
            var parentRow = clickedPriceBox.parentElement.parentElement;
            var itemType = +parentRow.cells[0].firstElementChild.getAttribute('item-type')
            var price = 0;
            var amount = 1;
            // get quantity
            var nameAndQuantityCell = parentRow.cells[1];
            if (nameAndQuantityCell.childElementCount > 1) {
                amount = +nameAndQuantityCell.lastElementChild.textContent.match(/\d+/)[0];
            }
            // Cage Price
            if (itemType === 119) {
                price = window['cagePrice'];
            }
            // Actual price Per Item
            var actualPricePerItem = 0;
            if (amount > 1) {
                actualPricePerItem = +parentRow.cells[4].getAttribute('tooltip-data').match(/\d+.\d+/)[0]
            } else {
                actualPricePerItem = +parentRow.cells[4].textContent.match(/\d+/)[0];
            }

            // console.log('actual price per item, price', actualPricePerItem, price);

            if (amount * price === 0) {
                return;
            }
            // Set Amount into Price Cell
            if (actualPricePerItem < price) {
                clickedPriceBox.value = amount * price;
                clickedPriceBox.dispatchEvent(new Event('change'));
            } else {
                clickedPriceBox.style.background = 'red';
            }
        }
    }
})();
