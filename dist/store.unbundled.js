(function (factory) {

  const mod = factory();

  if (typeof window !== "undefined") {
    window.WatchableStore = mod;
  }
  if (typeof global !== "undefined") {
    global.WatchableStore = mod;
  }
  if (typeof module !== "undefined") {
    module.exports = mod;
  }

})(function () {
const Store = class {

  static create(...args) {
    return new this(...args);
  }

  constructor(initialState = {}, path_to_store = "original_store.json") {
    this.$store = initialState;
    this.$ufs = UFS_manager.create(path_to_store);
    this.events = {};
  }

  _triggerParentEvents(event, path, value) {
    const originalPath = path.join(".");
    if (this.events[originalPath]) {
      this.events[originalPath].forEach((callback) => {
        return callback(event, path, value);
      });
    }
    while (path.length > 0) {
      path.pop();
      const parentPath = path.join(".");
      if (this.events[parentPath]) {
        this.events[parentPath].forEach((callback) => {
          const value = this.get(path);
          return callback(event, path, value);
        });
      }
    }
  }

  get(path) {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), this.$store);
  }

  set(path, value) {
    if (!Array.isArray(path) || path.length === 0) {
      throw new Error("La ruta debe ser un array de strings no vacío.");
    }
    const lastKey = path.pop();
    const target = path.reduce((acc, key) => {
      if (!acc[key]) acc[key] = {};
      return acc[key];
    }, this.$store);
    target[lastKey] = value;
    path.push(lastKey);
    this._triggerParentEvents("set", path, value);
  }

  watch(path, callback) {
    const key = path.join(".");
    if (!this.events[key]) {
      this.events[key] = [];
    }
    this.events[key].push(callback);
  }

  unwatch(path, callback) {
    const key = path.join(".");
    if (this.events[key]) {
      this.events[key] = this.events[key].filter((cb) => {
        return cb !== callback;
      });
      if (this.events[key].length === 0) {
        delete this.events[key];
      }
    }
  }

  delete(path) {
    if (!Array.isArray(path) || path.length === 0) {
      throw new Error("La ruta debe ser un array de strings no vacío.");
    }
    const lastKey = path.pop();
    const target = this.get(path);
    if (target && target.hasOwnProperty(lastKey)) {
      delete target[lastKey];
      this._triggerParentEvents("delete", path);
    }
  }

  push(path, value) {
    const array = this.get(path);
    if (Array.isArray(array)) {
      array.push(value);
      this._triggerParentEvents("push", path, array);
    }
  }

  pop(path) {
    const array = this.get(path);
    if (Array.isArray(array)) {
      const value = array.pop();
      this._triggerParentEvents("pop", path, array);
      return value;
    }
  }

  unshift(path, value) {
    const array = this.get(path);
    if (Array.isArray(array)) {
      array.unshift(value);
      this._triggerParentEvents("unshift", path, array);
    }
  }

  shift(path) {
    const array = this.get(path);
    if (Array.isArray(array)) {
      const value = array.shift();
      this._triggerParentEvents("shift", path, array);
      return value;
    }
  }

  add(path, key, value) {
    const object = this.get(path);
    if (object && typeof object === 'object' && !Array.isArray(object)) {
      object[key] = value;
      this._triggerParentEvents("add", path, object);
    }
  }

  remove(path, key) {
    const object = this.get(path);
    if (object && typeof object === 'object' && !Array.isArray(object)) {
      delete object[key];
      this._triggerParentEvents("remove", path, object);
    }
  }

  splice(path, start, deleteCount, ...items) {
    const array = this.get(path);
    if (Array.isArray(array)) {
      const result = array.splice(start, deleteCount, ...items);
      this._triggerParentEvents("splice", path, array);
      return result;
    }
  }

  extend(path, newProps) {
    const object = this.get(path);
    if (object && typeof object === 'object' && !Array.isArray(object)) {
      Object.assign(object, newProps);
      this._triggerParentEvents("extend", path, object);
    }
  }

  modify(path, modifier) {
    const currentValue = this.get(path);
    const newValue = modifier(currentValue);
    if (newValue !== currentValue) {
      this.set(path, newValue);
    }
  }

  hydrate(file) {
    this.$store = JSON.parse(this.$ufs.read_file(file));
  }

  dehydrate(file) {
    this.$ufs.write_file(file, JSON.stringify(this.$store));
  }

};

Store.default = Store;

return Store;
});
