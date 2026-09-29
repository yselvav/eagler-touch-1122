const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium, webkit, devices } = require('playwright');

const scriptPath = path.resolve(__dirname, '../src/eagler-touch-1122.js');
const markup = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head>' +
  '<body style="margin:0"><div id="game_frame"><canvas width="915" height="412" style="display:block;width:100vw;height:100vh"></canvas></div></body></html>';

function launch(name) {
  return name === 'chromium'
    ? chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH ||
      (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'] })
    : webkit.launch({ headless: true });
}

async function fixture(page, config = { enabled: true }) {
  await page.setContent(markup);
  await page.evaluate((options) => {
    window.EaglerTouch1122Config = options;
    window.__records = { keys: [], mouse: [], wheels: [] };
    window.__statics = { pointerLockSupported: 1, pointerLockFlag: 0, mouseDX: 0, mouseDY: 0 };
    window.__events = {};
    window.ModAPI = {
      player: {},
      mcinstance: { $player: {}, $currentScreen: null },
      hooks: {
        _rippedStaticProperties: { nlei_PlatformInput: window.__statics },
        methods: { nlei_PlatformInput_mouseSetGrabbed() {} }
      },
      addEventListener(name, callback) { window.__events[name] = callback; }
    };
    window.addEventListener('keydown', (e) => window.__records.keys.push(['down', e.key]));
    window.addEventListener('keyup', (e) => window.__records.keys.push(['up', e.key]));
    const canvas = document.querySelector('canvas');
    canvas.addEventListener('mousedown', (e) => window.__records.mouse.push(['down', e.button]));
    canvas.addEventListener('mouseup', (e) => window.__records.mouse.push(['up', e.button]));
    canvas.addEventListener('wheel', (e) => window.__records.wheels.push(e.deltaY));
  }, config);
  await page.addScriptTag({ path: scriptPath });
  await page.evaluate(() => window.__events.load());
  await page.waitForFunction(() => window.EaglerTouch1122?.mode === 'world');
}

async function pointer(page, selector, type, id, x, y) {
  await page.evaluate(({ selector, type, id, x, y }) => {
    document.querySelector(selector).dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: id, pointerType: 'touch', clientX: x, clientY: y
    }));
  }, { selector, type, id, x, y });
}

