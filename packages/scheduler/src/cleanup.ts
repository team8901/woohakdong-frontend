/**
 * 만료 구독 정리
 */

import {
  getFirebaseAccessToken,
  queryFirestore,
  updateFirestoreDocument,
} from './firebase';
import type { Env, Subscription } from './types';
import { SUBSCRIPTIONS_COLLECTION } from './types';

/**
 * 만료 구독 정리 (매주 월요일 오전 3시 KST)
 */
export const cleanupExpiredSubscriptions = async (env: Env): Promise<void> => {
  console.log('Starting expired subscription cleanup...');

  const firebaseToken = await getFirebaseAccessToken(env);

  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const subscriptions = (await queryFirestore(
    env,
    firebaseToken,
    SUBSCRIPTIONS_COLLECTION,
    [
      { field: 'status', op: 'EQUAL', value: 'expired' },
      { field: 'endDate', op: 'LESS_THAN', value: thirtyDaysAgo },
    ],
  )) as Subscription[];

  console.log(
    `Found ${subscriptions.length} expired subscriptions to cleanup`,
  );

  for (const subscription of subscriptions) {
    if (!subscription.id || !subscription.clubId) {
      console.error(
        `Invalid subscription data: id=${subscription.id}, clubId=${subscription.clubId}`,
      );

      continue;
    }

    await updateFirestoreDocument(
      env,
      firebaseToken,
      SUBSCRIPTIONS_COLLECTION,
      subscription.id,
      {
        planId: 'FREE',
        planName: 'Free',
        price: 0,
        status: 'active',
        updatedAt: new Date(),
      },
    );

    console.log(`Downgraded to FREE: ${subscription.id}`);
  }

  console.log('Expired subscription cleanup complete');
};
