export type AiUsagePolicy = {
  burstLimit: number;
  burstWindowMs: number;
  dailyLimit: number;
  dailyWindowMs: number;
};

export type AiUsageDecision = {
  allowed: boolean;
  reason?: "burst" | "daily";
  retryAfterSeconds?: number;
  remainingBurst: number;
  remainingDaily: number;
};

function getRetryAfterSeconds(
  timestamps: number[],
  windowMs: number,
  now: number,
) {
  const oldestTimestamp = Math.min(...timestamps);

  return Math.max(
    1,
    Math.ceil((oldestTimestamp + windowMs - now) / 1000),
  );
}

export function evaluateAiUsagePolicy({
  config,
  eventTimestamps,
  now = Date.now(),
}: {
  config: AiUsagePolicy;
  eventTimestamps: number[];
  now?: number;
}): AiUsageDecision {
  const dailyEvents = eventTimestamps.filter(
    (timestamp) => timestamp > now - config.dailyWindowMs,
  );
  const burstEvents = dailyEvents.filter(
    (timestamp) => timestamp > now - config.burstWindowMs,
  );
  const remainingBurst = Math.max(
    0,
    config.burstLimit - burstEvents.length - 1,
  );
  const remainingDaily = Math.max(
    0,
    config.dailyLimit - dailyEvents.length - 1,
  );

  if (burstEvents.length >= config.burstLimit) {
    return {
      allowed: false,
      reason: "burst",
      remainingBurst: 0,
      remainingDaily: Math.max(0, config.dailyLimit - dailyEvents.length),
      retryAfterSeconds: getRetryAfterSeconds(
        burstEvents,
        config.burstWindowMs,
        now,
      ),
    };
  }

  if (dailyEvents.length >= config.dailyLimit) {
    return {
      allowed: false,
      reason: "daily",
      remainingBurst: Math.max(0, config.burstLimit - burstEvents.length),
      remainingDaily: 0,
      retryAfterSeconds: getRetryAfterSeconds(
        dailyEvents,
        config.dailyWindowMs,
        now,
      ),
    };
  }

  return {
    allowed: true,
    remainingBurst,
    remainingDaily,
  };
}
