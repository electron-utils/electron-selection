# electron-selection

[![Linux Build Status](https://travis-ci.org/electron-utils/electron-selection.svg?branch=master)](https://travis-ci.org/electron-utils/electron-selection)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/6yf7w89hhcby7mcl?svg=true)](https://ci.appveyor.com/project/jwu/electron-selection)
[![Dependency Status](https://david-dm.org/electron-utils/electron-selection.svg)](https://david-dm.org/electron-utils/electron-selection)
[![devDependency Status](https://david-dm.org/electron-utils/electron-selection/dev-status.svg)](https://david-dm.org/electron-utils/electron-selection#info=devDependencies)

Global Selection

## Why?

  - Sync selection in multiple windows

## Install

```bash
npm install --save electron-selection
```

## Run Examples:

```bash
npm start examples/${name}
```

## Usage

```javascript
const selection = require('electron-selection');

selection.register('normal');
selection.select('normal', ['a', 'b', 'c', 'd']);

// ['a', 'b', 'c', 'd']
console.log(selection.curSelection('normal'));
```

## API Reference

### Methods

#### selection.register (type)

  - `type` string

#### selection.reset ()

#### selection.local ()

Returns a `selection.ConfirmableSelectionHelper` instance.

#### selection.confirm ()

Confirms all current selecting objects, no matter which type they are.
This operation may trigger deactivated and activated events.

#### selection.cancel ()

Cancels all current selecting objects, no matter which type they are.
This operation may trigger selected and unselected events.

#### selection.confirmed (type)

  - `type` string

Check if selection is confirmed.

#### selection.select (type, id[, unselectOthers, confirm])

  - `type` string
  - `id` string
  - `unselectOthers` boolean
  - `confirm` boolean

Select item with its id.

#### selection.unselect (type, id[, confirm])

  - `type` string
  - `id` string
  - `confirm` boolean

Unselect item with its id.

#### selection.hover (type, id)

  - `type` string
  - `id` string

Hover item with its id. If id is null, it means hover out.

#### selection.setContext (type, id)

  - `type` string
  - `id` string

#### selection.patch (type, srcID, destID)

  - `type` string
  - `srcID` string
  - `destID` string

#### selection.clear (type)

  - `type` string

#### selection.hovering (type)

  - `type` string

#### selection.contexts (type)

  - `type` string

#### selection.curActivate (type)

  - `type` string

#### selection.curGlobalActivate (type)

  - `type` string

#### selection.curSelection (type)

  - `type` string

#### selection.filter (items, mode, func)

  - `items` array(string)
  - `mode` string - 'top-level', 'deep' and 'name'
  - `func` function

## License

MIT © 2017 Johnny Wu
