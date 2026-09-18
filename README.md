# Dynamic Readme

This NestJs app allows you to create a fully interactive profile README, such as [mine](https://github.com/Charles-Chrismann), by displaying functional minigames on the page.

It is inspired by [some other dynamic profile READMEs](https://github.com/abhisheknaiidu/awesome-github-profile-readme) (I remember [timburgan's one](https://github.com/timburgan/timburgan) as a motivation to start) that work with GitHub Actions on issues or by images, like the [profile views counter service](https://github.com/antonkomarev/github-profile-views-counter).

This project takes a different approach by creating a new commit on the repository for most of the provided features.

<details>
  <summary><strong>📚 Table of Contents</strong></summary>

- 💭 [Philosophy](#-philosophy)
- 🏗️ [Project Structure](#%EF%B8%8F-project-structure)
- 🛠️ [Installation](#%EF%B8%8F-installation)
- ✨ [Contributing](#-contributing)
- ⚖️ [License](#%EF%B8%8F-license)
- 📝 [To Do](#-to-do)

</details>

## 💭 Philosophy

As you can see on many GitHub users' profiles, the profile is often divided into multiple sections such as "About Me", "My Projects", "My Tools", "Contact Me" etc.

This project follows the same philosophy by dividing the file into what are called **modules**, which handle the logic and rendering of each section of the final file.

## 🏗️ Project Structure

The core files and folders of the app are as follows:

- **`src/modules`**: contains both static and dynamic modules. Each module encapsulates the logic for its section of the file and is also responsible for rendering that specific section.  
- **`src/State.js`**: the `State` class manages all modules and the final rendering of the file.  
- **`src/services/ConfigService.ts`**: a utility class used to access environment variables and the configuration object.  
- **`src/services/ReadmeService.ts`**: a utility class used to interact with GitHub. Most of the time, you’ll want to call `ReadmeService.updateReadmeAndRedirect()`. (Use `ReadmeService.doNothingAndRedirect()` if there are no changes to apply.)  
- **`src/services/RequestService.ts`**: a utility class used to interact with the GitHub REST and GraphQL APIs.

A module can extend either the **AbstractStaticModule**, which means it is not likely to change, for example, an “About Me” section.

A module can also extend the **AbstractDynamicModule**, which means it will change over time, for example, a chess game or a “Latest Followers” section.

The workflow in all modules/games follows the same pattern:

1. The user clicks a link in the README and makes a GET request to the app.
2. The involved controller is called.
3. The associated service is called.
4. If a commit is needed, the app waits for the commit to be performed.
5. The app returns a redirection to the client for the profile README page that has been updated.

This results in a seemingly simple page refresh for the user.

> [!NOTE]
> GitHub's cache system seems to work differently for logged-in users and non-logged-in users; non-logged-in users may not be able to instantly view new changes.

## 🛠️ Installation

In order to make the app work, 3 places needs setup:
- [`VPS installation`](#vps-installation): Your code needs to run somewhere
- [`Domain name`](#domain-name): Make your app works under domain name (the app might works under IP adressn not tested)
- [`Github repository`](#domain-name): Some modules such as the wordle module takes adventage of github actions/images stored in the assets folder

### VPS installation

The easiest way to develop/deploy is through Docker

Requirements:
  - Docker (obviously)

Steps:
1. git clone https://github.com/Charles-Chrismann/dynamic-readme
2. dupe .env.example and rename it .env, fill variables
3. build image:
```
docker build -t dynamic-readme .
```
4. run image:
```
docker run --env-file .env dynamic-readme -p 3000:3000
```

### Domain name

Create a domain/sub domain name poiting to your application

### Github repository

1. Create files

To setup the dynamic github repository, you can juste copy the content of the `to-copy/` folder in the root of the target repository.

The final repository structure should look like this.

```
/
├── .github/
│   └── workflows/
│       └── wordle.yml
├── assets/
│   └── gba/
│       ├── bottom-top-right.png
│       └── ...
└── README.md
```

2. Define environment secrets & variables

The secrets and variables can be define at the adress https://github.com/owner-name/owner-name/settings/secrets/actions

Secrets to set:
- `API_AUTH_TOKEN`
- `GH_TOKEN`

Variables to set:
- `APP_BASE_URL`

## ✨ Contributing

Contributions are welcome!
If you want to improve the project, fix a bug, or add a new feature, feel free to open a pull request or submit an issue.

Before contributing, please make sure your code is clean, consistent, and well-documented.  
Try as much as possible to follow the existing project structure and naming conventions to keep everything coherent.

No pressure, if you take a look at the code you will find a lot of dead/commented code, all contributions are welcome!

## ⚖️ License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

This means that:
- You are free to **use, modify, and distribute** the software.
- If you distribute a modified version, you **must make your source code available** under the same license (GPL-3.0).
- You **cannot** make the software proprietary or distribute it under a different license.
- Any derivative work must remain **open source** and **credit the original author**.

👉 In short: you can do almost anything with the code, as long as you **keep it open source** and **share your modifications** under the same terms.

For more details, see the full license text in the [LICENSE](./LICENSE) file.


## 📝 To Do

This section is not mean to be user friendly, just taking notes

<details>
  <summary>📝 To do</summary>

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

add wordle responve include wordle 

add wordle way to submit a new guess as a response of an issue

add display scoreboard for gab

add ui + connection live play for gba

add display scoreboard for game boy color

add display scoreboard for wordle

create a full configuration tutorial for each module

add thing to think on vm such as date for wordle reset for example

switch chess to chess.js

add chess plays orders

add chess game progress

add a save-reset for the app (functions that return a zip, that can be provided to a blank app to return to the at time created zip without reconfiguring)

check config script

add json compress config

make it publishable on dockerhub (volume for config.json)

add single `config` folder

make roms optionnal

complete setup steps

explain env variables

better readme (illustrations)

add badge support for contact module

add custom title for contact (reach me) module

add admin dashboard

disable game schedule if not runned

add possibiity to disable games (gameboy service should not save if not displayed) & support for resume

add theme configuration with colors and style buttons

store md in variable to avoid rereender

Add translation keys

needsRender: rerender instantly instead of just setting variable and wait for next render call

Add option to commit on start

add live way to disable module

</details>

