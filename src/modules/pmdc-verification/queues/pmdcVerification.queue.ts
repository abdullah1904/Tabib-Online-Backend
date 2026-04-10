import { config } from "../../../utils/config.js";
import { Queue } from "bullmq";
import { logger } from "../../../utils/logger.js";

const pmdcVerificationQueue = new Queue("doctor-verification", {
    connection: { url: config.REDIS_URL! },
    defaultJobOptions: {
        removeOnComplete: true,
        attempts: 2,
        delay: 5000,
    }
});

pmdcVerificationQueue.on('error', (error) => {
    logger.error(`Doctor verification queue error: ${error.message}`);
});

export default pmdcVerificationQueue;