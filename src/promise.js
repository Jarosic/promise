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
}

module.exports = OwnPromise;
