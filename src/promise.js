class OwnPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new Error('executor is not a function');
    }
  }
}

module.exports = OwnPromise;
