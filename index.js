var stream = require('stream');
var Transform = stream.Transform;
var util = require('util');

var Inflate = require('./src/inflate').Inflate;

function createInflateTransform(opts) {

    function __Transform(opts) {
        if(!(this instanceof __Transform)) {
            return new __Transform();
        }
        Transform.call(this, {});
        this.cbQueue = [];
        this.inflate = new Inflate(opts);
        this.inflate.on('data', (function(data) {
            this.push(new Buffer(data));
        }).bind(this));
        this.inflate.on('pushed', (function(data) {
            this.cbQueue.shift()();
        }).bind(this))
        this.inflate.on('finish', (function() {
            this.push(null);
        }).bind(this));
    }

    util.inherits(__Transform, Transform);

    __Transform.prototype._transform = function(chunk, coding, cb) {
        this.cbQueue.push(cb);
        this.inflate.push(chunk, false);
    }

    __Transform.prototype._flush = function(cb) {
        this.cbQueue.push(cb);
        this.inflate.push(new Buffer(0), true);
    }

    return new __Transform(opts);

}

exports.Inflate = Inflate;
exports.createInflateTransform = createInflateTransform;