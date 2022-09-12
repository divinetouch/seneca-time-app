import React, { useReducer, Dispatch } from 'react'
import { State, Reducer, Action } from './interfaces'

type ActionType = { [key: string]: Function }

export default (
  reducer: Reducer<any, any>,
  actions: ActionType,
  state: State,
) => {
  const Context = React.createContext({ state, ...actions })

  const Provider: React.FC = ({ children }) => {
    const [newState, dispatch]: [State, Dispatch<Action>] = useReducer(
      reducer,
      state,
    )

    const boundActions: { [key: string]: Function } = {} as ActionType

    for (let key in actions) {
      boundActions[key] = actions[key](dispatch, newState)
    }

    const newValue = {
      state: newState,
      ...boundActions,
    }
    return (
      <Context.Provider value={{ ...newValue }}>{children}</Context.Provider>
    )
  }

  return { Context, Provider }
}
