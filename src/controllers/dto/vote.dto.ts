import { z } from 'zod';

export class CreateVoteDto {
  public option: number;
}

export const VoteSchema = z.object({
  option: z
    .number()
    .min(0, { message: 'Invalid option' })
    .max(9, { message: 'Invalid option' }),
});
