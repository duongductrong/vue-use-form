import { unref } from 'vue'
import {
  isEmpty,
  isEmptyObject,
  isFunction,
  isNullOrUndefined,
  isObject,
  isRegex,
  isString,
} from '../utils'
import { isCheckBoxInput, isRadioInput } from '../utils/fieldElement'
import { getValueAndMessage } from '../utils/transformMessage'
import { getValidatorError } from '../utils/getValidatorError'
import { isFieldElement } from '../utils/isFieldElement'
import type { Field, FieldElement } from '../types/filed'
import type { FieldError } from '../types/errors'

export function handleValidateError(
  error: FieldError,
  shouldFocusOnError: boolean,
  el?: FieldElement
) {
  if (!isFieldElement(el)) {
    return
  }

  if (!isEmptyObject(error) && shouldFocusOnError) {
    el.focus()
  }
}

export async function validateField(
  field: Field,
  shouldFocusOnError: boolean,
  validateAllFieldCriteria: boolean
): Promise<FieldError> {
  const inputValue = unref(field.inputValue)

  const {
    required,
    min,
    max,
    maxLength,
    minLength,
    pattern,
    validate,
    disabled = false,
  } = field.rule

  const el = unref(field.el)

  const isRadio = isRadioInput(el)
  const isCheckbox = isCheckBoxInput(el)
  const isRadioOrCheckBox = isRadio || isCheckbox

  const unrefInputVal = unref(inputValue)
  const isEmptyValue = isEmpty(unrefInputVal)

  let error: FieldError = {}

  try {
    if (required && !isRadioOrCheckBox) {
      const { value, message } = getValueAndMessage(required) as any

      if (isEmptyValue && value) {
        error = {
          type: 'required',
          message,
        }

        if (!validateAllFieldCriteria) return error
      }
    }

    if (!isEmptyValue && (!isNullOrUndefined(max) || !isNullOrUndefined(min))) {
      let exceedMax
      let exceedMin
      // TODO: Should remove any type
      const { value: maxValue, message: maxMsg } = getValueAndMessage(
        max
      ) as any
      // TODO: Should remove any type
      const { value: minValue, message: minMsg } = getValueAndMessage(
        min
      ) as any

      if (!Number.isNaN(unrefInputVal)) {
        if (minValue && unrefInputVal < minValue) exceedMin = true
        if (maxValue && unrefInputVal > maxValue) exceedMax = true
      } else {
        if (minValue && unrefInputVal < minValue) exceedMin = true
        if (maxValue && unrefInputVal > maxValue) exceedMax = true
      }

      if (exceedMax || exceedMin) {
        error = {
          type: exceedMax ? 'max' : 'min',
          message: exceedMax ? maxMsg : minMsg,
        }

        if (!validateAllFieldCriteria) return error
      }
    }

    if ((maxLength || minLength) && !isEmptyValue && isString(inputValue)) {
      let exceedMax
      let exceedMin
      // TODO: Should remove any type
      const { value: maxValue, message: maxMsg } = getValueAndMessage(
        maxLength
      ) as any
      // TODO: Should remove any type
      const { value: minValue, message: minMsg } = getValueAndMessage(
        minLength
      ) as any

      if (minValue && inputValue.length <= minValue) exceedMin = true

      if (maxValue && inputValue.length >= maxValue) exceedMax = true

      if (exceedMax || exceedMin) {
        error = {
          type: exceedMax ? 'maxLength' : 'minLength',
          message: exceedMax ? maxMsg : minMsg,
        }

        return error
      }
    }

    if (pattern && !isEmptyValue && isString(inputValue)) {
      // TODO: Should remove any type
      const { value: patternValue, message } = getValueAndMessage(
        pattern
      ) as any

      if (isRegex(patternValue) && !inputValue.match(patternValue)) {
        error = {
          type: 'pattern',
          message,
        }

        if (!validateAllFieldCriteria) return error
      }
    }

    if (disabled && isFieldElement(el)) el.setAttribute('disabled', '')
    else if (!disabled && isFieldElement(el)) el.removeAttribute('disabled')

    if (validate) {
      if (isFunction(validate)) {
        const result = await validate(unrefInputVal)

        const validateResult = getValidatorError(result)

        if (validateResult) error = validateResult

        if (!validateAllFieldCriteria) return error
      } else if (isObject(validate)) {
        for (const key of Object.keys(validate)) {
          const result = await validate[key](unrefInputVal)

          const validateResult = getValidatorError(result, key)

          if (validateResult) error = validateResult

          if (!validateAllFieldCriteria) return error
        }
      }
    }
  } finally {
    handleValidateError(error, shouldFocusOnError, el)
  }

  return error
}
