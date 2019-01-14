
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
    executer(this._resolve, this._reject);
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

  done(onResolved) {
    return this.then(onResolved);
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  /* Public static tools */

  static resolve(value) {
    return new OwnPromise(resolve => resolve(value));
  }

  static reject(value) {
    return new OwnPromise((resolve, reject) => reject(value));
  }

  static all(promises) {
    const isIterable = object => object !== null && typeof object[Symbol.iterator] === 'function';

    return new OwnPromise((resolve, reject) => {
      if (!isIterable(promises)) {
        throw new TypeError('ERROR');
      }

      const values = new Array(promises.length);
      let counter = 0;

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
    const isIterable = object => object !== null && typeof object[Symbol.iterator] === 'function';

    if (!isIterable(iterable)) {
      throw new TypeError('ERROR');
    }
    return new OwnPromise((resolve, reject) => {
      for (let i = 0; i < iterable.length; i++) {
        iterable[i].then(resolve, reject);
      }
    });
  }
}
module.exports = OwnPromise;

