import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { faunadb } from "../../services/faunadb";
import { stripe } from "../../services/stripe";

import {query as q} from 'faunadb'

type User = {
  ref: {
    id: string
  },
  data: {
    stripe_customer_id: string
  }
}

export default async (req: NextApiRequest , res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req })

    const user = await faunadb.query<User>(
      q.Get(
        q.Match(
          q.Index('users_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    let customerId = user.data.stripe_customer_id

    if(!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      })
  
      await faunadb.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id
            }
          }
        )
      )

      customerId = stripeCustomer.id
    }

    const srtipeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: 'price_1KljvxJ8riF7GwapklC0KA0N', quantity: 1 }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    })

    return res.status(200).json({sessionId: srtipeCheckoutSession.id})
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}