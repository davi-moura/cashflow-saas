import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const tenantIdSchema = uuidSchema;
export const emailSchema = z.string().email();
export const decimalSchema = z.union([
  z.string().regex(/^\d+(\.\d{1,2})?$/),
  z.number(),
]);
export const dateSchema = z.union([z.string().datetime(), z.date()]);
