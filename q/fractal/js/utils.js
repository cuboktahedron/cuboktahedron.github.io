'use strict';

class MutableComplex {
  constructor(re, im) {
    this.re = re;
    this.im = im;
  }

  add(c) {
    const re = this.re + c.re;
    const im = this.im + c.im;
    this.re = re;
    this.im = im;
    return this;
  }

  mul(c) {
    const re = this.re * c.re - this.im * c.im;
    const im = this.re * c.im + this.im * c.re;
    this.re = re;
    this.im = im;
    return this;
  }

  abs() {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  abs2() {
    return this.re * this.re + this.im * this.im;
  }

  toString() {
    if (this.im >= 0) {
      return this.re + " + " + this.im + "i";
    } else {
      return this.re + " - " + -this.im + "i";
    }
  }
}

class Diagnosis {
  static async elapsedTime(f) {
    const before = new Date();
    await f();
    return new Date() - before;
  }
}

class SimpleEventEmitter {
  constructor() {
    this.handlers = {};
  }

  on(name, handler) {
    if (this.handlers[name] === undefined) {
      this.handlers[name] = [];
    }

    this.handlers[name].push(handler);
  }

  emit(name, payload) {
    for (let i = 0; i < this.handlers[name].length; i++) {
      this.handlers[name][i](payload);
    }
  }
};

class Process {
  static sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
};

class WorkerUtils {
  static createWorker(relativePath) {
    try {
      return this._createViaBlob(relativePath);
    } catch (e) {
      return new Worker(relativePath);
    }
  }

  static _createViaBlob(relativePath) {
    var baseURL = window.location.href.replace(/\\/g, '/').replace(/\/[^\/]*$/, '/');
    var array = ['importScripts("' + baseURL + relativePath + '");'];
    var blob = new Blob(array, {type: 'text/javascript'});
    var url = window.URL.createObjectURL(blob);
    return new Worker(url);
  }
}

const eventer  = new SimpleEventEmitter();

