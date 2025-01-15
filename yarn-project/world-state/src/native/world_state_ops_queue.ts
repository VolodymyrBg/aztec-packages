import { promiseWithResolvers } from '@aztec/foundation/promise';

import { WorldStateMessageType } from './message.js';

/**
 * This is the implementation for queueing requests to the world state.
 * Requests need to be queued for the world state to ensure that writes are correctly ordered
 * and reads return the correct data.
 * Due to the nature of the NAPI we can't really do this there.
 *
 * The rules for queueing are as follows:
 *
 * 1. Reads of committed state never need to be queued. LMDB uses MVCC to ensure readers see a consistent view of the DB.
 * 2. Reads of uncommitted state can happen concurrently with other reads of uncommitted state on the same fork (or reads of committed state)
 * 3. All writes require exclusive access to their respective fork
 *
 */

type WorldStateOp = {
  requestId: number;
  mutating: boolean;
  request: () => Promise<any>;
  promise: PromiseWithResolvers<any>;
};

// These are the set of message types that implement mutating operations
// Messages of these types require exclusive access to their given forks
export const MUTATING_MSG_TYPES = new Set([
  WorldStateMessageType.APPEND_LEAVES,
  WorldStateMessageType.BATCH_INSERT,
  WorldStateMessageType.SEQUENTIAL_INSERT,
  WorldStateMessageType.UPDATE_ARCHIVE,
  WorldStateMessageType.COMMIT,
  WorldStateMessageType.ROLLBACK,
  WorldStateMessageType.SYNC_BLOCK,
  WorldStateMessageType.CREATE_FORK,
  WorldStateMessageType.DELETE_FORK,
  WorldStateMessageType.FINALISE_BLOCKS,
  WorldStateMessageType.UNWIND_BLOCKS,
  WorldStateMessageType.REMOVE_HISTORICAL_BLOCKS,
]);

// This class implements the per-fork operation queue
export class WorldStateOpsQueue {
  private requests: WorldStateOp[] = [];
  private inFlightMutatingCount = 0;
  private inFlightCount = 0;
  private stopPromise?: Promise<void>;
  private stopResolve?: () => void;
  private requestId = 0;
  private ops: Map<number, WorldStateOp> = new Map();

  // The primary public api, this is where an operation is queued
  // We return a promise that will ultimately be resolved/rejected with the response/error generated by the 'request' argument
  public execute(request: () => Promise<any>, messageType: WorldStateMessageType, committedOnly: boolean) {
    if (this.stopResolve !== undefined) {
      throw new Error('Unable to send request to world state, queue already stopped');
    }

    const op: WorldStateOp = {
      requestId: this.requestId++,
      mutating: MUTATING_MSG_TYPES.has(messageType),
      request,
      promise: promiseWithResolvers(),
    };
    this.ops.set(op.requestId, op);

    // Perform the appropriate action based upon the queueing rules
    if (op.mutating) {
      this.executeMutating(op);
    } else if (committedOnly === false) {
      this.executeNonMutatingUncommitted(op);
    } else {
      this.executeNonMutatingCommitted(op);
    }
    return op.promise.promise;
  }

  // Mutating requests need exclusive access
  private executeMutating(op: WorldStateOp) {
    // If nothing is in flight then we send the request immediately
    // Otherwise add to the queue
    if (this.inFlightCount === 0) {
      this.sendEnqueuedRequest(op);
    } else {
      this.requests.push(op);
    }
  }

  // Non mutating requests including uncommitted state
  private executeNonMutatingUncommitted(op: WorldStateOp) {
    // If there are no mutating requests in flight and there is nothing queued
    // then send the request immediately
    // If a mutating request is in flight then we must wait
    // If a mutating request is not in flight but something is queued then it must be a mutating request
    if (this.inFlightMutatingCount == 0 && this.requests.length == 0) {
      this.sendEnqueuedRequest(op);
    } else {
      this.requests.push(op);
    }
  }

  private executeNonMutatingCommitted(op: WorldStateOp) {
    // This is a non-mutating request for committed data
    // It can always be sent
    op.request()
      .then(op.promise.resolve, op.promise.reject)
      .finally(() => {
        this.ops.delete(op.requestId);
      });
  }

  private checkAndEnqueue(completedOp: WorldStateOp) {
    // As request has completed
    // First we decrements the relevant in flight counters
    if (completedOp.mutating) {
      --this.inFlightMutatingCount;
    }
    --this.inFlightCount;

    // If there are still requests in flight then do nothing further
    if (this.inFlightCount != 0) {
      return;
    }

    // No requests in flight, send next queued requests
    // We loop and send:
    // 1 mutating request if it is next in the queue
    // As many non-mutating requests as we encounter until
    // we exhaust the queue or we reach a mutating request
    while (this.requests.length > 0) {
      const next = this.requests[0];
      if (next.mutating) {
        if (this.inFlightCount == 0) {
          // send the mutating request
          this.requests.shift();
          this.sendEnqueuedRequest(next);
        }
        // this request is mutating, we need to stop here
        break;
      } else {
        // not mutating, send and go round again
        this.requests.shift();
        this.sendEnqueuedRequest(next);
      }
    }

    // If the queue is empty, there is nothing in flight and we have been told to stop, then resolve the stop promise
    if (this.inFlightCount == 0 && this.stopResolve !== undefined) {
      this.stopResolve();
    }
  }

  private sendEnqueuedRequest(op: WorldStateOp) {
    // Here we increment the in flight counts before sending
    ++this.inFlightCount;
    if (op.mutating) {
      ++this.inFlightMutatingCount;
    }

    // Make the request and pass the response/error through to the stored promise
    op.request()
      .then(op.promise.resolve, op.promise.reject)
      .finally(() => {
        this.checkAndEnqueue(op);
        this.ops.delete(op.requestId);
      });
  }

  public stop() {
    // If there is already a stop promise then return it
    if (this.stopPromise) {
      return this.stopPromise;
    }

    // Otherwise create a new one and capture the resolve method
    this.stopPromise = new Promise(resolve => {
      this.stopResolve = resolve;
    });

    // If no outstanding requests then immediately resolve the promise
    if (this.requests.length == 0 && this.inFlightCount == 0 && this.stopResolve !== undefined) {
      this.stopResolve();
    }
    return this.stopPromise;
  }
}
