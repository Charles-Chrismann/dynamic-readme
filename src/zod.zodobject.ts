
import * as z from "zod";

export const ConfigSchema = z.object({
  structure: z.array(
    z.discriminatedUnion("id", [
      z.object({
        id: z.literal("static/element"),
        data: z.object({
          element: z.enum([
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            // void elements
            'area',
            'base',
            'br',
            'col',
            'embed',
            'hr',
            'img',
            'input',
            'link',
            'meta',
            'param',
            'source',
            'track',
            'wbr'
          ]),
          content: z.string(),
        }),
        options: z.object({
          align: z.enum(["left", "right", "center"]).optional()
        }).optional(),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("static/raw"),
        data: z.object({
          content: z.string()
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("static/separator"),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("static/greeting"),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("static/profile-views"),
        data: z.object({
          login: z.string()
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("static/lines"),
        data: z.object({
          field: z.string(),
          range: z.string()
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("static/skills"),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("static/list"),
        data: z.object({
          field: z.string(),
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("dynamic/followers"),
        options: z.object({
          last: z.number(),
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("static/socials"),
        options: z.object({
          align: z.enum(["left", "right", "center"]).optional(),
        }).prefault({
          align: "left"
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("dynamic/gba"),
        data: z.object({
          uuid: z.string(),
          title: z.string(),
        }),
        options: z.object({
          scoreboard: z.boolean().default(false)
        }).prefault({}),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("dynamic/minesweeper"),
        data: z.object({
          uuid: z.string(),
          title: z.string().optional(),
          reset: z.string().optional(),
        }),
        options: z.object({
          gif: z.boolean().optional()
        }).prefault({
          gif: true
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("dynamic/chess"),
        data: z.object({
          uuid: z.string(),
          title: z.string().default('A classic Chess'),
          reset: z.string().default('Reset Game'),
        }),
        options: z.object({
          reset: z.boolean().default(true)
        }).prefault({}),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("dynamic/wordle"),
        data: z.object({
          title: z.string(),
        }).prefault({
          title: "A classic Wordle"
        }),
        options: z.object({
          scoreboard: z.boolean()
        }).prefault({
          scoreboard: true
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("static/trigger"),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("dynamic/generated"),
        disabled: z.boolean().optional(),
      }),

    ]),
  ),
  datas: z.object({
    repo: z.object({
      name: z.string(),
      owner: z.string(),
      path: z.string().default('README.md')
    }).optional(),
    user: z.looseObject({
      login: z.string(),
      firstname: z.string(),
      lastname: z.string(),
      description: z.union([
        z.string(),
        z.array(
          z.string(),
        ),
      ]),
      socials: z.array(
        z.object({
          name: z.enum([
            'linkedin',
            'instagram',
          ]),
          profile_url: z.url(),
          icon_url: z.url(),
        })
      )
    }).optional(),
    skills: z.record(
      z.string(), z.object({
        title: z.string(),
        direction: z.enum(['row', 'column']).default('column'),
        list: z.array(
          z.object({
            name: z.string(),
            url: z.string(),
            src: z.string(),
          })
        )
      })
    ).optional(),
  })
})

export type Config = z.output<typeof ConfigSchema>

export const wordleSchema = z.object({
  todayWordle: z.object({
    word: z.string(),
    guessed: z.boolean(),
    guesses: z.array(
      z.object({
        username: z.string(),
        userId: z.number(),
        guess: z.object({
          valid: z.boolean(),
          letters: z.array(
            z.object({
              value: z.string(),
              status: z.enum([
                "correct",
                "present",
                "absent",
              ])
            })
          )
        })
      })
    )
  }),
  scoreboard: z.array(
    z.object({
      username: z.string(),
      userId: z.number(),
      guesses: z.number(),
    })
  )
})

export type Wordle = z.output<typeof wordleSchema>

export const cellSchema = z.object({
  x: z.number(),
  y: z.number(),
  value: z.number(),
  hidden: z.boolean(),
})

export const minesweeperSchema = z.object({
  id: z.string(),
  map: z.array(
    z.array(
      cellSchema
    )
  ),
  history: z.array(
    z.tuple([z.number(), z.number()])
  ),
})

export type Minesweeper = z.output<typeof minesweeperSchema>

export const chessSchema = z.object({
  fen: z.string(),
  history: z.array(
    z.string()
  )
})

export type ChessSave = z.output<typeof chessSchema>