
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
        id: z.literal("static/greeting"),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("static/profile-views"),
        data: z.object({
          username: z.string()
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
          align: z.enum(["left", "right", "center"]),
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
          scoreboard: z.boolean()
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("dynamic/minesweeper"),
        data: z.object({
          uuid: z.string(),
          title: z.string(),
          reset: z.string(),
        }),
        options: z.object({
          gif: z.boolean()
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("dynamic/chess"),
        data: z.object({
          uuid: z.string(),
          title: z.string(),
          reset: z.string(),
        }),
        options: z.object({
          reset: z.boolean()
        }),
        disabled: z.boolean().optional(),
      }),
      z.object({
        id: z.literal("dynamic/wordle"),
        data: z.object({
          title: z.string(),
        }),
        options: z.object({
          scoreboard: z.boolean()
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
      url: z.url({
        protocol: /^https$/,
        hostname: /^github.com$/
      }),
      readme: z.object({
        path: z.string()
      })
    }),
    perso: z.object({
      homepage: z.url({
        protocol: /^https$/,
        hostname: /^github.com$/
      }),
      username: z.string(),
      firstname: z.string(),
      lastname: z.string(),
      description: z.array(
        z.string()
      ),
      facts: z.object({
        title: z.string(),
        content: z.array(
          z.string()
        ),
      }),
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
    }),
    skills: z.record(
      z.string(), z.object({
        title: z.string(),
        direction: z.enum(['row', 'column']).default('column'),
        list: z.array(
          z.object({
            name: z.string(),
            url: z.string(),
            src: z.string(),
            alt: z.string()
          })
        )
      })
    ),
    "3rdParty": z.object({
      views_count: z.url(),
    }).optional()
  })
})