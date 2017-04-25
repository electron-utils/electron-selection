'use strict';

const selection = require('../index');
const sinon = require('sinon');
const ipcPlus = require('electron-ipc-plus');

let helper = {
  init() {
    [
      'sendToMain',
      'sendToWins',
      'sendToAll',
    ].forEach(name => {
      this[name] = sinon.spy(ipcPlus, name);
    });

    this._spyWithArgs = {};
  },

  reset() {
    [
      'sendToMain',
      'sendToWins',
      'sendToAll',
    ].forEach(name => {
      if (this[name].reset) {
        this[name].reset();
      }
    });
  },

  spyMessages(method, messages) {
    let spyMethod = this[method];
    if ( !spyMethod ) {
      return;
    }

    let results = [];
    let spy = this._spyWithArgs[method] || {};
    messages.forEach(name => {
      let spyCall = spyMethod.withArgs(name);
      spy[name] = spyCall;
      results.push(spyCall);
    });
    this._spyWithArgs[method] = spy;

    return results;
  },

  message ( method, message ) {
    let spy = this._spyWithArgs[method];
    if ( spy ) {
      return spy[message];
    }

    return null;
  }
};

suite(tap, 'selection', { timeout: 2000 }, t => {
  selection.register('normal');
  selection.register('special');
  helper.init();

  t.beforeEach(done => {
    selection.clear('normal');
    selection.clear('special');
    helper.reset();

    done();
  });

  suite(t, 'selection.select', t => {
    t.test('it should work for simple case', t => {
      selection.select('normal', 'a');
      t.same(selection.curSelection('normal'), ['a']);
      t.equal(selection.curActivate('normal'), 'a');

      selection.select('normal', 'b');
      t.same(selection.curSelection('normal'), ['b']);
      t.equal(selection.curActivate('normal'), 'b');

      t.end();
    });

    t.test('it should work with array', t => {
      selection.select('normal', ['a', 'b']);
      t.same(selection.curSelection('normal'), ['a', 'b']);
      t.equal(selection.curActivate('normal'), 'b');

      selection.select('normal', ['c', 'd']);
      t.same(selection.curSelection('normal'), ['c', 'd']);
      t.equal(selection.curActivate('normal'), 'd');

      t.end();
    });

    t.test('it should work with confirm', t => {
      selection.select('normal', 'a', false, false);
      selection.select('normal', 'b', false, false);
      selection.select('normal', 'c', false, false);
      selection.select('normal', 'd', false, false);

      t.same(selection.curSelection('normal'), ['a', 'b', 'c', 'd']);
      t.equal(selection.curActivate('normal'), null);

      selection.confirm();
      t.equal(selection.curActivate('normal'), 'd');

      t.end();
    });

    t.test('it should work with cancel', t => {
      selection.select('normal', 'a');
      selection.select('normal', 'b', false, false);
      selection.select('normal', 'c', false, false);
      selection.select('normal', 'd', false, false);

      selection.cancel();
      t.same(selection.curSelection('normal'), ['a']);
      t.equal(selection.curActivate('normal'), 'a');

      t.end();
    });

    t.test('should active none when nothing select', t => {
      selection.select('normal', ['a', 'b', 'c', 'd']);
      selection.select('normal', []);

      t.same(selection.curSelection('normal'), []);
      t.equal(selection.curActivate('normal'), null);

      selection.select('normal', ['a', 'b', 'c', 'd']);
      selection.select('normal', null);

      t.same(selection.curSelection('normal'), []);
      t.equal(selection.curActivate('normal'), null);

      selection.select('normal', ['a', 'b', 'c', 'd']);
      selection.select('normal', '');

      t.same(selection.curSelection('normal'), []);
      t.equal(selection.curActivate('normal'), null);

      t.end();
    });

    // NOTE: I am argue about this
    t.test('it should not break the order of the selection when item already selected', t => {
      selection.select('normal', ['a', 'b', 'c', 'd']);
      t.same(selection.curSelection('normal'), ['a', 'b', 'c', 'd']);
      t.equal(selection.curActivate('normal'), 'd');

      selection.select('normal', ['d', 'e', 'c', 'b']);
      t.same(selection.curSelection('normal'), ['b', 'c', 'd', 'e']);
      t.equal(selection.curActivate('normal'), 'b');

      t.end();
    });

    t.test('it should not break the order of the selection when selection not confirmed', t => {
      selection.select('normal', ['a', 'b', 'c', 'd'], false);
      t.same(selection.curSelection('normal'), ['a', 'b', 'c', 'd']);

      selection.select('normal', ['d', 'e', 'c', 'b'], false);
      t.same(selection.curSelection('normal'), ['a', 'b', 'c', 'd', 'e']);

      selection.confirm();
      t.equal(selection.curActivate('normal'), 'b');

      t.end();
    });

    t.test('it should send ipc selection:selected when select item', t => {
      helper.spyMessages('sendToAll', [
        'selection:selected',
        'selection:unselected',
      ]);

      //
      selection.select('normal', 'a');

      t.assert(helper.sendToAll.calledWith('selection:selected', 'normal', ['a']));
      t.assert(helper.sendToAll.calledWith('selection:activated', 'normal', 'a'));

      //
      selection.select('normal', 'b');

      t.assert(helper.sendToAll.calledWith('selection:unselected', 'normal', ['a']));
      t.assert(helper.sendToAll.calledWith('selection:selected', 'normal', ['b']));
      t.assert(helper.sendToAll.calledWith('selection:deactivated', 'normal', 'a'));
      t.assert(helper.sendToAll.calledWith('selection:activated', 'normal', 'b'));

      //
      selection.select('normal', ['c', 'd']);

      t.assert(helper.sendToAll.calledWith('selection:unselected', 'normal', ['b']));
      t.assert(helper.sendToAll.calledWith('selection:selected', 'normal', ['c', 'd']));
      t.assert(helper.sendToAll.calledWith('selection:deactivated', 'normal', 'b'));
      t.assert(helper.sendToAll.calledWith('selection:activated', 'normal', 'd'));

      //
      selection.select('normal', ['a', 'b']);

      t.assert(helper.sendToAll.calledWith('selection:unselected', 'normal', ['c', 'd']));
      t.assert(helper.sendToAll.calledWith('selection:selected', 'normal', ['a', 'b']));
      t.assert(helper.sendToAll.calledWith('selection:deactivated', 'normal', 'd'));
      t.assert(helper.sendToAll.calledWith('selection:activated', 'normal', 'b'));

      //
      t.equal(helper.message('sendToAll', 'selection:selected').callCount, 4);
      t.equal(helper.message('sendToAll', 'selection:unselected').callCount, 3);

      t.end();
    });

    t.test('it should not send ipc selection:selected when the item already selected', t => {
      helper.spyMessages('sendToAll', [
        'selection:selected',
      ]);
      let ipcSelected = helper.message('sendToAll', 'selection:selected');

      selection.select('normal', 'a', false);
      selection.select('normal', 'a', false);
      selection.select('normal', 'b', false);
      selection.select('normal', ['a', 'b'], false);
      selection.select('normal', ['a', 'b', 'c', 'd'], false);

      t.assert(ipcSelected.getCall(0).calledWith('selection:selected', 'normal', ['a']));
      t.assert(ipcSelected.getCall(1).calledWith('selection:selected', 'normal', ['b']));
      t.assert(ipcSelected.getCall(2).calledWith('selection:selected', 'normal', ['c', 'd']));
      t.equal(ipcSelected.callCount, 3);

      t.end();
    });

    t.test('it should send ipc message in order', t => {
      selection.select('normal', 'a');
      selection.select('normal', 'b');

      t.same(helper.sendToAll.args, [
        ['_selection:selected', 'normal', ['a'], { __ipc__: true, excludeSelf: true }],
        ['selection:selected', 'normal', ['a']],

        ['_selection:activated', 'normal', 'a', { __ipc__: true, excludeSelf: true }],
        ['selection:activated', 'normal', 'a'],

        ['_selection:changed', 'normal', { __ipc__: true, excludeSelf: true }],
        ['selection:changed', 'normal'],

        ['_selection:unselected', 'normal', ['a'], { __ipc__: true, excludeSelf: true }],
        ['selection:unselected', 'normal', ['a']],

        ['_selection:selected', 'normal', ['b'], { __ipc__: true, excludeSelf: true }],
        ['selection:selected', 'normal', ['b']],

        ['_selection:deactivated', 'normal', 'a', { __ipc__: true, excludeSelf: true }],
        ['selection:deactivated', 'normal', 'a'],

        ['_selection:activated', 'normal', 'b', { __ipc__: true, excludeSelf: true }],
        ['selection:activated', 'normal', 'b'],

        ['_selection:changed', 'normal', { __ipc__: true, excludeSelf: true }],
        ['selection:changed', 'normal'],
      ]);

      t.end();
    });
  });

  suite(t, 'selection.unselect', t => {
    t.test('it should work for simple case', t => {
      selection.select('normal', ['a', 'b', 'c', 'd']);
      selection.unselect('normal', 'c');

      t.same(selection.curSelection('normal'), ['a', 'b', 'd']);

      selection.unselect('normal', ['d', 'a']);
      t.same(selection.curSelection('normal'), ['b']);

      selection.unselect('normal', 'd');
      t.same(selection.curSelection('normal'), ['b']);

      selection.unselect('normal', ['a', 'b', 'c', 'd']);
      t.same(selection.curSelection('normal'), []);

      t.end();
    });

    t.test('it should not sending non-selected items in the ipc message when unselect', t => {
      selection.select('normal', ['a', 'b', 'c', 'd']);
      selection.unselect('normal', ['d', 'e']);

      t.assert(helper.sendToAll.calledWith('selection:unselected', 'normal', ['d']));
      t.assert(helper.sendToAll.calledWith('selection:deactivated', 'normal', 'd'));

      selection.unselect('normal', ['b', 'c']);
      t.assert(helper.sendToAll.calledWith('selection:unselected', 'normal', ['b', 'c']));
      t.assert(helper.sendToAll.calledWith('selection:deactivated', 'normal', 'c'));

      t.end();
    });
  });

  suite(t, 'selection.hover', t => {
    t.test('it should store the last hover item', t => {

      selection.hover('normal', 'a');
      t.equal(selection.hovering('normal'), 'a');

      selection.hover('normal', 'b');
      t.equal(selection.hovering('normal'), 'b');

      selection.hover('normal', 'c');
      t.equal(selection.hovering('normal'), 'c');

      selection.hover('normal', null);
      t.equal(selection.hovering('normal'), null);

      t.end();
    });

    t.test('it should send hover and unhover ipc message in order', t => {

      selection.hover('normal', 'a');
      selection.hover('normal', 'b');
      selection.hover('normal', null);

      t.same(helper.sendToAll.args, [
        ['_selection:hoverin', 'normal', 'a', { __ipc__: true, excludeSelf: true }],
        ['selection:hoverin', 'normal', 'a'],

        ['_selection:hoverout', 'normal', 'a', { __ipc__: true, excludeSelf: true }],
        ['selection:hoverout', 'normal', 'a'],

        ['_selection:hoverin', 'normal', 'b', { __ipc__: true, excludeSelf: true }],
        ['selection:hoverin', 'normal', 'b'],

        ['_selection:hoverout', 'normal', 'b', { __ipc__: true, excludeSelf: true }],
        ['selection:hoverout', 'normal', 'b'],
      ]);

      t.end();
    });
  });

  suite(t, 'selection.setContext', t => {
    t.test('it should store the context', t => {
      selection.select('normal', ['a', 'b', 'c', 'd']);
      selection.setContext('normal', 'e');

      t.same(selection.contexts('normal'), ['e']);

      selection.setContext('normal', 'c');
      t.same(selection.contexts('normal'), ['c', 'a', 'b', 'd']);

      t.end();
    });
  });

  suite(t, 'selection.clear', t => {
    t.test('it should not send changed ipc message when clear multiple times', t => {
      let ipcChanged = helper.sendToAll.withArgs('selection:changed');

      selection.clear('normal');
      selection.clear('normal');
      selection.clear('normal');
      selection.clear('normal');
      t.equal(ipcChanged.callCount, 0);

      selection.select('normal', ['a', 'b', 'c', 'd']);
      t.equal(ipcChanged.callCount, 1);

      selection.clear('normal');
      t.equal(ipcChanged.callCount, 2);

      selection.clear('normal');
      t.equal(ipcChanged.callCount, 2);

      t.end();
    });
  });

  suite(t, 'Global Active', t => {
    t.test('it should change global active call selection confirmed in different type', t => {
      selection.select('normal', ['a', 'b', 'c', 'd']);
      t.same(selection.curGlobalActivate(), {
        type: 'normal',
        id: 'd',
      });

      selection.select('special', ['a1', 'b1', 'c1', 'd1']);
      t.same(selection.curGlobalActivate(), {
        type: 'special',
        id: 'd1',
      });

      selection.select('normal', ['a', 'b', 'c', 'd']);
      t.same(selection.curGlobalActivate(), {
        type: 'normal',
        id: 'd',
      });

      selection.unselect('special', 'd1');
      t.same(selection.curGlobalActivate(), {
        type: 'special',
        id: 'c1',
      });

      t.end();
    });

    t.test('it should send activated and deactivated ipc message', t => {
      helper.spyMessages('sendToAll', ['selection:deactivated']);
      let ipcDeactivated = helper.message('sendToAll', 'selection:deactivated');

      selection.select('normal', ['a', 'b', 'c', 'd']);
      t.assert(helper.sendToAll.calledWith('selection:activated', 'normal', 'd'));

      selection.select('special', ['a1', 'b1', 'c1', 'd1']);
      t.assert(!ipcDeactivated.called);
      t.assert(helper.sendToAll.calledWith('selection:activated', 'special', 'd1'));

      selection.select('normal', ['a', 'b', 'c', 'd']);
      t.assert(!ipcDeactivated.called);
      t.assert(helper.sendToAll.calledWith('selection:activated', 'normal', 'd'));

      t.end();
    });
  });

  suite(t, 'Local Selection', t => {
    let local = selection.local();

    t.beforeEach(done => {
      local.clear();
      done();
    });

    t.test('it should not send ipc message', t => {
      helper.spyMessages('sendToAll', [
        'selection:selected',
        'selection:unselected',
      ]);

      //
      local.select('a');
      t.same(local.selection, ['a']);
      t.equal(local.lastActive, 'a');

      local.select('b');
      t.same(local.selection, ['b']);
      t.equal(local.lastActive, 'b');

      t.assert(helper.sendToAll.neverCalledWith('selection:selected'));
      t.assert(helper.sendToAll.neverCalledWith('selection:unselected'));

      t.end();
    });
  });

});
