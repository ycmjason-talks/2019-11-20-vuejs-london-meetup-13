import { debounce } from 'lodash-es';

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
  const reactiveObject = {};
  for (const [key, value] of Object.entries(object)) {
    let internalValue = typeof value === 'object' ? reactive(value) : value;
    const symbol = Symbol(key);
    Object.defineProperty(reactiveObject, key, {
      enumerable: true,
      get() {
        dependencies.add(symbol);
        return internalValue;
      },
      set(newValue) {
        if (typeof internalValue === 'object' && typeof newValue === 'object') {
          Object.assign(internalValue, newValue);
        } else {
          internalValue = newValue;
        }
        getWatchersDependingOn(symbol).forEach(({ callback }) => callback());
      },
    });
  }
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
