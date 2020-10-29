(function() {

    var lvl1Color = '#c7e94f';
    var lvl2Color = '#24b4fd';
    var lvl3Color = '#f67300';

    function getAuctionTableRows() {
        return document.querySelectorAll('.auction table tbody tr');
    }

    function getRowItemType(row) {
        return row.querySelector('td i.heroItem')
            ? +row.querySelector('td i.heroItem').getAttribute('item-type')
            : 0;
    }

    function setRowColor(row, color) {
        row.querySelector('td').style.backgroundColor = color;
    }

    function getItemLevel(itemType) {
        if (!itemType || itemType < 4 || itemType > 111 && itemType < 121 || itemType > 123) {
            return null;
        }
        const mod3 = itemType % 3;
        // lvl1items = 4, 7, 10 ...
        // lvl2items = 5, 8, 11 ...
        // lvl3items = 6, 9, 12 ... 111
        // boots run = 121 122 123
        return mod3 === 0 ? 3 : mod3;
    }

    function performItemsCheck() {
        getAuctionTableRows().forEach(function(row) {
            switch (getItemLevel(getRowItemType(row))) {
                case 1: setRowColor(row, lvl1Color); break;
                case 2: setRowColor(row, lvl2Color); break;
                case 3: setRowColor(row, lvl3Color); break;
            }
        });
    }

    function doHelper() {
        if (getAuctionTableRows().length) {
            performItemsCheck();
        }
    }

    doHelper();

    setInterval(doHelper, 1000);
})();
