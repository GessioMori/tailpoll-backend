import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { z, ZodSchema } from 'zod';

export class ValidatorPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  public transform(value: any, metadata: ArgumentMetadata) {
    if (metadata?.type === 'body') {
      const result = this.schema.safeParse(value);

      if (!result.success) {
        const errorMessages = result.error.errors.map((error) => ({
          field: error.path.toString(),
          message: error.message,
        }));
        throw new BadRequestException(errorMessages);
      }
    } else if (metadata.type === 'param') {
      const result = z.string().cuid().safeParse(value);

      if (!result.success) {
        throw new BadRequestException('Invalid ID.');
      }
    }

    return value;
  }
}
