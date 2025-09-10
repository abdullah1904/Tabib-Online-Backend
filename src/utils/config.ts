import "dotenv/config"

function getValue<T>(key: string, defaultValue: T) {
    const value = process.env[key];
    return value ?? defaultValue;
}

export const config = {
    PORT: getValue("PORT", null), 
    DATABASE_URL: getValue("DATABASE_URL", null),
};