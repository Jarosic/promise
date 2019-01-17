
const PENDING = 'PENDING';
const RESOLVED = 'RESOLVED';
const REJECTED = 'REJECTED';

const callLater = fn => setTimeout(fn, 0);

class OwnPromise {
  constructor(executer) {
    if (typeof executer !== 'function') {
      throw new TypeError('Promise resolver must be a function');
    }

    this._state = PENDING;
    this._value = null;
    this._thenners = [];
    this._resolve = this._resolve.bind(this);
    this._reject = this._reject.bind(this);

    try {
      executer(this._resolve, this._reject);
    } catch (error) {
      this._reject(error);
    }
  }

  /* Helper methods */

  _resolve(value) {
    if (this._state === PENDING) {
      this._state = RESOLVED;
      this._value = value;

      while (this._thenners.length > 0) {
        this._handleThenner(this._thenners.pop());
      }
    }
  }

  _reject(value) {
    if (this._state === PENDING) {
      this._state = REJECTED;
      this._value = value;

      while (this._thenners.length > 0) {
        this._handleThenner(this._thenners.pop());
      }
    }
  }

  _handleThenner(thenner) {
    if (this._state === RESOLVED) {
      thenner.onResolved && callLater(() => thenner.onResolved(this._value));
    } else if (this._state === REJECTED) {
      thenner.onRejected && callLater(() => thenner.onRejected(this._value));
    } else {
      this._thenners.push(thenner);
    }
  }

  /* Public methods */

  then(onResolved, onRejected) {
    return new OwnPromise((resolve, reject) => {
      const thenner = {

        onResolved: value => {
          let nextValue = value;

          if (onResolved) {
            try {
              if (typeof resolve !== 'function') {
                throw new TypeError('Not a function');
              }

              nextValue = onResolved(value);

              if (nextValue && nextValue.then) {
                return nextValue.then(resolve, reject);
              }
            } catch (err) {
              return reject(err);
            }
          }
          resolve(nextValue);
        },
        onRejected: value => {
          let nextValue = value;

          if (onRejected) {
            try {
              nextValue = onRejected(value);

              if (nextValue && nextValue.then) {
                return nextValue.then(resolve, reject);
              }
            } catch (err) {
              return reject(err);
            }
          }
          reject(nextValue);
        }
      };
      this._handleThenner(thenner);
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  /* Public static tools */

  static resolve(value) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    } else if (value instanceof OwnPromise) {
      return value;
    }

    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }
      resolve(value);
    });
  }

  static reject(value) {
    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }
      reject(value);
    });
  }

  static all(promises) {
    if (!Array.isArray(promises)) {
      return this.reject(new TypeError('Not an array'));
    }

    return new this((resolve, reject) => {
      const values = new Array(promises.length);
      let counter = 0;

      if (promises.length < 1) {
        return resolve([]);
      }

      const tryResolve = i => value => {
        values[i] = value;
        counter += 1;

        if (counter === promises.length) {
          resolve(values);
        }
      };

      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        promise.then(tryResolve(i), reject);
      }
    });
  }

  static race(iterable) {
    if (!Array.isArray(iterable)) {
      return this.reject(new TypeError('Not an array'));
    }

    return new this((resolve, reject) => {
      for (let i = 0; i < iterable.length; i++) {
        iterable[i].then(resolve, reject);
      }
    });
  }
}

module.exports = OwnPromise;

