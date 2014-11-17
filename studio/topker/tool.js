var output = [];
function searchAuctionList(items) {
    for(var i = 0;i<items.length; i++) {
        searchAuction(items[i], function(data) {
            output.push({
                title: data.title,
                image: data.image,
                clickUrl: data.clickUrl
            });
        })
    }
}

function searchAuction(url, callback) {
    var request = 'http://pub.alimama.com/pubauc/searchAuctionList.json?spm=a219t.7473494.1998155389.3.4HY3yM&q={0}&toPage=1&perPagesize=40&t=1416201970862&_tb_token_=VtQ6OQ6zern&_input_charset=utf-8';
    request = request.replace('{0}', encodeURIComponent(url));
    $.ajax({
        url: request
    }).done(function(result) {
        var data = result.data;
        if(data.pagelist.length > 0) {
            var prod = data.pagelist[0];
            getClickUrl(prod.auctionId, function(data) {
                callback && callback({
                    title: prod.title,
                    image: prod.pictUrl,
                    clickUrl: data.clickUrl
                });
            });
        }
        
    });
}

function getClickUrl(auctionId, callback) {
    var request = 'http://pub.alimama.com/common/code/getAuctionCode.json?auctionid={0}&adzoneid=14818311&siteid=4518477&t=1416202805603&_tb_token_=VtQ6OQ6zern&_input_charset=utf-8';
    request = request.replace('{0}', auctionId);
    $.ajax({
        url: request
    }).done(function(result) {
        var data = result.data;
        callback && callback(data);
    });
}

// searchAuction('http://item.taobao.com/item.htm?spm=0.0.0.0.IwOVnd&id=42273342638', getClickUrl);
// searchAuction('充电宝', getClickUrl);
searchAuctionList(['充电宝', 'http://item.taobao.com/item.htm?spm=0.0.0.0.IwOVnd&id=42273342638']);