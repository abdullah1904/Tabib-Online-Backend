import jwt from "jsonwebtoken"
import { config } from "./config"

const generateJWT = (id: number, type: "ACCESS" | "REFRESH") => {
    if (type === "ACCESS") {
        return jwt.sign({ id }, config.ACCESS_TOKEN_SECRET!, {expiresIn: config.ACCESS_TOKEN_EXPIRY} as jwt.SignOptions)
    }
    else if (type === "REFRESH") {
        return jwt.sign({ id }, config.REFRESH_TOKEN_SECRET!, {expiresIn: config.REFRESH_TOKEN_EXPIRY} as jwt.SignOptions)
    }
}

export {
    generateJWT
}