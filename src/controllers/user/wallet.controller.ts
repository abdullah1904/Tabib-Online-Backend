import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../../utils/constants";
import { walletTopUpValidator } from "../../validators/user.validators";
import { stripe } from "../..";
import { config } from "../../utils/config";
import { check } from "drizzle-orm/gel-core";

const { HTTP_OK, HTTP_BAD_REQUEST } = HttpStatusCode;

const CreateWalletTopUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.user;
        const { error, value } = walletTopUpValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'pkr',
                    product_data: {
                        name: 'Wallet Top-Up',
                    },
                    unit_amount: value.amount * 100, // Convert to smallest currency unit
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${config.USER_FRONTEND_URL}/wallet?top-up=success`,
            cancel_url: `${config.USER_FRONTEND_URL}/wallet?top-up=cancel`,
            metadata: {
                userId: userId.toString(),
                amount: value.amount.toString(),
            },
        });

        res.status(HTTP_OK.code).json({
            message: "Checkout session created successfully",
            checkoutURL: session.url
        });
    }
    catch (error) {
        next(error);
    }
}

const ListWalletTopUps = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.user;
        const sessions = await stripe.checkout.sessions.list();
        const userSessions = sessions.data.filter(
            (session) => session.metadata?.userId === userId.toString()
        ).map((session) => ({
            id: session.id,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency,
            status: session.payment_status,
            checkoutURL: session.url,
            createdAt: new Date(session.created * 1000),
        }));
        res.status(HTTP_OK.code).json({
            message: "Wallet top-up sessions retrieved successfully",
            sessions: userSessions
        });
    }
    catch (error) {
        next(error);
    }
}

const DeleteWalletPendingTopUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.user;
        const { sessionId } = req.params;
        if (typeof sessionId !== 'string') {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Invalid session ID" });
            return;
        }
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.metadata?.userId !== userId.toString()) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Unauthorized" });
            return;
        }
        if (session.payment_status === "paid") {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Cannot delete a completed top-up" });
            return;
        }
        await stripe.checkout.sessions.expire(sessionId);
        res.status(HTTP_OK.code).json({
            message: "Pending top-up deleted successfully"
        });
    }
    catch (error) {
        next(error);
    }
}

export {
    CreateWalletTopUp,
    ListWalletTopUps,
    DeleteWalletPendingTopUp
}