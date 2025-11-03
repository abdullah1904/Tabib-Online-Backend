import "dotenv/config"

function getValue<T>(key: string, defaultValue: T) {
    const value = process.env[key];
    return value ?? defaultValue;
}

export const config = {
    PORT: getValue("PORT", null), 
    DATABASE_URL: getValue("DATABASE_URL", null),
    REDIS_URL: getValue("REDIS_URL", null),
    ACCESS_TOKEN_SECRET: getValue("ACCESS_TOKEN_SECRET", null),
    ACCESS_TOKEN_EXPIRY: getValue("ACCESS_TOKEN_EXPIRY", null),
    REFRESH_TOKEN_SECRET: getValue("REFRESH_TOKEN_SECRET", null),
    REFRESH_TOKEN_EXPIRY: getValue("REFRESH_TOKEN_EXPIRY", null),
    CLOUDINARY_CLOUD_NAME: getValue("CLOUDINARY_CLOUD_NAME", null),
    CLOUDINARY_API_KEY: getValue("CLOUDINARY_API_KEY", null),
    CLOUDINARY_API_SECRET: getValue("CLOUDINARY_API_SECRET", null),
    MAIL_USER: getValue("MAIL_USER", ""),
    MAIL_PASS: getValue("MAIL_PASS", ""),
    GROQ_API_KEY: getValue("GROQ_API_KEY", null),
    GROQ_PRIMARY_MODEL: getValue("GROQ_PRIMARY_MODEL", "qwen/qwen3-32b"),
    GROQ_SECONDARY_MODEL: getValue("GROQ_SECONDARY_MODEL", "openai/gpt-oss-20b"),
    QDRANT_URL: getValue("QDRANT_URL", "http://localhost:6333"),
    QDRANT_API_KEY: getValue("QDRANT_API_KEY", null),
    QDRANT_COLLECTION_NAME: getValue("QDRANT_COLLECTION_NAME", null),
    COHERE_API_KEY: getValue("COHERE_API_KEY", null),
    COHERE_EMBEDDING_MODEL: getValue("COHERE_EMBEDDING_MODEL", "embed-english-v3.0"),
    LANGSMITH_TRACING: getValue("LANGSMITH_TRACING", "false") === "true",
    LANGSMITH_ENDPOINT: getValue("LANGSMITH_ENDPOINT", null),
    LANGSMITH_API_KEY: getValue("LANGSMITH_API_KEY", null),
    LANGSMITH_PROJECT: getValue("LANGSMITH_PROJECT", "default-project"),
};