import { Reducer, State } from './interfaces'
import { Dispatch } from 'react'
import { Plugins } from '@capacitor/core'
import createDataContext from './createDataContext'
import { GoalState, defaultProps } from './GoalContext'
import quoteData from '../data/quotes.json'

const { Storage } = Plugins

export type Quote = {
  name: string
  quote: string
}

export interface HomeState extends State {
  quote: Quote
  life: GoalState
}

type HomeAction =
  | {
      type: 'update_quote'
      payload: Quote
    }
  | {
      type: 'update_home_goal'
      payload: GoalState
    }
  | {
      type: 'update_home_life'
      payload: GoalState
    }
  | {
      type: 'load_state'
      payload: HomeState
    }

const initialState: HomeState = {
  quote: {
    name: quoteData[0].name,
    quote: quoteData[0].quote,
  },
  life: {
    ...defaultProps,
    title: 'estimated',
    description: 'Count down on life',
  },
}

const homeReducer: Reducer<HomeState, HomeAction> = (
  state: HomeState,
  action: HomeAction
) => {
  switch (action.type) {
    case 'update_quote':
      return { ...state, quote: { ...action.payload } }
    case 'update_home_goal':
      return { ...state, goal: { ...action.payload } }
    case 'update_home_life':
      return { ...state, life: { ...action.payload } }
    case 'load_state':
      return { ...action.payload }
    default:
      return state
  }
}

const updateQuote = (
  dispatch: Dispatch<HomeAction>,
  currentState: HomeState
) => async () => {
  const index = Math.floor(Math.random() * quoteData.length)
  dispatch({ type: 'update_quote', payload: quoteData[index] })
  const current = await Storage.get({ key: 'home' })
  if (current.value) {
    await Storage.set({
      key: 'home',
      value: JSON.stringify({
        ...JSON.parse(current.value),
        quote: quoteData[index],
      }),
    })
  } else if (currentState) {
    await Storage.set({
      key: 'home',
      value: JSON.stringify({
        ...currentState,
        quote: quoteData[index],
      }),
    })
  }
}

const updateHomeGoal = (dispatch: Dispatch<HomeAction>) => async (
  goal: GoalState,
  currentState: HomeState
) => {
  dispatch({ type: 'update_home_goal', payload: goal })
  const current = await Storage.get({ key: 'home' })
  if (current.value) {
    await Storage.set({
      key: 'home',
      value: JSON.stringify({ ...JSON.parse(current.value), goal: goal }),
    })
  } else if (currentState) {
    await Storage.set({
      key: 'home',
      value: JSON.stringify({ ...currentState, goal: goal }),
    })
  }
}

const loadHome = (dispatch: Dispatch<HomeAction>) => async () => {
  const current = await Storage.get({ key: 'home' })
  if (current.value) {
    const newState = JSON.parse(current.value)
    dispatch({
      type: 'load_state',
      payload: {
        ...newState,
        life: {
          ...newState.life,
          title: initialState.life.title,
          description: initialState.life.description,
        },
      },
    })
  } else {
    dispatch({ type: 'load_state', payload: initialState })
    await Storage.set({
      key: 'home',
      value: JSON.stringify(initialState),
    })
  }
}

const updateLife = (dispatch: Dispatch<HomeAction>) => async (
  life: GoalState,
  currentState: HomeState
) => {
  dispatch({ type: 'update_home_life', payload: life })
  const current = await Storage.get({ key: 'home' })
  if (current.value) {
    await Storage.set({
      key: 'home',
      value: JSON.stringify({ ...JSON.parse(current.value), life: life }),
    })
  } else if (currentState) {
    await Storage.set({
      key: 'home',
      value: JSON.stringify({ ...currentState, life: life }),
    })
  }
}

export const { Context, Provider } = createDataContext(
  homeReducer,
  { updateQuote, updateHomeGoal, loadHome, updateLife },
  initialState
)
