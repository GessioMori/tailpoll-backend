import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { CreatePoolDto } from './dto/pool.dto';

export class ValidatorPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  public transform(value: any): CreatePoolDto {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errorMessages = result.error.errors.map((error) => ({
        field: error.path.toString(),
        message: error.message,
      }));
      throw new BadRequestException(errorMessages);
    }
    return value;
  }
}
