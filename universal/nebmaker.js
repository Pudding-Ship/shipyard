

////////////////////////////////////////////////////////////////////

var rgba = function(r, g, b, a) {
    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);
    a = Math.floor(a*255);
    // return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    return [r,g,b,a]
}

// var rgbaCanvas = function(width, height, r, g, b, a) {
//     var canvas = document.createElement("canvas");
//     canvas.width = width;
//     canvas.height = height;
//     var context = canvas.getContext("2d");
//     context.fillStyle = rgba(r, g, b, a);
//     context.fillRect(0, 0, width, height);
//     return canvas;
// }

////////////////////////////////////////////////////////////////////

///

var XYIterator = function(width, height) {
    this.width = width;
    this.height = height;
    this.x = -1;
    this.y = 0;
}

XYIterator.prototype.next = function() {
    if (this.y == this.height) {
        return {
            x: this.width - 1,
            y: this.width - 1,
            done: 1
        };
    }
    this.x++;
    if (this.x == this.width) {
        this.x = 0;
        this.y++;
    }
    if (this.y == this.height) {
        return {
            x: this.width - 1,
            y: this.width - 1,
            done: 1
        };
    }
    return {
        x: this.x,
        y: this.y,
        done: (this.y * this.width + this.x) / (this.width * this.height)
    };
}

////

function Alea() {
    return (function(args) {
        var s0 = 0;
        var s1 = 0;
        var s2 = 0;
        var c = 1;
        if (args.length == 0) {
            args = [+new Date];
        }
        var mash = Mash();
        s0 = mash(' ');
        s1 = mash(' ');
        s2 = mash(' ');
        for (var i = 0; i < args.length; i++) {
            s0 -= mash(args[i]);
            if (s0 < 0) {
                s0 += 1;
            }
            s1 -= mash(args[i]);
            if (s1 < 0) {
                s1 += 1;
            }
            s2 -= mash(args[i]);
            if (s2 < 0) {
                s2 += 1;
            }
        }
        mash = null;
        var random = function() {
            var t = 2091639 * s0 + c * 2.3283064365386963e-10;
            s0 = s1;
            s1 = s2;
            return s2 = t - (c = t | 0);
        };
        random.uint32 = function() {
            return random() * 0x100000000;
        };
        random.fract53 = function() {
            return random() +
                (random() * 0x200000 | 0) * 1.1102230246251565e-16;
        };
        random.version = 'Alea 0.9';
        random.args = args;
        return random;

    }(Array.prototype.slice.call(arguments)));
};

function Mash() {
    var n = 0xefc8249d;

    var mash = function(data) {
        data = data.toString();
        for (var i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            var h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000;
        }
        return (n >>> 0) * 2.3283064365386963e-10;
    };

    mash.version = 'Mash 0.9';
    return mash;
}

/////

function Perlin(seed) {
    var ClassicalNoise = function(r) {
        if (r == undefined) r = Math;
        this.grad3 = [
            [1, 1, 0],
            [-1, 1, 0],
            [1, -1, 0],
            [-1, -1, 0],
            [1, 0, 1],
            [-1, 0, 1],
            [1, 0, -1],
            [-1, 0, -1],
            [0, 1, 1],
            [0, -1, 1],
            [0, 1, -1],
            [0, -1, -1]
        ];
        this.p = [];
        for (var i = 0; i < 256; i++) {
            this.p[i] = Math.floor(r.random() * 256);
        }
        this.perm = [];
        for (var i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    };
    ClassicalNoise.prototype.dot = function(g, x, y, z) {
        return g[0] * x + g[1] * y + g[2] * z;
    };
    ClassicalNoise.prototype.mix = function(a, b, t) {
        return (1.0 - t) * a + t * b;
    };
    ClassicalNoise.prototype.fade = function(t) {
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    };
    ClassicalNoise.prototype.noise = function(x, y, z) {
        var X = Math.floor(x);
        var Y = Math.floor(y);
        var Z = Math.floor(z);
        x = x - X;
        y = y - Y;
        z = z - Z;
        X = X & 255;
        Y = Y & 255;
        Z = Z & 255;
        var gi000 = this.perm[X + this.perm[Y + this.perm[Z]]] % 12;
        var gi001 = this.perm[X + this.perm[Y + this.perm[Z + 1]]] % 12;
        var gi010 = this.perm[X + this.perm[Y + 1 + this.perm[Z]]] % 12;
        var gi011 = this.perm[X + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;
        var gi100 = this.perm[X + 1 + this.perm[Y + this.perm[Z]]] % 12;
        var gi101 = this.perm[X + 1 + this.perm[Y + this.perm[Z + 1]]] % 12;
        var gi110 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z]]] % 12;
        var gi111 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;
        var n000 = this.dot(this.grad3[gi000], x, y, z);
        var n100 = this.dot(this.grad3[gi100], x - 1, y, z);
        var n010 = this.dot(this.grad3[gi010], x, y - 1, z);
        var n110 = this.dot(this.grad3[gi110], x - 1, y - 1, z);
        var n001 = this.dot(this.grad3[gi001], x, y, z - 1);
        var n101 = this.dot(this.grad3[gi101], x - 1, y, z - 1);
        var n011 = this.dot(this.grad3[gi011], x, y - 1, z - 1);
        var n111 = this.dot(this.grad3[gi111], x - 1, y - 1, z - 1);
        var u = this.fade(x);
        var v = this.fade(y);
        var w = this.fade(z);
        var nx00 = this.mix(n000, n100, u);
        var nx01 = this.mix(n001, n101, u);
        var nx10 = this.mix(n010, n110, u);
        var nx11 = this.mix(n011, n111, u);
        var nxy0 = this.mix(nx00, nx10, v);
        var nxy1 = this.mix(nx01, nx11, v);
        var nxyz = this.mix(nxy0, nxy1, w);
        return nxyz;
    };
    var rand = {
        random: Alea(seed)
    };
    var noise = new ClassicalNoise(rand);
    this.noise = function(x, y, z) {
        return 0.5 * noise.noise(x, y, z) + 0.5;
    }
}


