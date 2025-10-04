import "dotenv/config"

function getValue<T>(key: string, defaultValue: T) {
    const value = process.env[key];
    return value ?? defaultValue;
}

export const config = {
    PORT: getValue("PORT", null), 
    DATABASE_URL: getValue("DATABASE_URL", null),
    ACCESS_TOKEN_SECRET: getValue("ACCESS_TOKEN_SECRET", null),
    ACCESS_TOKEN_EXPIRY: getValue("ACCESS_TOKEN_EXPIRY", null),
    REFRESH_TOKEN_SECRET: getValue("REFRESH_TOKEN_SECRET", null),
    REFRESH_TOKEN_EXPIRY: getValue("REFRESH_TOKEN_EXPIRY", null),
    CLOUDINARY_CLOUD_NAME: getValue("CLOUDINARY_CLOUD_NAME", null),
    CLOUDINARY_API_KEY: getValue("CLOUDINARY_API_KEY", null),
    CLOUDINARY_API_SECRET: getValue("CLOUDINARY_API_SECRET", null),
    MAIL_USER: getValue("MAIL_USER", ""),
    MAIL_PASS: getValue("MAIL_PASS", ""),
};