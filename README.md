## Setup

Steps:
1. git clone https://github.com/Charles-Chrismann/dynamic-readme
2. git switch dev
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
docker-compose -f docker-compose.dev.yml --env-file .env.dev up --build
```

Running in production:

```sh
docker-compose -f docker-compose.prod.yml up
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

note: production file not ready

To add
screenshot of the game
playing time
