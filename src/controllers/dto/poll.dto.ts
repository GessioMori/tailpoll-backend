import { z } from 'zod';

export class CreatePoolDto {
  public question: string;
  public options: string[];
  public endsAt?: Date;
}

export const PoolSchema = z.object({
  question: z
    .string()
    .min(10, { message: 'Question is too small.' })
    .max(3000, { message: 'Question is too big.' }),
  options: z
    .array(
      z
        .string()
        .min(2, { message: 'Some option is too small.' })
        .max(50, { message: 'Some option is too big.' }),
    )
    .min(2, { message: 'A poll needs at least to options.' })
    .max(10, { message: 'Maximum number of options was exceeded.' }),
  endsAt: z
    .preprocess((arg) => {
      if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
    }, z.date().min(new Date(), { message: 'Poll ends too early.' }))
    .nullish(),
});
