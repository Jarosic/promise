class OwnPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new Error('executor is not a function');
    }

    this.state = 'PENDING';
    this.value = undefined;
    this.thenners = [];
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);

    executor(this.resolve, this.reject);
  }

  static reject(value) {
    this.state = 'REJECTED';
    this.value = reason;
    return new OwnPromise((reject) => reject(value));
  }

  static resolve(value) {
    this.state = 'FULFILLED';
    this.value = value;
    return value && ({}).hasOwnProperty.call(value, 'then') ? value
      : new OwnPromise(resolve => {
        resolve(value);
      });
  }
}

module.exports = OwnPromise;
