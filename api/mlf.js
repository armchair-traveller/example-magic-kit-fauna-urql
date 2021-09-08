// ! DEPRECATED. This is just example code of trying to get Magic to run on Cloudflare Workers, but it doesn't run in a non-node env
import { Router } from 'itty-router'
import { Magic } from '@magic-sdk/admin'
import { mutation } from './query'
import { gql } from '@urql/core'

/**
 * @param {Request} req
 */
export default function mlf(req) {
  const app = Router({ base: '/mlf' })

  app.post('/login', async (req) => {
    const { email } = req.body
    const m = new Magic(MLF_MAGIC)
    const didToken = m.utils.parseAuthorizationHeader(
      req.headers.get('Authorization')
    )

    if (email && didToken) {
      try {
        const validationProm = m.token.validate(didToken)
        const userDetailsProm = [
          m.users.getMetadataByToken(didToken),
          mutation(
            gql`
              mutation Login($email: String!) {
                result: loginUser(input: { email: $email }) {
                  token
                  exp
                  userInfo {
                    email
                  }
                }
              }
            `,
            { email }
          ),
        ]
        const [
          metadata,
          {
            data: {
              result: { token, exp, userInfo },
            },
          },
          resp,
        ] = await Promise.all(userDetailsProm)

        console.log(metadata, resp)

        await validationProm

        if (userInfo.email == metadata.email)
          // confirm details align
          return { token, exp, userInfo }
      } catch (error) {
        console.log(error)
      }
    }
    return ['Unable to verify', { status: 400 }]
  })

  app.all('*', () => ['Invalid operation', { status: 400 }])

  return app.handle(req)
}
