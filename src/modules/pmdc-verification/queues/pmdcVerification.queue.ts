import { config } from "../../../utils/config";
import { Queue } from "bullmq";
import { logger } from "../../../utils/logger";

const pmdcVerificationQueue = new Queue("doctor-verification", {
    connection: { url: config.REDIS_URL! },
    defaultJobOptions: {
        removeOnComplete: true,
        attempts: 2,
    }
});

pmdcVerificationQueue.on('error', (error) => {
    logger.error(`Doctor verification queue error: ${error.message}`);
});

export default pmdcVerificationQueue;