import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "./utils/constants";
import { config } from "./utils/config";
import { stripe } from ".";
import { logger } from "./utils/logger";
import Stripe from "stripe";

const {
    HTTP_OK,
    HTTP_BAD_REQUEST
} = HttpStatusCode;

export const StripeWebHook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sig = req.headers['stripe-signature'] as string;
        const endpointSecret = config.STRIPE_WEBHOOK_SECRET!;

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                endpointSecret
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            logger.error(`Stripe webhook signature verification failed: ${message}`);
            res.status(HTTP_BAD_REQUEST.code).send(`Webhook Error: ${message}`);
            return;
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            const userIdStr = session.metadata?.userId;
            const amount = parseFloat(session.metadata?.amount || '0');

            if (!userIdStr || !amount) {
                logger.error('Missing userId or amount in session metadata');
                res.status(HTTP_BAD_REQUEST.code).json({ error: 'Invalid session metadata' });
                return;
            }

            const userId = parseInt(userIdStr, 10);

            if (session.payment_status === 'paid') {

                // await db.update(UserTable).set({
                //     balance: sql`${UserTable.balance} + ${amount}`
                // }).where(eq(UserTable.id, userId));

                logger.info(`Wallet top-up successful for user ${userId}: ${amount} PKR`);
                return res.status(HTTP_OK.code).json({ message: 'Wallet top-up successful' });
            } else {
                logger.warn(`Payment not completed for session ${session.id}`);
            }
        }
    }
    catch (error) {
        next(error);
    }
}