for (const browserName of ['chromium', 'webkit']) {
  test(`${browserName}: touch controls, GUI, lifecycle and portrait`, async () => {
    const browser = await launch(browserName);
    const context = await browser.newContext({ ...devices[browserName === 'webkit' ? 'iPhone 13' : 'Pixel 7'],
      viewport: { width: 915, height: 412 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    try {
      await fixture(page);
      assert.equal(await page.locator('[data-action="jump"]').innerText(), 'Jump');
      assert.equal(await page.locator('[data-action="inventory"]').innerText(), 'Items');
      assert.equal(await page.evaluate(() => __statics.pointerLockSupported), 0);
      assert.equal(await page.evaluate(() => EaglerTouch1122.inspect().grab), 1);

      const box = await page.locator('#ec1122-touch-stick').boundingBox();
      assert(box);
      const x = box.x + box.width / 2, y = box.y + box.height / 2;
      await pointer(page, '#ec1122-touch-stick', 'pointerdown', 1, x, y);
      await pointer(page, '#ec1122-touch-stick', 'pointermove', 1, x, y - 36);
      await pointer(page, '#ec1122-touch-look', 'pointerdown', 2, 500, 200);
      await pointer(page, '#ec1122-touch-look', 'pointermove', 2, 525, 190);
      let result = await page.evaluate(() => ({ input: EaglerTouch1122.inspect(), keys: __records.keys }));
      assert(result.input.held.includes('forward'));
      assert(result.keys.some(([type, key]) => type === 'down' && key === 'w'));
      assert(result.input.look[0] > 0 && result.input.look[1] > 0);

      await pointer(page, '#ec1122-touch-stick', 'pointercancel', 1, x, y);
      result = await page.evaluate(() => ({ input: EaglerTouch1122.inspect(), keys: __records.keys }));
      assert(!result.input.held.includes('forward'));
      assert(result.keys.some(([type, key]) => type === 'up' && key === 'w'));

      await pointer(page, '[data-action="attack"]', 'pointerdown', 3, 790, 340);
      await pointer(page, '[data-action="attack"]', 'pointercancel', 3, 790, 340);
      await pointer(page, '[data-action="use"]', 'pointerdown', 4, 840, 245);
      await pointer(page, '[data-action="use"]', 'pointerup', 4, 840, 245);
      const mouse = await page.evaluate(() => __records.mouse);
      assert(mouse.some(([type, button]) => type === 'down' && button === 0));
      assert(mouse.some(([type, button]) => type === 'up' && button === 0));
      assert(mouse.some(([type, button]) => type === 'down' && button === 2));
      assert(mouse.some(([type, button]) => type === 'up' && button === 2));

      await pointer(page, '[data-action="next"]', 'pointerdown', 5, 200, 300);
      assert((await page.evaluate(() => __records.wheels)).some((value) => value > 0));
      await page.evaluate(() => { ModAPI.mcinstance.$currentScreen = {}; });
      await page.waitForFunction(() => EaglerTouch1122.mode === 'gui');
      await page.locator('#ec1122-touch-gui-back').click();
      assert((await page.evaluate(() => __records.keys)).some(([type, key]) => type === 'down' && key === 'Escape'));
      await pointer(page, 'canvas', 'pointerdown', 6, 120, 120);
      await pointer(page, 'canvas', 'pointerup', 6, 120, 120);
      assert((await page.evaluate(() => __records.mouse)).filter(([type]) => type === 'down').length >= 3);
      await pointer(page, 'canvas', 'pointerdown', 7, 140, 140);
      await page.evaluate(() => { ModAPI.mcinstance.$currentScreen = null; });
      await page.waitForFunction(() => EaglerTouch1122.mode === 'world');
      assert((await page.evaluate(() => __records.mouse)).filter(([type]) => type === 'up').length >= 3);

      await page.evaluate(() => { ModAPI.mcinstance.$currentScreen = { constructor: { name: 'GuiChat' } }; });
      await page.waitForFunction(() => !document.querySelector('#ec1122-touch-text').hidden);
      await page.locator('#ec1122-touch-input').fill('hi');
      await page.locator('#ec1122-touch-text button').click();
      const keys = await page.evaluate(() => __records.keys);
      assert(keys.some(([type, key]) => type === 'down' && key === 'h'));
      assert(keys.some(([type, key]) => type === 'down' && key === 'Enter'));

      await page.evaluate(() => { ModAPI.mcinstance.$currentScreen = null; });
      await page.waitForFunction(() => EaglerTouch1122.mode === 'world');
      await page.evaluate(() => { window.__active = true; EaglerTouch1122Config.isActive = () => window.__active; });
      await pointer(page, '[data-action="jump"]', 'pointerdown', 8, 850, 350);
      assert((await page.evaluate(() => EaglerTouch1122.inspect().held)).includes('jump'));
      await page.evaluate(() => { window.__active = false; });
      await page.waitForFunction(() => EaglerTouch1122.mode === 'loading');
      assert(!(await page.evaluate(() => EaglerTouch1122.inspect().held)).includes('jump'));
      await page.evaluate(() => { window.__active = true; });
      await page.waitForFunction(() => EaglerTouch1122.mode === 'world');
      await page.setViewportSize({ width: 390, height: 844 });
      assert(await page.locator('#ec1122-touch-stick').isVisible());
      assert(await page.locator('[data-action="jump"]').isVisible());
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
      await browser.close();
    }
  });
  test(`${browserName}: host isolation and interrupted input`, async () => {
    const browser = await launch(browserName);
    const page = await browser.newPage({ ...devices[browserName === 'webkit' ? 'iPhone 13' : 'Pixel 7'] });
    try {
      await fixture(page);
      await page.evaluate(() => {
        const hostButton = document.createElement('button');
        hostButton.id = 'host-action'; hostButton.dataset.action = 'use';
        document.body.appendChild(hostButton);
      });
      assert.equal(await page.locator('#host-action').evaluate(el => getComputedStyle(el).right), 'auto', 'controller CSS must not style host buttons');

      await pointer(page, '#ec1122-touch-stick', 'pointerdown', 70, 60, 200);
      await pointer(page, '#ec1122-touch-stick', 'pointermove', 70, 60, 160);
      await pointer(page, '[data-action="attack"]', 'pointerdown', 71, 300, 350);
      await page.evaluate(() => {
        const oldCanvas = document.querySelector('canvas');
        window.__oldMouseUps = 0;
        oldCanvas.addEventListener('mouseup', () => window.__oldMouseUps++);
        oldCanvas.replaceWith(oldCanvas.cloneNode());
      });
      await page.waitForTimeout(150);
      assert.deepEqual(await page.evaluate(() => EaglerTouch1122.inspect().held), [], 'canvas replacement must release keys');
      assert.equal(await page.evaluate(() => __oldMouseUps), 1, 'release must target the old canvas');

      await pointer(page, '#ec1122-touch-look', 'pointerdown', 72, 250, 300);
      await pointer(page, '#ec1122-touch-look', 'pointermove', 72, 270, 280);
      await page.evaluate(() => window.dispatchEvent(new Event('blur')));
      assert.deepEqual(await page.evaluate(() => EaglerTouch1122.inspect().look), [0, 0]);

      await page.evaluate(() => { ModAPI.mcinstance.$currentScreen = {}; window.__guiMouseUps = 0;
        document.querySelector('canvas').addEventListener('mouseup', () => window.__guiMouseUps++); });
      await page.waitForFunction(() => EaglerTouch1122.mode === 'gui');
      await pointer(page, 'canvas', 'pointerdown', 73, 150, 150);
      await pointer(page, 'canvas', 'lostpointercapture', 73, 150, 150);
      assert.equal(await page.evaluate(() => __guiMouseUps), 1);
    } finally { await browser.close(); }
  });
  test(`${browserName}: native startup needs a real tap and completed gate`, async () => {
    const browser = await launch(browserName);
    const page = await browser.newPage({ ...devices[browserName === 'webkit' ? 'iPhone 13' : 'Pixel 7'] });
    try {
      await fixture(page);
      await page.evaluate(() => {
        const panel = document.createElement('div');
        panel.className = '_eaglercraftX_mobile_press_any_key';
        panel.style.cssText = 'position:fixed;inset:0;z-index:1000;background:white';
        panel.innerHTML = '<button class="_eaglercraftX_mobile_launch_client">Launch</button>';
        document.querySelector('#game_frame').appendChild(panel);
        __statics.mobilePressAnyKeyScreen = panel;
        __statics.hasShownPressAnyKey = 1; __statics.isOnMobilePressAnyKey = 0;
        panel.querySelector('button').click();
      });
      await page.waitForTimeout(150);
      assert(await page.locator('._eaglercraftX_mobile_press_any_key').isVisible(), 'synthetic click cannot dismiss the gate');
      await page.evaluate(() => { __statics.hasShownPressAnyKey = 0; __statics.isOnMobilePressAnyKey = 1; });
      await page.locator('._eaglercraftX_mobile_launch_client').click();
      await page.waitForTimeout(150);
      assert(await page.locator('._eaglercraftX_mobile_press_any_key').isVisible(), 'incomplete gate must remain visible');
      await page.evaluate(() => { __statics.hasShownPressAnyKey = 1; __statics.isOnMobilePressAnyKey = 0; });
      await page.waitForFunction(() => getComputedStyle(__statics.mobilePressAnyKeyScreen).display === 'none');
      assert.equal(await page.evaluate(() => __statics.mobilePressAnyKeyScreen.isConnected), true, 'retain the engine-owned node for its cleanup');
    } finally { await browser.close(); }
  });
}

test('fine-pointer desktop does not patch input or mount controls', async () => {
  const browser = await launch('chromium');
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 }, hasTouch: false });
  const page = await context.newPage();
  try {
    await page.setContent(markup);
    await page.evaluate(() => {
      window.ModAPI = { hooks: { _rippedStaticProperties: { nlei_PlatformInput: { pointerLockSupported: 1 } },
        methods: { nlei_PlatformInput_mouseSetGrabbed() {} } }, addEventListener() {} };
    });
    await page.addScriptTag({ path: scriptPath });
    assert.equal(await page.evaluate(() => ModAPI.hooks._rippedStaticProperties.nlei_PlatformInput.pointerLockSupported), 1);
    assert.equal(await page.locator('#ec1122-touch').count(), 0);
    assert.equal(await page.evaluate(() => typeof window.EaglerTouch1122), 'undefined');
  } finally {
    await context.close();
    await browser.close();
  }
});

