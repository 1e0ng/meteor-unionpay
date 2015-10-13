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

function hex2int(h) {
  function carry(x) {
    var i = 0;
    while (i < x.length) {
      if (x[i] >= 10) {
        if (i + 1 === x.length) {
          x[i + 1] = 0;
        }
        x[i + 1] += parseInt(x[i] / 10);
        x[i] = parseInt(x[i] % 10);
      }
      ++i;
    }
  }
  function add(x, y) {
    x[0] += y;
    carry(x);
  }
  function mul(x, y) {
    for (var i = 0; i < x.length; ++i) {
      x[i] *= y;
    }
    carry(x);
  }
  ans = [0];
  for (var i = 0; i < h.length; ++i) {
    var t = parseInt(h[i], 16);
    mul(ans, 16);
    add(ans, t);
  }
  return ans.reverse().join('');
}

function getSignSN() {
  var p12 = getSignP12();
  var x509 = p12.getBags({bagType: forge.pki.oids.certBag});
  //console.log(forge.pki.oids['1.2.840.113549.1.12.10.1.2']);
  x509 = _.values(x509)[0][0];
  var sn = x509.cert.serialNumber;
  sn = hex2int(sn);
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
  console.log('encrypt cert id:');

  console.log(sn);
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

console.log('---------');
var sn = getSignSN();
console.log(sn);

var params = {
  version: '5.0.0',
  encoding: 'GBK',
  certId: sn,
  signMethod: '01',
  txnType: '72',
  txnSubType: '01',
  bizType: '000201',
  channelType: '07',
  frontUrl: Meteor.settings.UnionPay.url.frontEndRequest,
  backUrl: Meteor.settings.UnionPay.url.backEndRequest,
  accessType: '0',
  merId: '777290058119350',
  orderId: moment().format('YYYYMMDDHHmmss'),
  txnTime: moment().format('YYYYMMDDHHmmss'),
  accType: '01',
  accNo: accNo(),
  customerInfo: customerInfo(),
  relTxnType: '02',
  payCardType: '01',
};

sign(params);

function urlencode(params) {
  var keys = _.keys(params).sort();
  var ans = '';
  _.each(keys, function(key) {
    ans += key + '=' + encodeURIComponent(params[key]) + '&';
  });
  ans = ans.slice(0, -1);
  return ans;
}

try {
  result = HTTP.post(Meteor.settings.UnionPay.url.backEndRequest, {params: params, timeout:5000, npmRequestOptions:{strictSSL:false}});
  console.log(result);
} catch (e) {
  console.log(e);
  console.log(e.code);
  console.log(e.stack);
}

