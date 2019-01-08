class OwnPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new Error('executor is not a function');
    }

    this.state = 'PENDING';
    this.value = undefined;
    this.thenners = [];

    executor(this.resolve, this.reject);
  }

  static reject(value) {
    this.state = 'REJECTED';
    this.value = value;
    return new OwnPromise((reject) => reject(value));
  }

  static race(iterable) {
    if (typeof iterable === 'number' || typeof iterable === 'string' ||typeof iterable === 'boolean') {
      return new OwnPromise(() => { reject(err) });
    }

    return new OwnPromise((resolve, reject) => {
      iterable.forEach((item, i) => {
        if (!(item instanceof OwnPromise)) {
          throw new TypeError('inner argument must be an instance of Promise.');
        }
        item.then(res => {
          resolve(res);
        }, err => {
          reject(err);
        });
      });
    });
  }

  static resolve(value) {
    this.state = 'FULFILLED';
    this.value = value;
    return value && ({}).hasOwnProperty.call(value, 'then') ? value : new OwnPromise(resolve => {
        resolve(value);
      });
  }

  then(onFulfilled, onRejected) {
    if (this.state === FULFILLED) {
      onFulfilled(this.value);
    } else if (this.state === REJECTED) {
      onRejected(this.error);
    } else {
      this.thenners.push({ onFulfilled, onRejected });
    }
  }
}
let promise = new OwnPromise(function(resolve, reject) {return})

console.log(promise.race([then, then]));

module.exports = OwnPromise;
