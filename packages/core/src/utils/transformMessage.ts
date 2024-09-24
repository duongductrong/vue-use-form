import { isBoolean, isDateObject, isNumber, isString, isUndefined } from '.'
import type { FieldValues } from '../types/filed'
import type { RegisterOptions } from '../types/validator'

export function getValueAndMessage<TFieldValues extends FieldValues>(
  field: RegisterOptions<TFieldValues>[keyof RegisterOptions<TFieldValues>]
) {
  if (isUndefined(field)) return { value: undefined, message: '' }

  if (isString(field)) return { value: true, message: field }

  if (isBoolean(field)) return { value: field, message: '' }

  if (isNumber(field)) return { value: field, message: '' }

  if (isDateObject(field)) {
    return { value: field, message: '' }
  }

  return field
}
