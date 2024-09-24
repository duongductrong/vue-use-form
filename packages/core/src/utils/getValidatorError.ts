import { isBoolean, isString } from '.'
import type { FieldValues } from '../types/filed'
import type { RegisterOptions, ValidateResult } from '../types/validator'
import type { FieldError } from '../types/errors'

export function getValidatorError(
  result: ValidateResult,
  type = 'validate'
): FieldError | undefined {
  if (isBoolean(result) && !result) {
    return {
      type: type as keyof RegisterOptions<FieldValues>,
      message: isString(result) ? result : '',
    }
  } else if (isString(result)) {
    return {
      type: type as keyof RegisterOptions<FieldValues>,
      message: result,
    }
  }
}
