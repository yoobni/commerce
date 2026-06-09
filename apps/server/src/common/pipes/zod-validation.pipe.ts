import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import type { ZodSchema } from 'zod';

// Per-route input validation. Use in a controller with:
//   @Body(new ZodValidationPipe(BodySchema)) body: z.infer<typeof BodySchema>
// or via a custom decorator (added later as needs surface).
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown, _meta: ArgumentMetadata): T {
    // Zod throws ZodError on failure — caught by AllExceptionsFilter and
    // surfaced as 400 invalid_input with issues attached.
    return this.schema.parse(value);
  }
}
