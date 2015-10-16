class UnionPay {
  constructor() {
    this._npmRequestOptions = {strictSSL: false, agentOptions: {secureProtocol: 'SSLv3_method',ciphers:'RC4:HIGH:!MD5:!aNULL:!EDH'}};
    this._params = {
      version: '5.0.0',
      encoding: 'UTF-8',
      certId: this._getSignSN(),
      signMethod: '01',
      txnType: '72',
      txnSubType: '01',
      bizType: '000201',
      channelType: '07',
      backUrl: Meteor.settings.UnionPay.url.trans,
      accessType: '0',
      merId: '777290058119350',
      orderId: moment().format('YYYYMMDDHHmmss'),
      txnTime: moment().format('YYYYMMDDHHmmss'),
      accType: '01',
      accNo: this._accNo(),
      customerInfo: this._customerInfo(),
      relTxnType: '02',
      payCardType: '01'
    };
  }
  build(params) {
    _.extend(this._params, params);
    this._sign(this._params);
  }
  request() {
    try {
      console.log(this._params);
      console.log(this._npmRequestOptions);
      result = HTTP.call('POST', Meteor.settings.UnionPay.url.trans, {timeout:6000, params: this._params, npmRequestOptions:this._npmRequestOptions});
      console.log(result);
      return true;
    } catch (e) {
      console.log(e.code);
      console.log(e.stack);
      return false;
    }
  }

  _hex2int(h) {
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
  _getSignSN() {
    var p12 = this._getP12();
    var x509 = p12.getBags({bagType: forge.pki.oids.certBag});
    x509 = _.values(x509)[0][0];
    var sn = x509.cert.serialNumber;
    sn = this._hex2int(sn);
    return sn;
  }

  _getPrivateKey() {
    var p12 = this._getP12();
    var bag = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
    var ans = _.values(bag)[0][0].key;
    return ans;
  }

  _customerInfo() {
    var ans = '{phoneNo=13552535506&customerNm=全渠道}';
    ans = new Buffer(ans).toString('base64');
    return ans;
  }

  _accNo() {
    accNo = '6216261000000000018';
    return accNo;
  }

  _encryptCertId() {
    var pki = forge.pki;
    var certPath = Meteor.settings.UnionPay.encrypt.certPath;

    var fs = Npm.require('fs');
    var pem = fs.readFileSync(certPath);
    var cert = pki.certificateFromPem(pem);
    var sn = cert.serialNumber;

    return sn;
  }

  _obj2str(params) {
    var keys = _.keys(params).sort();
    var ans = '';
    _.each(keys, function(key) {
      ans += key + '=' + params[key] + '&';
    });
    ans = ans.slice(0, -1);
    return ans;
  }

  _sign(params) {
    var params_str = this._obj2str(params);
    var md = forge.md.sha1.create();
    md.update(params_str);
    var sha1 = md.digest().toHex();

    md = forge.md.sha1.create();
    md.update(sha1);

    var privateKey = this._getPrivateKey();
    var ans = privateKey.sign(md);
    signature = forge.util.encode64(ans);

    params.signature = signature;
  }
  _getP12() {
    var certPath = Meteor.settings.UnionPay.sign.certPath;
    var password = Meteor.settings.UnionPay.sign.password;

    var fs = Npm.require('fs');
    var cert = fs.readFileSync(certPath);
    var p12b64 = forge.util.binary.base64.encode(new Uint8Array(cert));
    var p12Der = forge.util.decode64(p12b64);
    var p12Asn1 = forge.asn1.fromDer(p12Der);
    var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

    return p12;
  }

}

var up = new UnionPay;
up.build({});
up.request();
