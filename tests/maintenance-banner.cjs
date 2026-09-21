const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const listeners = {};
const classes = new Set();
const style = {
  height: '',
  removeProperty(property) { this[property] = ''; },
};
const closeButton = {
  disabled: false,
  addEventListener(type, listener) { listeners[`close:${type}`] = listener; },
};
const banner = {
  hidden: true,
  inert: false,
  offsetHeight: 280,
  style,
  classList: {
    add(name) { classes.add(name); },
    remove(name) { classes.delete(name); },
    contains(name) { return classes.has(name); },
  },
  querySelector() { return closeButton; },
  addEventListener(type, listener) { listeners[`banner:${type}`] = listener; },
  removeEventListener(type) { delete listeners[`banner:${type}`]; },
};
const searchInput = { focused: false, focus() { this.focused = true; } };
const storage = new Map();
const context = vm.createContext({
  console,
  document: {
    activeElement: closeButton,
    querySelectorAll() { return [banner]; },
    querySelector(selector) { return selector === '#search-input' ? searchInput : null; },
  },
  sessionStorage: {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); },
  },
  window: {
    matchMedia() { return { matches: false }; },
    setTimeout() {},
  },
});

vm.runInContext(fs.readFileSync('js/maintenance-banner.js', 'utf8'), context);
assert.equal(banner.hidden, false);

(async () => {
  const closing = listeners['close:click']();
  assert.equal(style.height, '280px');
  assert.equal(classes.has('is-closing'), true);
  assert.equal(banner.inert, true);
  assert.equal(storage.get('gela-facil:maintenance-banner-dismissed'), '1');

  listeners['banner:transitionend']({ target: banner, propertyName: 'height' });
  await closing;

  assert.equal(banner.hidden, true);
  assert.equal(classes.has('is-closing'), false);
  assert.equal(banner.inert, false);
  assert.equal(searchInput.focused, true);
  console.log('PASS: o banner anima, persiste o fechamento e restaura o foco.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
