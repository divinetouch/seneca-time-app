import { Dispatch } from 'react'
import { State, Reducer } from './interfaces'
import createDataContext from './createDataContext'
import { Plugins } from '@capacitor/core'

const { Storage } = Plugins

enum Actions {
  ADD_FOCUS,
  UPDATE_FOCUS,
  DELETE_FOCUS,
  UPDATE_STATE,
}

export enum Status {
  Hide,
  Show,
}
export interface FocusState extends State {
  id: string
  config?: {
    status?: Status
    title?: string
    backgroundColor?: string
    yearColor?: string
    monthColor?: string
    dayColor?: string
    hourColor?: string
    minuteColor?: string
    secondColor?: string
  }
}

type FocusAction =
  | {
      payload: FocusState[]
      type: Actions.UPDATE_STATE
    }
  | {
      type: Actions.UPDATE_FOCUS | Actions.ADD_FOCUS | Actions.DELETE_FOCUS
      payload: FocusState
    }

const focusReducer: Reducer<FocusState[], FocusAction> = (
  state: FocusState[],
  action: FocusAction
) => {
  switch (action.type) {
    case Actions.ADD_FOCUS:
      return [...state, action.payload]
    case Actions.DELETE_FOCUS:
      return state.filter((f) => f.id !== action.payload.id)
    case Actions.UPDATE_FOCUS:
      return state.map((f) => (f.id === action.payload.id ? action.payload : f))
    case Actions.UPDATE_STATE:
      return [...action.payload]
    default:
      return state
  }
}

const updateFocus = (
  dispatch: Dispatch<FocusAction>,
  currentState: FocusState[]
) => async (focus: FocusState) => {
  dispatch({ type: Actions.UPDATE_FOCUS, payload: focus })

  // update to storage
  await Storage.set({
    key: 'focus',
    value: JSON.stringify(
      currentState.map((f) => (f.id === focus.id ? focus : f))
    ),
  })
}
const addFocus = (
  dispatch: Dispatch<FocusAction>,
  currentState: FocusState[]
) => async (id: string) => {
  const newFocus = {
    id,
    config: {
      status: Status.Show,
      title: '',
      backgroundColor: '',
      yearColor: '',
      monthColor: '',
      dayColor: '',
      hourColor: '',
      minuteColor: '',
      secondColor: '',
    },
  }
  dispatch({ type: Actions.ADD_FOCUS, payload: newFocus })

  // update to storage
  await Storage.set({
    key: 'focus',
    value: JSON.stringify([...currentState, newFocus]),
  })
}
const deleteFocus = (
  dispatch: Dispatch<FocusAction>,
  currentState: FocusState[]
) => async (focus: FocusState) => {
  dispatch({ type: Actions.DELETE_FOCUS, payload: focus })

  // delete from storage
  await Storage.set({
    key: 'focus',
    value: JSON.stringify(currentState.filter((f) => f.id !== focus.id)),
  })
}
const loadFocus = (
  dispatch: Dispatch<FocusAction>,
  currentState: FocusState[]
) => async () => {
  const focuses = await Storage.get({ key: 'focus' })
  if (focuses.value) {
    dispatch({ type: Actions.UPDATE_STATE, payload: JSON.parse(focuses.value) })
  }
}

export const { Context, Provider } = createDataContext(
  focusReducer,
  { addFocus, updateFocus, deleteFocus, loadFocus },
  []
)
