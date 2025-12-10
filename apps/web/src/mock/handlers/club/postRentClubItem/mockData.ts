import { type ClubItemRentResponse } from '@workspace/api/generated';

export const 물품_대여_성공: ClubItemRentResponse = {
  historyId: 1,
  rentalDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0],
};