/////
var NebulaRenderer = function(imageData, r, g, b, scale, intensity, falloff) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.scale = scale;
    this.intensity = intensity;
    this.falloff = falloff;
    // this.context = canvas.getContext("2d");
    this.pn = new Perlin("" + Math.random());

    this.iterator = new XYIterator(imageData.width, imageData.height);
    this.styleArray=[];
    this.coordsArray=[];
    this.imageData=imageData;
}

NebulaRenderer.prototype.recursiveField = function(x, y, depth, divisor) {
    if (depth == 0) {
        return this.pn.noise(x / divisor, y / divisor, 0);
    }
    var displace = this.recursiveField(x, y, depth - 1, divisor / 2);
    return this.pn.noise(x / divisor + displace, y / divisor + displace, 0);
}

NebulaRenderer.prototype.field = function(r, g, b, x, y, intensity, falloff) {
    var i = Math.min(1, this.recursiveField(x, y, 5, 2) * intensity);
    // console.log(falloff)
    i = Math.pow(i, falloff);
    return rgba(r, g, b, i);
}

NebulaRenderer.prototype.next = function() {
    var next = this.iterator.next();

    // this.context.fillStyle = this.field(this.r, this.g, this.b, next.x / this.scale, next.y / this.scale, this.intensity, this.falloff);
    // this.context.fillRect(next.x, next.y, 1, 1);

    let thisRGBA = this.field(this.r, this.g, this.b, next.x / this.scale, next.y / this.scale, this.intensity, this.falloff);

    // this.styleArray.push(thisRGBA);
    let thisCoords = [next.x,next.y];
    // this.coordsArray.push(thisCoords);

    //set rgba
    // console.log(((this.imageData.width * next.y) + next.x) * 4)
    this.imageData.data[((this.imageData.width * next.y) + next.x) * 4] = thisRGBA[0];
    this.imageData.data[((this.imageData.width * next.y) + next.x) * 4+1] = thisRGBA[1];
    this.imageData.data[((this.imageData.width * next.y) + next.x) * 4+2] = thisRGBA[2];
    this.imageData.data[((this.imageData.width * next.y) + next.x) * 4+3] = thisRGBA[3];

    // if(thisRGBA[3]>0){
    //
    //
    //   this.imageData.data[((this.imageData.width * next.y) + next.x) * 4] = 1;
    //   this.imageData.data[((this.imageData.width * next.y) + next.x) * 4+1] = 1;
    //   this.imageData.data[((this.imageData.width * next.y) + next.x) * 4+2] = 1;
    //   this.imageData.data[((this.imageData.width * next.y) + next.x) * 4+3] = 1;
    // }
    // console.log(this.imageData[((this.imageData.width * next.y) + next.x) * 4+3])


    // var x = 20;
    // var y = 20;
    //
    // var red = data[((imageWidth * y) + x) * 4];
    // var green = data[((imageWidth * y) + x) * 4 + 1];
    // var blue = data[((imageWidth * y) + x) * 4 + 2];
    // var alpha = data[((imageWidth * y) + x) * 4 + 3];


    return next.done;


}



///////////

function initNeb(blankImageData){

  var nebb = new NebulaRenderer(blankImageData, Math.random(), Math.random(), Math.random(), blankImageData.width / 4, Math.random() * 0.2 + 1, Math.random() * 3 + 3);
  var done = 0;
  while (done < 1) {
       done = nebb.next();
   }
   postMessage(nebb.imageData);
 }

// initNeb();

onmessage = function(e) {
  var imageData = e.data;
  initNeb(imageData);
}
