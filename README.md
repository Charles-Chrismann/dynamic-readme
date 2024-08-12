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
