/**
 * Real-Time Seat Lock Service
 * Thread-safe memory cache for temporary seat reservations with TTL.
 */
class SeatLockService {
  constructor() {
    // Map: showId -> Map<seatId, { userId, socketId, lockedAt, expiresAt }>
    this.locks = new Map();
    this.LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes
    this.io = null;

    // Start auto-cleanup every 5 seconds
    setInterval(() => this.cleanupExpiredLocks(), 5000);
  }

  setIO(io) {
    this.io = io;
  }

  /**
   * Attempt to lock an array of seats for a specific user and show
   */
  lockSeats(showId, seatIds, userId, socketId = null) {
    const showKey = showId.toString();
    if (!this.locks.has(showKey)) {
      this.locks.set(showKey, new Map());
    }

    const showMap = this.locks.get(showKey);
    const now = Date.now();
    const expiresAt = now + this.LOCK_DURATION_MS;

    // Check if any requested seat is already locked by someone else
    for (const seatId of seatIds) {
      if (showMap.has(seatId)) {
        const lock = showMap.get(seatId);
        if (lock.expiresAt > now && lock.userId.toString() !== userId.toString()) {
          return {
            success: false,
            message: `Seat ${seatId} is already temporarily locked by another customer.`,
            conflictingSeat: seatId,
          };
        }
      }
    }

    // Lock the seats
    const lockedSeats = [];
    for (const seatId of seatIds) {
      showMap.set(seatId, {
        seatId,
        userId: userId.toString(),
        socketId,
        lockedAt: now,
        expiresAt,
      });
      lockedSeats.push(seatId);
    }

    // Broadcast event if io is available
    if (this.io) {
      this.io.to(`show:${showKey}`).emit('seat:locked', {
        showId: showKey,
        seats: lockedSeats,
        lockedBy: userId.toString(),
        expiresAt,
      });
    }

    return {
      success: true,
      lockedSeats,
      expiresAt,
    };
  }

  /**
   * Release specific seats locked by a user
   */
  releaseSeats(showId, seatIds, userId) {
    const showKey = showId.toString();
    if (!this.locks.has(showKey)) return { success: true, releasedSeats: [] };

    const showMap = this.locks.get(showKey);
    const released = [];

    for (const seatId of seatIds) {
      if (showMap.has(seatId)) {
        const lock = showMap.get(seatId);
        // Allow release if owned by user or if force release requested
        if (!userId || lock.userId === userId.toString()) {
          showMap.delete(seatId);
          released.push(seatId);
        }
      }
    }

    if (showMap.size === 0) {
      this.locks.delete(showKey);
    }

    if (released.length > 0 && this.io) {
      this.io.to(`show:${showKey}`).emit('seat:released', {
        showId: showKey,
        seats: released,
      });
    }

    return { success: true, releasedSeats: released };
  }

  /**
   * Get all actively locked seats for a show
   */
  getLockedSeats(showId) {
    const showKey = showId.toString();
    if (!this.locks.has(showKey)) return [];

    const showMap = this.locks.get(showKey);
    const now = Date.now();
    const activeLocks = [];

    for (const [seatId, lock] of showMap.entries()) {
      if (lock.expiresAt > now) {
        activeLocks.push({
          seatId,
          userId: lock.userId,
          expiresAt: lock.expiresAt,
        });
      } else {
        showMap.delete(seatId);
      }
    }

    return activeLocks;
  }

  /**
   * Cleanup expired locks periodically and emit release events
   */
  cleanupExpiredLocks() {
    const now = Date.now();

    for (const [showKey, showMap] of this.locks.entries()) {
      const expiredSeats = [];
      for (const [seatId, lock] of showMap.entries()) {
        if (lock.expiresAt <= now) {
          expiredSeats.push(seatId);
          showMap.delete(seatId);
        }
      }

      if (expiredSeats.length > 0 && this.io) {
        this.io.to(`show:${showKey}`).emit('seat:released', {
          showId: showKey,
          seats: expiredSeats,
          reason: 'lock_expired',
        });
      }

      if (showMap.size === 0) {
        this.locks.delete(showKey);
      }
    }
  }

  /**
   * Verify if seats are actively held by a specific user
   */
  validateLockOwnership(showId, seatIds, userId) {
    const showKey = showId.toString();
    if (!this.locks.has(showKey)) return false;

    const showMap = this.locks.get(showKey);
    const now = Date.now();

    for (const seatId of seatIds) {
      if (!showMap.has(seatId)) return false;
      const lock = showMap.get(seatId);
      if (lock.expiresAt <= now || lock.userId !== userId.toString()) {
        return false;
      }
    }
    return true;
  }
}

export const seatLockService = new SeatLockService();