test('missing input bridge fails closed', async () => {
  const browser = await launch('chromium');
  const page = await browser.newPage();
  try {
    await page.setContent(markup);
    await page.evaluate(() => { window.EaglerTouch1122Config = { enabled: true }; window.ModAPI = {
      hooks: { _rippedStaticProperties: {}, methods: {} }, addEventListener() {} }; });
    await page.addScriptTag({ path: scriptPath });
    assert.equal(await page.locator('#ec1122-touch').count(), 0);
    assert.equal(await page.evaluate(() => typeof window.EaglerTouch1122), 'undefined');
  } finally {
    await browser.close();
  }
});

test('invalid canvas selector leaves the original input bridge unchanged', async () => {
  const browser = await launch('chromium');
  const page = await browser.newPage();
  try {
    await page.setContent(markup);
    await page.evaluate(() => {
      window.EaglerTouch1122Config = { enabled: true, canvasSelector: '[' };
      window.__originalGrab = function () {};
      window.ModAPI = { hooks: { _rippedStaticProperties: { nlei_PlatformInput: { pointerLockSupported: 1 } },
        methods: { nlei_PlatformInput_mouseSetGrabbed: window.__originalGrab } }, addEventListener() {} };
    });
    await page.addScriptTag({ path: scriptPath });
    assert.equal(await page.evaluate(() => ModAPI.hooks.methods.nlei_PlatformInput_mouseSetGrabbed === __originalGrab), true);
    assert.equal(await page.evaluate(() => ModAPI.hooks._rippedStaticProperties.nlei_PlatformInput.pointerLockSupported), 1);
    assert.equal(await page.evaluate(() => typeof window.EaglerTouch1122), 'undefined');
  } finally { await browser.close(); }
});
