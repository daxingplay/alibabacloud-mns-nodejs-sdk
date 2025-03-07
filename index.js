var gitVersion={"branch":"master","rev":"136","hash":"4a28342","hash160":"4a2834281f2b4d862bcbfc0b55a050a19cf57c4b"};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// dependencies
var CryptoA = require("crypto");
var Events = require("events");
var Util = require("util");
var Url = require("url");
var UA = require("universal-analytics");
var debug = require("debug")("ali-mns");
var Promise = require("promise");
var Request = require("request");
Request['requestP'] = Promise.denodeify(Request);
Request['debug'] = false;
var Xml2js = require("xml2js");
Xml2js.parseStringP = Promise.denodeify(Xml2js.parseString);
var XmlBuilder = require("xmlbuilder");
/// <reference path="ali-mns.ts" />
var AliMNS;
/// <reference path="ali-mns.ts" />
(function (AliMNS) {
    // The Ali account, it holds the key id and secret.
    var Account = /** @class */ (function () {
        function Account(accountId, keyId, keySecret, stsToken) {
            this._bGoogleAnalytics = true; // Enable Google Analytics
            this._bHttps = false; // Default to use http
            this._accountId = accountId;
            this._keyId = keyId;
            this._keySecret = keySecret;
            this._stsToken = stsToken;
        }
        Account.prototype.getAccountId = function () { return this._accountId; };
        Account.prototype.getOwnerId = function () { return this._accountId; }; // for compatible v1.x
        Account.prototype.getKeyId = function () { return this._keyId; };
        Account.prototype.getStsToken = function () { return this._stsToken; };
        Account.prototype.getGA = function () { return this._bGoogleAnalytics; };
        Account.prototype.setGA = function (bGA) { this._bGoogleAnalytics = bGA; };
        Account.prototype.getHttps = function () { return this._bHttps; };
        Account.prototype.setHttps = function (bHttps) { this._bHttps = bHttps; };
        // encoding: "hex", "binary" or "base64"
        Account.prototype.hmac_sha1 = function (text, encoding) {
            var hmacSHA1 = CryptoA.createHmac("sha1", this._keySecret);
            return hmacSHA1.update(text).digest(encoding);
        };
        Account.prototype.b64md5 = function (text) {
            var cryptoMD5 = CryptoA.createHash("md5");
            return cryptoMD5.update(new Buffer(text, 'utf-8')).digest("base64");
        };
        return Account;
    }());
    AliMNS.Account = Account;
})(AliMNS || (AliMNS = {}));
var AliMNS;
(function (AliMNS) {
    var GA = /** @class */ (function () {
        function GA(accId) {
            this._bGoogleAnalytics = true;
            this._rgxAccId = /\/\/\w+\./;
            this._bAccumulated = false;
            this._bAccumulatePrefix = "";
            this._accumutionMax = 100;
            this._accumulation = {};
            this._gitMark = gitVersion.branch + "." + gitVersion.rev + "@" + gitVersion.hash;
            this._visitor = UA("UA-75293894-6", this.u2id(accId));
        }
        GA.prototype.send = function (action, value, url) {
            if (this._bGoogleAnalytics) {
                if (this._bAccumulated) {
                    // 累积多个一起发送
                    this._bAccumulated = false;
                    var actionPrefixed = this._bAccumulatePrefix + ":" + action;
                    if (!this._accumulation[actionPrefixed])
                        this._accumulation[actionPrefixed] = { value: 0, count: 0 };
                    this._accumulation[actionPrefixed].value += value;
                    this._accumulation[actionPrefixed].count++;
                    if (this._accumulation[actionPrefixed].count >= this._accumutionMax) {
                        this.send(actionPrefixed, this._accumulation[actionPrefixed].value, url);
                        this._accumulation[actionPrefixed].value = 0;
                        this._accumulation[actionPrefixed].count = 0;
                    }
                }
                else {
                    var args = { dl: url.replace(this._rgxAccId, "//0.") };
                    // catagory, action, label, value, params
                    this._visitor.event("AliMNS", action, this._gitMark, value, args).send();
                }
            }
        };
        GA.prototype.accumulateNextSend = function (prefix) {
            this._bAccumulated = true;
            this._bAccumulatePrefix = prefix;
        };
        GA.prototype.disableGA = function (bDisable) {
            this._bGoogleAnalytics = (!bDisable);
        };
        GA.prototype.u2id = function (uid) {
            var cryptoMD5 = CryptoA.createHash("md5");
            var md5HEX = cryptoMD5.update(uid).digest("hex");
            var uxid = new Array(36);
            for (var i = 0, j = 0; i < md5HEX.length; i++, j++) {
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uxid[j] = "-";
                    j++;
                }
                uxid[j] = md5HEX.charAt(i);
            }
            return uxid.join("");
        };
        return GA;
    }());
    AliMNS.GA = GA;
})(AliMNS || (AliMNS = {}));
var AliMNS;
(function (AliMNS) {
    // The Message class
    var Msg = /** @class */ (function () {
        function Msg(msg, priority, delaySeconds) {
            // message priority
            this._priority = 8;
            // message delay to visible, in seconds
            this._delaySeconds = 0;
            this._msg = msg;
            if (!isNaN(priority))
                this._priority = priority;
            if (!isNaN(delaySeconds))
                this._delaySeconds = delaySeconds;
        }
        Msg.prototype.getMsg = function () { return this._msg; };
        Msg.prototype.getPriority = function () { return this._priority; };
        Msg.prototype.getDelaySeconds = function () { return this._delaySeconds; };
        return Msg;
    }());
    AliMNS.Msg = Msg;
})(AliMNS || (AliMNS = {}));
/// <reference path="Msg.ts" />
// The Ali open interface stack
/// <reference path="ali-mns.ts" />
/// <reference path="Account.ts" />
var AliMNS;
// The Ali open interface stack
/// <reference path="ali-mns.ts" />
/// <reference path="Account.ts" />
(function (AliMNS) {
    // the ali open interface stack protocol
    var OpenStack = /** @class */ (function () {
        function OpenStack(account) {
            this._patternMNS = "MNS %s:%s";
            this._patternSign = "%s\n%s\n%s\n%s\n%s%s";
            this._contentType = "text/xml;charset=utf-8";
            this._version = "2015-06-06";
            this._gaRGA = 0; // Reduce Google Analysis sending rate
            this._account = account;
            // xml builder
            this._xmlBuilder = XmlBuilder;
            // Google Analytics
            this._ga = new AliMNS.GA(account.getAccountId());
            this._ga.disableGA(!account.getGA());
        }
        // Send the request
        // method: GET, POST, PUT, DELETE
        // url: request url
        // body: optional, request body
        // head: optional, request heads
        // options: optional, request options
        OpenStack.prototype.sendP = function (method, url, body, headers, options) {
            var req = { method: method, url: url };
            if (body)
                req.body = this._xmlBuilder.create(body).toString();
            req.headers = this.makeHeaders(method, url, headers, req.body);
            // combines options
            if (options) {
                for (var opt in options) {
                    if (opt === "method" || opt === "url" || opt === "uri" || opt === "body" || opt === "headers")
                        continue; // skip these options for avoid conflict to other arguments
                    else if (options.hasOwnProperty(opt))
                        req[opt] = options[opt];
                }
            }
            var ret = Request['requestP'](req).then(function (response) {
                // convert the body from xml to json
                return Xml2js.parseStringP(response.body, { explicitArray: false })
                    .then(function (bodyJSON) {
                    response.bodyJSON = bodyJSON;
                    return response;
                }, function () {
                    // cannot parse as xml
                    response.bodyJSON = response.body;
                    return response;
                });
            }).then(function (response) {
                if (response.statusCode < 400) {
                    if (response.bodyJSON)
                        return response.bodyJSON;
                    else
                        return response.statusCode;
                }
                else {
                    if (response.bodyJSON)
                        return Promise.reject(response.bodyJSON);
                    else
                        return Promise.reject(response.statusCode);
                }
            });
            // google analytics
            if (this._gaRGA % 1000000 == 0)
                this._ga.send("OpenStack.sendP", this._gaRGA, url);
            this._gaRGA++;
            return ret;
        };
        OpenStack.prototype.accumulateNextGASend = function (prefix) {
            this._ga.accumulateNextSend(prefix);
        };
        OpenStack.prototype.disableGA = function (bDisable) {
            this._ga.disableGA(bDisable);
        };
        OpenStack.prototype.makeHeaders = function (mothod, url, headers, body) {
            // if not exist, create one
            if (!headers)
                headers = {
                    "User-Agent": "Node/" + process.version + " (" + process.platform + ")"
                };
            var contentMD5 = "";
            var contentType = "";
            if (body) {
                if (!headers["Content-Length"])
                    headers["Content-Length"] = (new Buffer(body, 'utf-8')).length;
                if (!headers["Content-Type"])
                    headers["Content-Type"] = this._contentType;
                contentType = headers["Content-Type"];
                contentMD5 = this._account.b64md5(body);
                headers["Content-MD5"] = contentMD5;
            }
            // `Date` & `Host` will be added by request automatically
            if (!headers["x-mns-version"])
                headers["x-mns-version"] = this._version;
            // lowercase & sort & extract the x-mns-<any>
            var headsLower = {};
            var keys = [];
            for (var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    var lower = key.toLowerCase();
                    keys.push(lower);
                    headsLower[lower] = headers[key];
                }
            }
            keys.sort();
            var mnsHeaders = "";
            for (var i in keys) {
                var k = keys[i];
                if (typeof k === "string" && k.indexOf("x-mns-") === 0) {
                    mnsHeaders += Util.format("%s:%s\n", k, headsLower[k]);
                }
            }
            var tm = (new Date()).toUTCString();
            var mnsURL = Url.parse(url);
            headers.Date = tm;
            headers.Authorization = this.authorize(mothod, mnsURL.path, mnsHeaders, contentType, contentMD5, tm);
            headers.Host = mnsURL.host;
            // set STS Token headers
            if (!!this._account.getStsToken()) {
                headers["security-token"] = this._account.getStsToken();
            }
            return headers;
        };
        // ali mns authorize header
        OpenStack.prototype.authorize = function (httpVerb, mnsURI, mnsHeaders, contentType, contentMD5, tm) {
            return Util.format(this._patternMNS, this._account.getKeyId(), this.signature(httpVerb, mnsURI, mnsHeaders, contentType, contentMD5, tm));
        };
        // ali mns signature
        OpenStack.prototype.signature = function (httpVerb, mnsURI, mnsHeaders, contentType, contentMD5, tm) {
            var text = Util.format(this._patternSign, httpVerb, contentMD5, contentType, tm, mnsHeaders, mnsURI);
            return this._account.hmac_sha1(text, "base64");
        };
        return OpenStack;
    }());
    AliMNS.OpenStack = OpenStack;
})(AliMNS || (AliMNS = {}));
var AliMNS;
(function (AliMNS) {
    var Region = /** @class */ (function () {
        function Region(city, network, zone) {
            // cn,ap,eu,us,me -> China, Asia Pacific, Europe, Unite State, Middle East
            this._zone = "cn";
            // cn: hangzhou, beijing, qingdao, shanghai, shenzhen,
            // ap: northeast-1[Tokyo], southeast-1[Singapore], southeast-2[Sydney]
            // eu: central-1[Frankfurt]
            // us: west-1[Silicon Valley], west-2[Virginia]
            // me: east-1[Dubai]
            this._city = "hangzhou";
            // public-internal-vpc
            this._network = "";
            // pattern
            this._pattern = "%s-%s%s";
            // region string
            this._region = "cn-hangzhou";
            if (network) {
                if (typeof network === "string")
                    this._network = network;
                else
                    this._network = this.networkToString(network);
            }
            if (zone) {
                if (typeof zone === "string")
                    this._zone = zone;
                else
                    this._zone = this.zoneToString(zone);
            }
            if (city) {
                if (typeof city === "string")
                    this._city = city;
                else {
                    this._city = this.cityToString(city);
                    this._zone = this.cityToZone(city);
                }
            }
            this.buildString();
        }
        Region.prototype.buildString = function () {
            // like "ap-southeast-2-internal-vpc"
            this._region = Util.format(this._pattern, this._zone, this._city, this._network);
        };
        Region.prototype.toString = function () {
            return this._region;
        };
        Region.prototype.networkToString = function (network) {
            var value;
            switch (network) {
                case NetworkType.Public:
                    value = "";
                    break;
                case NetworkType.Internal:
                    value = "-internal";
                    break;
                case NetworkType.VPC:
                    value = "-internal-vpc";
                    break;
                default: throw new Error("Unsupported network type value: " + network);
            }
            return value;
        };
        Region.prototype.zoneToString = function (zone) {
            var value;
            switch (zone) {
                case Zone.China:
                    value = "cn";
                    break;
                case Zone.AsiaPacific:
                    value = "ap";
                    break;
                case Zone.UniteState:
                    value = "us";
                    break;
                case Zone.Europe:
                    value = "eu";
                    break;
                case Zone.MiddleEast:
                    value = "me";
                    break;
                default: throw new Error("Unsupported zone value: " + zone);
            }
            return value;
        };
        Region.prototype.cityToString = function (city) {
            var value;
            switch (city) {
                case City.Beijing:
                    value = "beijing";
                    break;
                case City.Shanghai:
                    value = "shanghai";
                    break;
                case City.Qingdao:
                    value = "qingdao";
                    break;
                case City.Hangzhou:
                    value = "hangzhou";
                    break;
                case City.Shenzhen:
                    value = "shenzhen";
                    break;
                case City.Hongkong:
                    value = "hongkong";
                    break;
                case City.Tokyo:
                    value = "northeast-1";
                    break;
                case City.Singapore:
                    value = "southeast-1";
                    break;
                case City.Sydney:
                    value = "southeast-2";
                    break;
                case City.Frankfurt:
                    value = "central-1";
                    break;
                case City.SiliconValley:
                    value = "west-1";
                    break;
                case City.Virginia:
                    value = "east-1";
                    break;
                case City.Dubai:
                    value = "east-1";
                    break;
                default: throw new Error("Unsupported city value: " + city);
            }
            return value;
        };
        Region.prototype.cityToZone = function (city) {
            var value;
            switch (city) {
                case City.Beijing:
                case City.Shanghai:
                case City.Qingdao:
                case City.Hangzhou:
                case City.Shenzhen:
                    value = "cn";
                    break;
                case City.Hongkong:
                    value = "cn";
                    break;
                case City.Tokyo:
                case City.Singapore:
                case City.Sydney:
                    value = "ap";
                    break;
                case City.Frankfurt:
                    value = "eu";
                    break;
                case City.SiliconValley:
                case City.Virginia:
                    value = "us";
                    break;
                case City.Dubai:
                    value = "me";
                    break;
                default:
                    throw new Error("Unsupported city value: " + city);
            }
            return value;
        };
        return Region;
    }());
    AliMNS.Region = Region;
    var NetworkType;
    (function (NetworkType) {
        NetworkType[NetworkType["Public"] = 0] = "Public";
        NetworkType[NetworkType["Internal"] = 1] = "Internal";
        NetworkType[NetworkType["VPC"] = 2] = "VPC";
    })(NetworkType = AliMNS.NetworkType || (AliMNS.NetworkType = {}));
    var Zone;
    (function (Zone) {
        Zone[Zone["China"] = 0] = "China";
        Zone[Zone["AsiaPacific"] = 1] = "AsiaPacific";
        Zone[Zone["Europe"] = 2] = "Europe";
        Zone[Zone["UniteState"] = 3] = "UniteState";
        Zone[Zone["MiddleEast"] = 4] = "MiddleEast";
    })(Zone = AliMNS.Zone || (AliMNS.Zone = {}));
    var Area;
    (function (Area) {
        Area[Area["UniteState"] = 1] = "UniteState";
        Area[Area["Germany"] = 49] = "Germany";
        Area[Area["Australia"] = 61] = "Australia";
        Area[Area["Singapore"] = 65] = "Singapore";
        Area[Area["Japan"] = 81] = "Japan";
        Area[Area["China"] = 86] = "China";
        Area[Area["Hongkong"] = 852] = "Hongkong";
        Area[Area["UnitedArabEmirates"] = 971] = "UnitedArabEmirates";
    })(Area = AliMNS.Area || (AliMNS.Area = {}));
    var City;
    (function (City) {
        // China
        City[City["Beijing"] = 5636106] = "Beijing";
        City[City["Shanghai"] = 5636117] = "Shanghai";
        City[City["Qingdao"] = 5636628] = "Qingdao";
        City[City["Hangzhou"] = 5636667] = "Hangzhou";
        City[City["Shenzhen"] = 5636851] = "Shenzhen";
        City[City["Hongkong"] = 55836672] = "Hongkong";
        // AsiaPacific
        City[City["Tokyo"] = 5308419] = "Tokyo";
        City[City["Singapore"] = 4259840] = "Singapore";
        City[City["Sydney"] = 3997698] = "Sydney";
        // Europe
        City[City["Frankfurt"] = 3211599] = "Frankfurt";
        // UniteState
        City[City["SiliconValley"] = 65951] = "SiliconValley";
        City[City["Virginia"] = 66107] = "Virginia";
        // MiddleEast
        City[City["Dubai"] = 63635460] = "Dubai";
    })(City = AliMNS.City || (AliMNS.City = {}));
})(AliMNS || (AliMNS = {}));
/// <reference path="Interfaces.ts" />
/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />
/// <reference path="Region.ts" />
var AliMNS;
/// <reference path="Interfaces.ts" />
/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />
/// <reference path="Region.ts" />
(function (AliMNS) {
    // The MNS can list, create, delete, modify the mq.
    var MNS = /** @class */ (function () {
        // The constructor. account: ali account; region: can be "hangzhou", "beijing" or "qingdao", default is "hangzhou"
        function MNS(account, region) {
            this._region = new AliMNS.Region(AliMNS.City.Hangzhou);
            this._pattern = "%s://%s.mns.%s.aliyuncs.com/queues/";
            // save the input arguments
            this._account = account;
            // region
            if (region) {
                if (typeof region === "string")
                    this._region = new AliMNS.Region(region, AliMNS.NetworkType.Public, AliMNS.Zone.China);
                else
                    this._region = region;
            }
            // make url
            this._url = this.makeURL();
            // create the OpenStack object
            this._openStack = new AliMNS.OpenStack(account);
        }
        // List all mns.
        MNS.prototype.listP = function (prefix, pageSize, pageMarker) {
            var headers = {};
            if (prefix)
                headers["x-mns-prefix"] = prefix;
            if (pageMarker)
                headers["x-mns-marker"] = pageMarker;
            if (pageSize)
                headers["x-mns-ret-number"] = pageSize;
            var url = this._url.slice(0, -1);
            debug("GET " + url);
            return this._openStack.sendP("GET", url, null, headers);
        };
        // Create a message queue
        MNS.prototype.createP = function (name, options) {
            var body = { Queue: "" };
            if (options)
                body.Queue = options;
            var url = Url.resolve(this._url, name);
            debug("PUT " + url, body);
            return this._openStack.sendP("PUT", url, body);
        };
        // Delete a message queue
        MNS.prototype.deleteP = function (name) {
            var url = Url.resolve(this._url, name);
            debug("DELETE " + url);
            return this._openStack.sendP("DELETE", url);
        };
        MNS.prototype.makeURL = function () {
            return Util.format(this._pattern, this._account.getHttps() ? "https" : "http", this._account.getAccountId(), this._region.toString());
        };
        return MNS;
    }());
    AliMNS.MNS = MNS;
    // For compatible v1.x
    AliMNS.MQS = MNS;
})(AliMNS || (AliMNS = {}));
/// <reference path="Interfaces.ts" />
/// <reference path="Region.ts" />
var AliMNS;
/// <reference path="Interfaces.ts" />
/// <reference path="Region.ts" />
(function (AliMNS) {
    var MNSTopic = /** @class */ (function (_super) {
        __extends(MNSTopic, _super);
        function MNSTopic(account, region) {
            var _this = _super.call(this, account, region) || this;
            _this._patternTopic = "%s://%s.mns.%s.aliyuncs.com/topics/";
            // make url
            _this._urlTopic = _this.makeTopicURL();
            return _this;
        }
        // List all topics.
        MNSTopic.prototype.listTopicP = function (prefix, pageSize, pageMarker) {
            var headers = {};
            if (prefix)
                headers["x-mns-prefix"] = prefix;
            if (pageMarker)
                headers["x-mns-marker"] = pageMarker;
            if (pageSize)
                headers["x-mns-ret-number"] = pageSize;
            var url = this._urlTopic.slice(0, -1);
            debug("GET " + url);
            return this._openStack.sendP("GET", url, null, headers);
        };
        // Create a topic
        MNSTopic.prototype.createTopicP = function (name, options) {
            var body = { Topic: "" };
            if (options)
                body.Topic = options;
            var url = Url.resolve(this._urlTopic, name);
            debug("PUT " + url, body);
            return this._openStack.sendP("PUT", url, body);
        };
        // Delete a topic
        MNSTopic.prototype.deleteTopicP = function (name) {
            var url = Url.resolve(this._urlTopic, name);
            debug("DELETE " + url);
            return this._openStack.sendP("DELETE", url);
        };
        MNSTopic.prototype.makeTopicURL = function () {
            return Util.format(this._patternTopic, this._account.getHttps() ? "https" : "http", this._account.getAccountId(), this._region.toString());
        };
        return MNSTopic;
    }(AliMNS.MNS));
    AliMNS.MNSTopic = MNSTopic;
})(AliMNS || (AliMNS = {}));
/// <reference path="Interfaces.ts" />
/// <reference path="ali-mns.ts" />
var AliMNS;
/// <reference path="Interfaces.ts" />
/// <reference path="ali-mns.ts" />
(function (AliMNS) {
    var NotifyRecv = /** @class */ (function () {
        function NotifyRecv(mq) {
            this._signalSTOP = true;
            this._evStopped = "AliMNS_MQ_NOTIFY_STOPPED";
            // 连续timeout计数器
            // 在某种未知的原因下,网络底层链接断了
            // 这时在程序内部的重试无法促使网络重连,以后的重试都是徒劳的
            // 如果连续发生反复重试都依然timeout,那么极有可能已经发生此种情况了
            // 这时抛出NetworkBroken异常
            this._timeoutCount = 0;
            this._timeoutMax = 128;
            this._ga = null;
            this._mq = mq;
            // emitter
            this._emitter = new Events.EventEmitter();
            // Google Analytics
            if (mq instanceof AliMNS.MQ) {
                var account = mq.getAccount();
                this._ga = new AliMNS.GA(account.getAccountId());
                this._ga.disableGA(!account.getGA());
            }
        }
        // 消息通知.每当有消息收到时,都调用cb回调函数
        // 如果cb返回true,那么将删除消息,否则保留消息
        NotifyRecv.prototype.notifyRecv = function (cb, waitSeconds, numOfMessages) {
            this._signalSTOP = false;
            this._timeoutCount = 0;
            this.notifyRecvInternal(cb, waitSeconds, numOfMessages);
            // Google Analytics
            if (this._ga)
                this._ga.send("NotifyRecv.notifyRecv", 0, "");
        };
        // 停止消息通知
        NotifyRecv.prototype.notifyStopP = function () {
            var _this = this;
            if (this._signalSTOP)
                return Promise.resolve(this._evStopped);
            // Google Analytics
            if (this._ga)
                this._ga.send("NotifyRecv.notifyStopP", 0, "");
            this._signalSTOP = true;
            return new Promise(function (resolve) {
                _this._emitter.once(_this._evStopped, function () {
                    resolve(_this._evStopped);
                });
            });
        };
        NotifyRecv.prototype.notifyRecvInternal = function (cb, waitSeconds, numOfMessages) {
            var _this = this;
            // This signal will be triggered by notifyStopP()
            if (this._signalSTOP) {
                debug("notifyStopped");
                this._emitter.emit(this._evStopped);
                return;
            }
            debug("notifyRecvInternal()");
            try {
                var mqBatch = this._mq;
                mqBatch.recvP(waitSeconds, numOfMessages).done(function (dataRecv) {
                    try {
                        debug(dataRecv);
                        _this._timeoutCount = 0;
                        if (cb(null, dataRecv)) {
                            _this.deleteP(dataRecv)
                                .done(null, function (ex) {
                                console.log(ex);
                            });
                        }
                    }
                    catch (ex) {
                        // ignore any ex throw from cb
                        console.warn(ex);
                    }
                    _this.notifyRecvInternal(cb, waitSeconds, numOfMessages);
                }, function (ex) {
                    debug(ex);
                    if ((!ex.Error) || (ex.Error.Code !== "MessageNotExist")) {
                        cb(ex, null);
                    }
                    if (ex) {
                        if (ex.message === "timeout") {
                            _this._timeoutCount++;
                            if (_this._timeoutCount > _this._timeoutMax) {
                                // 极度可能网络底层断了
                                cb(new Error("NetworkBroken"), null);
                            }
                        }
                        else if (ex.Error && ex.Error.Code === "MessageNotExist") {
                            _this._timeoutCount = 0;
                        }
                    }
                    process.nextTick(function () {
                        _this.notifyRecvInternal(cb, waitSeconds, numOfMessages);
                    });
                });
            }
            catch (ex) {
                // ignore any ex 
                console.warn(ex);
                // 过5秒重试
                debug("Retry after 5 seconds");
                setTimeout(function () {
                    _this.notifyRecvInternal(cb, waitSeconds, numOfMessages);
                }, 5000);
            }
        };
        NotifyRecv.prototype.deleteP = function (dataRecv) {
            if (dataRecv) {
                if (dataRecv.Message) {
                    return this._mq.deleteP(dataRecv.Message.ReceiptHandle);
                }
                else if (dataRecv.Messages && dataRecv.Messages.Message) {
                    var rhs = [];
                    for (var i = 0; i < dataRecv.Messages.Message.length; i++) {
                        rhs.push(dataRecv.Messages.Message[i].ReceiptHandle);
                    }
                    var mqBatch = this._mq;
                    return mqBatch.deleteP(rhs);
                }
                else {
                    return Promise.resolve(dataRecv);
                }
            }
            else {
                return Promise.resolve(dataRecv);
            }
        };
        return NotifyRecv;
    }());
    AliMNS.NotifyRecv = NotifyRecv;
})(AliMNS || (AliMNS = {}));
/// <reference path="Interfaces.ts" />
/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />
/// <reference path="NotifyRecv.ts" />
/// <reference path="Region.ts" />
var AliMNS;
/// <reference path="Interfaces.ts" />
/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />
/// <reference path="NotifyRecv.ts" />
/// <reference path="Region.ts" />
(function (AliMNS) {
    // The MQ
    var MQ = /** @class */ (function () {
        // The constructor. name & account is required.
        // region can be "hangzhou", "beijing" or "qingdao", the default is "hangzhou"
        function MQ(name, account, region) {
            this._notifyRecv = null;
            this._recvTolerance = 5; // 接收消息的容忍时间(单位:秒)
            this._region = new AliMNS.Region(AliMNS.City.Hangzhou);
            this._pattern = "%s://%s.mns.%s.aliyuncs.com/queues/%s";
            this._name = name;
            this._account = account;
            // region
            if (region) {
                if (typeof region === "string")
                    this._region = new AliMNS.Region(region, AliMNS.NetworkType.Public, AliMNS.Zone.China);
                else
                    this._region = region;
            }
            // make url
            this._urlAttr = this.makeAttrURL();
            this._url = this.makeURL();
            // create the OpenStack object
            this._openStack = new AliMNS.OpenStack(account);
        }
        MQ.prototype.getName = function () { return this._name; };
        MQ.prototype.getAccount = function () { return this._account; };
        MQ.prototype.getRegion = function () { return this._region; };
        // 获取MQ的属性值
        MQ.prototype.getAttrsP = function () {
            debug("GET " + this._urlAttr);
            return this._openStack.sendP("GET", this._urlAttr);
        };
        // 设置MQ的属性值
        MQ.prototype.setAttrsP = function (options) {
            var body = { Queue: options };
            debug("PUT " + this._urlAttr, body);
            return this._openStack.sendP("PUT", this._urlAttr + "?metaoverride=true", body);
        };
        // 发送消息
        MQ.prototype.sendP = function (msg, priority, delaySeconds) {
            var b64 = this.utf8ToBase64(msg);
            var body = { Message: { MessageBody: b64 } };
            if (!isNaN(priority))
                body.Message.Priority = priority;
            if (!isNaN(delaySeconds))
                body.Message.DelaySeconds = delaySeconds;
            debug("POST " + this._url, body);
            this._openStack.accumulateNextGASend("MQ.sendP");
            return this._openStack.sendP("POST", this._url, body);
        };
        // 接收消息容忍时间(秒)
        MQ.prototype.getRecvTolerance = function () { return this._recvTolerance; };
        MQ.prototype.setRecvTolerance = function (value) { this._recvTolerance = value; };
        // 接收消息
        // waitSeconds, 最久等待多少秒0~30
        MQ.prototype.recvP = function (waitSeconds) {
            var _this = this;
            var url = this._url;
            if (waitSeconds)
                url += "?waitseconds=" + waitSeconds;
            debug("GET " + url);
            return new Promise(function (resolve, reject) {
                // use the timeout mechanism inside the request module
                var options = { timeout: 1000 * _this._recvTolerance };
                if (waitSeconds)
                    options.timeout += (1000 * waitSeconds);
                _this._openStack.accumulateNextGASend("MQ.recvP");
                _this._openStack.sendP("GET", url, null, null, options).done(function (data) {
                    debug(data);
                    if (data && data.Message && data.Message.MessageBody) {
                        data.Message.MessageBody = _this.base64ToUtf8(data.Message.MessageBody);
                    }
                    resolve(data);
                }, function (ex) {
                    // for compatible with 1.x, still use literal "timeout"
                    if (ex.code === "ETIMEDOUT") {
                        var exTimeout = new Error("timeout");
                        exTimeout.innerException = ex;
                        exTimeout.code = ex.code;
                        reject(exTimeout);
                    }
                    else {
                        reject(ex);
                    }
                });
            });
        };
        // 检查消息
        MQ.prototype.peekP = function () {
            var _this = this;
            var url = this._url + "?peekonly=true";
            debug("GET " + url);
            this._openStack.accumulateNextGASend("MQ.peekP");
            return this._openStack.sendP("GET", url).then(function (data) {
                debug(data);
                _this.decodeB64Messages(data);
                return data;
            });
        };
        // 删除消息
        MQ.prototype.deleteP = function (receiptHandle) {
            var url = this._url + "?ReceiptHandle=" + receiptHandle;
            debug("DELETE " + url);
            this._openStack.accumulateNextGASend("MQ.deleteP");
            return this._openStack.sendP("DELETE", url);
        };
        // 保留消息
        MQ.prototype.reserveP = function (receiptHandle, reserveSeconds) {
            var url = this._url
                + "?ReceiptHandle=" + receiptHandle
                + "&VisibilityTimeout=" + reserveSeconds;
            debug("PUT " + url);
            this._openStack.accumulateNextGASend("MQ.reserveP");
            return this._openStack.sendP("PUT", url);
        };
        // 消息通知.每当有消息收到时,都调用cb回调函数
        // 如果cb返回true,那么将删除消息,否则保留消息
        MQ.prototype.notifyRecv = function (cb, waitSeconds) {
            // lazy create
            if (this._notifyRecv === null)
                this._notifyRecv = new AliMNS.NotifyRecv(this);
            return this._notifyRecv.notifyRecv(cb, waitSeconds || 5);
        };
        // 停止消息通知
        MQ.prototype.notifyStopP = function () {
            if (this._notifyRecv === null)
                return Promise.resolve(0);
            else
                return this._notifyRecv.notifyStopP();
        };
        MQ.prototype.utf8ToBase64 = function (src) {
            var buf = new Buffer(src, 'utf8');
            return buf.toString('base64');
        };
        MQ.prototype.base64ToUtf8 = function (src) {
            var buf = new Buffer(src, 'base64');
            return buf.toString('utf8');
        };
        MQ.prototype.decodeB64Messages = function (data) {
            if (data && data.Message && data.Message.MessageBody) {
                data.Message.MessageBody = this.base64ToUtf8(data.Message.MessageBody);
            }
        };
        MQ.prototype.makeAttrURL = function () {
            return Util.format(this._pattern, this._account.getHttps() ? "https" : "http", this._account.getAccountId(), this._region.toString(), this._name);
        };
        MQ.prototype.makeURL = function () {
            return this.makeAttrURL() + "/messages";
        };
        return MQ;
    }());
    AliMNS.MQ = MQ;
})(AliMNS || (AliMNS = {}));
/// <reference path="MQ.ts" />
/// <reference path="Msg.ts" />
/// <reference path="Interfaces.ts" />
var AliMNS;
/// <reference path="MQ.ts" />
/// <reference path="Msg.ts" />
/// <reference path="Interfaces.ts" />
(function (AliMNS) {
    var MQBatch = /** @class */ (function (_super) {
        __extends(MQBatch, _super);
        function MQBatch(name, account, region) {
            var _this = _super.call(this, name, account, region) || this;
            _this._notifyRecv = null;
            return _this;
        }
        MQBatch.prototype.sendP = function (msg, priority, delaySeconds) {
            if (typeof msg === "string") {
                return _super.prototype.sendP.call(this, msg, priority, delaySeconds);
            }
            else {
                var body = { Messages: { '#list': [] } };
                for (var i = 0; i < msg.length; i++) {
                    var m = msg[i];
                    var b64 = this.utf8ToBase64(m.getMsg());
                    var xMsg = { Message: { MessageBody: b64 } };
                    xMsg.Message.Priority = m.getPriority();
                    xMsg.Message.DelaySeconds = m.getDelaySeconds();
                    body.Messages['#list'].push(xMsg);
                }
                debug("POST " + this._url, body);
                this._openStack.accumulateNextGASend("MQBatch.sendP");
                return this._openStack.sendP("POST", this._url, body);
            }
        };
        MQBatch.prototype.recvP = function (waitSeconds, numOfMessages) {
            if (numOfMessages === undefined)
                numOfMessages = 16;
            if (numOfMessages && numOfMessages > 1) {
                var self = this;
                var url = this._url;
                url += "?numOfMessages=" + numOfMessages;
                if (waitSeconds)
                    url += "&waitseconds=" + waitSeconds;
                debug("GET " + url);
                return new Promise(function (resolve, reject) {
                    // use the timeout mechanism inside the request module
                    var options = { timeout: 1000 * self._recvTolerance };
                    if (waitSeconds)
                        options.timeout += (1000 * waitSeconds);
                    self._openStack.accumulateNextGASend("MQBatch.recvP");
                    self._openStack.sendP("GET", url, null, null, options).done(function (data) {
                        debug(data);
                        self.decodeB64Messages(data);
                        resolve(data);
                    }, function (ex) {
                        // for compatible with 1.x, still use literal "timeout"
                        if (ex.code === "ETIMEDOUT") {
                            var exTimeout = new Error("timeout");
                            exTimeout.innerException = ex;
                            exTimeout.code = ex.code;
                            reject(exTimeout);
                        }
                        else {
                            reject(ex);
                        }
                    });
                });
            }
            else {
                return _super.prototype.recvP.call(this, waitSeconds);
            }
        };
        MQBatch.prototype.peekP = function (numOfMessages) {
            if (numOfMessages === undefined)
                numOfMessages = 16;
            if (numOfMessages && numOfMessages > 1) {
                var self = this;
                var url = this._url + "?peekonly=true";
                url += "&numOfMessages=" + numOfMessages;
                debug("GET " + url);
                this._openStack.accumulateNextGASend("MQBatch.peekP");
                return this._openStack.sendP("GET", url).then(function (data) {
                    debug(data);
                    self.decodeB64Messages(data);
                    return data;
                });
            }
            else {
                return _super.prototype.peekP.call(this);
            }
        };
        MQBatch.prototype.deleteP = function (receiptHandle) {
            if (typeof receiptHandle === "string") {
                _super.prototype.deleteP.call(this, receiptHandle);
            }
            else {
                debug("DELETE " + this._url, receiptHandle);
                var body = { ReceiptHandles: { '#list': [] } };
                for (var i = 0; i < receiptHandle.length; i++) {
                    var r = { ReceiptHandle: receiptHandle[i] };
                    body.ReceiptHandles['#list'].push(r);
                }
                this._openStack.accumulateNextGASend("MQBatch.deleteP");
                return this._openStack.sendP("DELETE", this._url, body);
            }
        };
        // 消息通知.每当有消息收到时,都调用cb回调函数
        // 如果cb返回true,那么将删除消息,否则保留消息
        MQBatch.prototype.notifyRecv = function (cb, waitSeconds, numOfMessages) {
            // lazy create
            if (this._notifyRecv === null)
                this._notifyRecv = new AliMNS.NotifyRecv(this);
            return this._notifyRecv.notifyRecv(cb, waitSeconds || 5, numOfMessages || 16);
        };
        MQBatch.prototype.decodeB64Messages = function (data) {
            if (data && data.Messages && data.Messages.Message) {
                if (!Util.isArray(data.Messages.Message)) {
                    // Just a single message, use an array to hold it
                    var msg = data.Messages.Message;
                    data.Messages.Message = [msg];
                }
                for (var i = 0; i < data.Messages.Message.length; i++) {
                    var msg = data.Messages.Message[i];
                    if (msg.MessageBody)
                        msg.MessageBody = this.base64ToUtf8(msg.MessageBody);
                }
            }
            else {
                _super.prototype.decodeB64Messages.call(this, data);
            }
        };
        return MQBatch;
    }(AliMNS.MQ));
    AliMNS.MQBatch = MQBatch;
})(AliMNS || (AliMNS = {}));
/// <reference path="Interfaces.ts" />
/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />
/// <reference path="Region.ts" />
var AliMNS;
/// <reference path="Interfaces.ts" />
/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />
/// <reference path="Region.ts" />
(function (AliMNS) {
    // The Topic
    var Topic = /** @class */ (function () {
        // The constructor. name & account is required.
        // region can be "hangzhou", "beijing" or "qingdao", the default is "hangzhou"
        function Topic(name, account, region) {
            this._region = new AliMNS.Region(AliMNS.City.Hangzhou);
            this._pattern = "%s://%s.mns.%s.aliyuncs.com/topics/%s";
            this._name = name;
            this._account = account;
            // region
            if (region) {
                if (typeof region === "string")
                    this._region = new AliMNS.Region(region, AliMNS.NetworkType.Public, AliMNS.Zone.China);
                else
                    this._region = region;
            }
            // make url
            this._urlAttr = this.makeAttrURL();
            this._urlSubscription = this.makeSubscriptionURL();
            this._urlPublish = this.makePublishURL();
            // create the OpenStack object
            this._openStack = new AliMNS.OpenStack(account);
        }
        Topic.prototype.getName = function () { return this._name; };
        Topic.prototype.getAccount = function () { return this._account; };
        Topic.prototype.getRegion = function () { return this._region; };
        // 获取Topic的属性值
        Topic.prototype.getAttrsP = function () {
            debug("GET " + this._urlAttr);
            return this._openStack.sendP("GET", this._urlAttr);
        };
        // 设置Topic的属性值
        Topic.prototype.setAttrsP = function (options) {
            var body = { Topic: options };
            debug("PUT " + this._urlAttr, body);
            return this._openStack.sendP("PUT", this._urlAttr + "?metaoverride=true", body);
        };
        // List all subscriptions.
        Topic.prototype.listP = function (prefix, pageSize, pageMarker) {
            var headers = {};
            if (prefix)
                headers["x-mns-prefix"] = prefix;
            if (pageMarker)
                headers["x-mns-marker"] = pageMarker;
            if (pageSize)
                headers["x-mns-ret-number"] = pageSize;
            var url = this._urlSubscription.slice(0, -1);
            debug("GET " + url);
            return this._openStack.sendP("GET", url, null, headers);
        };
        Topic.prototype.subscribeP = function (name, endPoint, notifyStrategy, notifyContentFormat, filterTag) {
            var body = {
                Subscription: {
                    Endpoint: endPoint
                }
            };
            if (notifyStrategy)
                body.Subscription['NotifyStrategy'] = notifyStrategy;
            if (notifyContentFormat)
                body.Subscription['NotifyContentFormat'] = notifyContentFormat;
            if (filterTag)
                body.Subscription['FilterTag'] = filterTag;
            var url = Url.resolve(this._urlSubscription, name);
            debug("PUT " + url, body);
            return this._openStack.sendP("PUT", url, body);
        };
        Topic.prototype.unsubscribeP = function (name) {
            var url = Url.resolve(this._urlSubscription, name);
            debug("DELETE " + url);
            return this._openStack.sendP("DELETE", url);
        };
        Topic.prototype.publishP = function (msg, b64, tag, attrs, options) {
            var msgBlock = {
                MessageBody: b64 ? this.utf8ToBase64(msg) : msg
            };
            if (tag)
                msgBlock.MessageTag = tag;
            if (attrs)
                msgBlock.MessageAttributes = attrs;
            var body = {
                Message: msgBlock
            };
            debug("POST " + this._urlPublish, body);
            this._openStack.accumulateNextGASend("Topic.publishP");
            return this._openStack.sendP("POST", this._urlPublish, body, null, options);
        };
        Topic.prototype.utf8ToBase64 = function (src) {
            var buf = new Buffer(src, 'utf8');
            return buf.toString('base64');
        };
        Topic.prototype.makeAttrURL = function () {
            return Util.format(this._pattern, this._account.getHttps() ? "https" : "http", this._account.getAccountId(), this._region.toString(), this._name);
        };
        Topic.prototype.makeSubscriptionURL = function () {
            return this.makeAttrURL() + "/subscriptions/";
        };
        Topic.prototype.makePublishURL = function () {
            return this.makeAttrURL() + "/messages";
        };
        return Topic;
    }());
    AliMNS.Topic = Topic;
})(AliMNS || (AliMNS = {}));
/// <reference path="Interfaces.ts" />
/// <reference path="Topic.ts" />
/// <reference path="OpenStack.ts" />
var AliMNS;
/// <reference path="Interfaces.ts" />
/// <reference path="Topic.ts" />
/// <reference path="OpenStack.ts" />
(function (AliMNS) {
    // The Subscription
    var Subscription = /** @class */ (function () {
        // The constructor. name & topic is required.
        function Subscription(name, topic) {
            this._pattern = "%s://%s.mns.%s.aliyuncs.com/topics/%s/subscriptions/%s";
            this._name = name;
            this._topic = topic;
            // make url
            this._urlAttr = this.makeAttrURL();
            // create the OpenStack object
            this._openStack = new AliMNS.OpenStack(topic.getAccount());
        }
        Subscription.prototype.getName = function () { return this._name; };
        Subscription.prototype.getTopic = function () { return this._topic; };
        // 获取Subscription的属性值
        Subscription.prototype.getAttrsP = function () {
            debug("GET " + this._urlAttr);
            return this._openStack.sendP("GET", this._urlAttr);
        };
        // 设置Subscription的属性值
        Subscription.prototype.setAttrsP = function (options) {
            var body = { Subscription: options };
            debug("PUT " + this._urlAttr, body);
            return this._openStack.sendP("PUT", this._urlAttr + "?metaoverride=true", body);
        };
        Subscription.prototype.makeAttrURL = function () {
            return Util.format(this._pattern, this._topic.getAccount().getHttps() ? "https" : "http", this._topic.getAccount().getAccountId(), this._topic.getRegion().toString(), this._topic.getName(), this._name);
        };
        Subscription.NotifyStrategy = {
            BACKOFF_RETRY: "BACKOFF_RETRY",
            EXPONENTIAL_DECAY_RETRY: "EXPONENTIAL_DECAY_RETRY"
        };
        Subscription.NotifyContentFormat = {
            XML: "XML",
            SIMPLIFIED: "SIMPLIFIED"
        };
        return Subscription;
    }());
    AliMNS.Subscription = Subscription;
})(AliMNS || (AliMNS = {}));
/// <reference path="ali-mns.ts" />
/// <reference path="MNS.ts" />
/// <reference path="Account.ts" />
/// <reference path="Msg.ts" />
/// <reference path="MQ.ts" />
/// <reference path="MQBatch.ts" />
// Exports the AliMNS
module.exports = AliMNS;

//# sourceMappingURL=index.js.map
