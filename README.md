# Dynamic Readme

Voici la version corrigée du texte sans changer le sens :

---

This NestJs app allows you to create a fully interactive profile README, such as [mine](https://github.com/Charles-Chrismann), by displaying functional minigames on the page.

It is inspired by [some other dynamic profile READMEs](https://github.com/abhisheknaiidu/awesome-github-profile-readme) (I remember [timburgan's one](https://github.com/timburgan/timburgan) as a motivation to start) that work with GitHub Actions on issues or by images, like the [profile views counter service](https://github.com/antonkomarev/github-profile-views-counter).

This project takes a different approach by creating a new commit on the repository for most of the provided features.

The workflow in all modules/games follows the same pattern:

1. The user clicks a link in the README and makes a GET request to the app.
2. The involved controller is called.
3. The associated service is called.
4. If a commit is needed, the app waits for the commit to be performed.
5. The app returns a redirection to the client for the profile README page that has been updated.

This results in a seemingly simple page refresh for the user.

**Please note**: GitHub's cache system seems to work differently for logged-in users and non-logged-in users; non-logged-in users may not be able to instantly view new changes.

## Setup

Steps:
1. git clone https://github.com/Charles-Chrismann/dynamic-readme
3. npm i
4. dupe .env.example and rename it .env, fill variables
4. dupe config.example.json and rename it config.json, fill variables
5. scp ./the-rom.gb user@ip:~/dynamic-readme/roms/pr.gb (from local terminal)

## Developpement

Requirements:
  - Docker
  - docker compose

Running in developpement:

```sh
git pull
npm i
rm -rf dist/
docker build -t charleschrismann/dynamic-readme:latest .
docker compose -f docker-compose.dev.yml --env-file .env.dev up --build --remove-orphans
```

Running in production:

```sh
docker compose -f docker-compose.prod.yml up
```

delet all volumes

```sh
docker compose -f docker-compose.dev.yml --env-file .env.dev down -v
```

redis cli

```
redis-cli -h localhost -p 6379
KEYS *
```

Backup

```sh
docker exec dr-prod-redis redis-cli save
docker cp dr-prod-redis:/data/dump.rdb ./dump.rdb
```

Restore

```sh
docker cp ./dump.rdb dr-prod-redis:/data/dump.rdb
docker restart dr-prod-redis
```

note: production file not ready

To add

screenshot of the game

playing time

disable some games/modules

upgrade config.md

ui to update the config file without restarting the app

provide a raw module for the config file

make dynamic/followers independant from trigger 

make tigger content configurable

add 3third party such as github statistics 

fix dynamic/followers last works

implement the `scoreboard` options in games/gba

add steps for configurate each module
- gba

Add options for the minesweeper, width, height

Add default config files `config.default.json`

for games with a reset option button, switch to:

```jsonc
{
  "reset": {
    "display": true,
    "content": "reset game"
  }
}

```

Add hide reset btn for chess, and protect the reset route

Add hide reset btn for Minesweeper, and protect the reset route

UI for manage the app, reset games, with authentitcation

protect the reset route for wordle

add issue template

add multiple backup for gba + screen/gif of la view

add wordle custom response in case of bad submission (too long/ invalid)

add display scoreboard for gab

add ui + connection live play for gba

add display scoreboard for game boy color

add display scoreboard for wordle

create a full configuration tutorial for each module

add thing to think on vm such as date for wordle reset for example

add license

switch chess to chess.js

add chess plays orders

add chess game progress

add a save-reset for the app (functions that return a zip, that can be provided to a blank app to return to the at time created zip without reconfiguring)

check config script

add json compress config

make it publishable on dockerhub (volume for config.json)