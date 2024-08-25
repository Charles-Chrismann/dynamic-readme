# Configuration

This project is fully configurable from a `config.json` file.

> A starter config file can be obtained by copying and renaming the `config.example.json` file.

For now (can change) the json structure is as follow:

- `structure`: define the final structure of the README file.
  - `id`: first part (static, element, games...) describe the category of the block, the last element describe the module responsible for the render
- `datas`: The personal datas of the user.
- `skills`: should be in datas

## Modules

The readme file is separated into small chunks that are called modules.

The structure of the file can be edited in the `structure` property of the `config.json` file.

The `structure`  property is a list of modules, as follow:

```jsonc
// config.json
{
  "structure": [
    {
      "id": "module/1",
      "data": {},
      "options": {
        "title": "module 1"
      }
    },
    {
      "id": "module/2",
      "disabled": true // modules can be disabled this way
      // `data` key might not be required for some modules
      // `options` key is always optional, each options is intended to have a default value
    },
    ...
  ],
  "datas": {...},
  "skils": {...}
},
```

### Static modules

Static modules are only calculated once (on first commit after start up), they are for informations that are not intended to change like your name, description...

#### Element

Represents an html element.

```jsonc
{
  "id": "static/element",
  "data": {
    "element": "h1",
    "content": "👋 - Hi visitor"
  }
}
```

#### Greeting

Represents a simple greeting as follow: `<h3>I'm Firstname Lastname !</h3>`

```jsonc
{
  "id": "static/greeting",
  // no data is required for this element, the datas taken from config.json under datas.perso.firstname
}
```

#### Lines

Represents multiples lines, an alternative to avoid using multiple `static/element`.

```jsonc
{
  "id": "static/lines",
  "data": {
    "field": "perso.description", // should be an array
    "range": "1-2" // currently supports a single line ("3") or a simple range ("1-3"), not even a combination of the two.
    // index for range starts at 1.
  }
}
```

#### List

Represents an unordered list such as:

```
<ul>
  <li>...</li>
  <li>...</li>
  <li>...</li>
</ul>
```

```jsonc
{
  "id": "static/list",
  "data": {
    "field": "perso.facts" // should be an array
  }
}
```

#### Socials

Displays the list of socials in `datas.perso.socials`

```jsonc
{
  "id": "static/socials",
  "options": {
    "align": "left" // position of the icons
  }
}
```

#### Skills

Displays the list of skills in `skills`

```jsonc
{
  "id": "static/skills"
}
```

#### Trigger

Displays an image that triggers the / controller in the trigger module each time someone visits the readme page.

> currently required for the followers module to work

```jsonc
{
  "id": "static/trigger"
}
```

### Dynamic modules

#### Followers

Dislays the last followers.

```jsonc
{
  "id": "dynamic/followers",
  "options": {
    "last": 3 // not working for now
  }
},
```

#### Generated

Displays the date of the last update with the duration of the generation at the end of the file.

```jsonc
{
  "id": "dynamic/generated"
}
```

### Games modules

#### GBA

Displays a gba game.

```jsonc
{
  "id": "games/gba",
  "data": {
    "title": "Github plays pokemon"
  },
  "options": {
    "scoreboard": false // not implemented
  }
}
```

#### Minesweeper

Displays a minesweeper.

```jsonc
{
  "id": "games/minesweeper",
  "data": {
    "title": "A classic Minesweeper",
    "reset": "Reset Game" // Text for the reset button
  },
  "options": {
    "gif": true, // gif of the progress of the game
  }
},
```

#### Chess

Display a chess game.

```jsonc
{
  "id": "games/chess",
  "data": {
    "title": "A classic Chess",
    "reset": "Reset Game" // Text for the reset button
  },
  "options": {
    "reset": true // not implemented
  }
}
```

#### Wordle

Displays a wordle game, reset each day at midnight.

```jsonc
{
  "id": "games/wordle",
  "data": {
    "title": "A classic Wordle"
  },
  "options": {
    "scoreboard": true // not implmented
  }
}
```

### 3rdParty modules

#### Profil Views

Displays the profile views image configured in `datas.perso.vueCount`

```jsonc
{
  "id": "3rdParty/profileViews"
}
```