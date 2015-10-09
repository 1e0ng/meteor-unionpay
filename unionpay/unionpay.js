// Write your package code here!
console.log('ok');
var result = HTTP.get('https://www.baidu.com/');
console.log(result.headers['content-length']);
console.log(Meteor.settings.UnionPay.encrypt.PAN);

///////////////////

function getSignP12() {
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
  return p12;
}

function getSignSN() {
  var p12 = getSignP12();
  var x509 = p12.getBags({bagType: forge.pki.oids.certBag});
  //console.log(forge.pki.oids['1.2.840.113549.1.12.10.1.2']);
  x509 = _.values(x509)[0][0];
  var sn = x509.cert.serialNumber;
  return sn;
};

function getSignFunc() {
  var p12 = getSignP12();
  //console.log(forge.pki.oids);
  var bag = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
  var ans = _.values(bag)[0][0].key.sign;
  return ans;
}

function customerInfo() {
  var ans = '{customerNm=全渠道}';
  ans = new Buffer(ans).toString('base64');
  return ans;
}

function accNo() {
  accNo = '6216261000000000018';
  return accNo;
}

function encryptCertId() {
  var pki = forge.pki;
  var certPath = Meteor.settings.UnionPay.encrypt.certPath;

  var fs = Npm.require('fs');
  var pem = fs.readFileSync(certPath);
  var cert = pki.certificateFromPem(pem);
  var sn = cert.serialNumber;
  //console.log(sn);
  return sn;
}

function obj2str(params) {
  var keys = _.keys(params).sort();
  var ans = '';
  _.each(keys, function(key) {
    ans += key + '=' + params[key] + '&';
  });
  ans = ans.slice(0, -1);
  return ans;
}

function sign(params) {
  var params_str = obj2str(params);
  var md = forge.md.sha1.create();
  md.update(params_str);
  var sha1 = md.digest().toHex();
  console.log(sha1);

  var signFunc = getSignFunc();
  var ans = signFunc(md);
  signature = new Buffer(ans).toString('base64');
  console.log(signature);
  params.signature = signature;
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
  accNo: accNo(),
  customerInfo: customerInfo(),
  reqReserved: '',
  reserved: '',
  riskRateInfo: '',
  encryptCertId: encryptCertId(),
  userMac: '',
  relTxnType: '02',
  payCardType: '01',
  issInsCode: ''
};

sign(params);

console.log(params);

result = HTTP.post(Meteor.settings.UnionPay.url.backEndRequest, {data: params, headers: {'Content-type': 'application/x-www-form-urlencoded', 'charset': 'UTF-8', timeout: 5000}});


console.log(result);
