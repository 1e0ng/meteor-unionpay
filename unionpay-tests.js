// Write your tests here!
// Here is an example.
Tinytest.add('ID verification', function (test) {
  var up = new UnionPay;
  var customerInfo = up.customerInfo({
    phoneNo: '13552535506',
    customerNm: '全渠道'
  });
  var params = {
    txnType: '72',
    txnSubType: '01',
    bizType: '000201',
    channelType: '07',
    orderId: moment().format('YYYYMMDDHHmmss'),
    txnTime: moment().format('YYYYMMDDHHmmss'),
    accNo: '6216261000000000018',
    customerInfo: customerInfo,
    relTxnType: '02',
    payCardType: '01'
  };

  up.build(params);
  var ret = up.request();
  test.equal(ret, true);
});
