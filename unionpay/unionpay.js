// Write your package code here!
console.log('ok');
var result = HTTP.get('https://www.baidu.com/');
console.log(result.headers['content-length']);
console.log(Meteor.settings.UnionPay.encrypt.PAN);

///////////////////

var getSignSN = function() {
  var certPath = Meteor.settings.UnionPay.sign.certPath;
  var password = Meteor.settings.UnionPay.sign.password;

  var fs = Npm.require('fs');
  //console.log(fs.dd
  var cert = fs.readFileSync(certPath);
  var p12b64 = forge.util.binary.base64.encode(new Uint8Array(cert));

  // decode p12 from base64
  var p12Der = forge.util.decode64(p12b64);
  // get p12 as ASN.1 object
  var p12Asn1 = forge.asn1.fromDer(p12Der);
  // decrypt p12 using non-strict parsing mode (resolves some ASN.1 parse errors)
  var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
  //console.log(p12);

  var x509 = p12.getBags({bagType: forge.pki.oids.certBag});
  x509 = _.values(x509)[0][0];
  //console.log(x509);

  var sn = x509.cert.serialNumber;
  console.log(sn);
  return sn;
};

var customerInfo = function() {
  return '';
}

var params = {
  version: '5.0.0',
  certId: getSignSN(),
  signMethod: '01',
  txnType: '72',
  txnSubType: '01',
  bizType: '000201',
  channelType: '07',
  frontUrl: Meteor.settings.UnionPay.url.frontEndRequest,
  backUrl: Meteor.settings.UnionPay.url.backEndRequest,
  accessType: '0',
  merId: '777290058119350',
  subMerId: '',
  subMerName: '',
  subMerAbbr: '',
  orderId: moment().format('YYYYMMDDHHmmss'),
  txnTime: moment().format('YYYYMMDDHHmmss'),
  accType: '01',
  accNo: '',
  customerInfo: customerInfo(),
  reqReserved: '',
  reserved: '',
  riskRateInfo: '',
  encryptCertId: '',
  userMac: '',
  bindId: '',
  relTxnType: '02',
  payCardType: '01',
  issInsCode: '',
  vpcTransData: ''
};

console.log(params);


