import { debounce, mapValues } from 'lodash-es';

const dependencies = new Set();

function runAndGetDependencies(callback) {
  dependencies.clear();
  callback();
  const deps = new Set(dependencies);
  dependencies.clear();
  return deps;
}

function getWatchersDependingOn(symbol) {
  return watchers.filter(({ dependencies }) => dependencies.has(symbol));
}

export function reactive(object) {
  const keyToSymbolMap = new Map();
  const getSymbolFromKey = key => {
    if (keyToSymbolMap.has(key)) {
      return keyToSymbolMap.get(key);
    }
    const symbol = Symbol(key);
    keyToSymbolMap.set(key, symbol);
    return symbol;
  };

  const reactiveObject = new Proxy(
    { ...mapValues(object, v => (typeof v === 'object' ? reactive(v) : v)) },
    {
      get(target, key) {
        dependencies.add(getSymbolFromKey(key));
        return target[key];
      },
      set(target, key, newValue) {
        if (typeof target[key] === 'object' && typeof newValue === 'object') {
          Object.assign(target[key], newValue);
        } else {
          target[key] = newValue;
        }
        getWatchersDependingOn(getSymbolFromKey(key)).forEach(({ callback }) => callback());
        return true;
      },
    },
  );
  return reactiveObject;
}

const watchers = [];
export function watch(callback) {
  const dependencies = runAndGetDependencies(callback);
  watchers.push({
    callback: debounce(callback),
    dependencies,
  });
}

export function ref(initialValue = undefined) {
  return reactive({ value: initialValue });
}

export function computed(calculate) {
  const reference = ref();

  watch(() => {
    reference.value = calculate();
  });

  return reference;
}
