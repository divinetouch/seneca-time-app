export interface State {}

export type Action = {
  payload: State
  type: string
}

export type Reducer<T, U> = (state: T, action: U) => T

export type ActionType = { [key: string]: Function }
