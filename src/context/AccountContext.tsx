import { Action, Reducer, State } from './interfaces'
import { Dispatch } from 'react'
import { Plugins } from '@capacitor/core'
import createDataContext from './createDataContext'
import lifeExpectencyData from '../data/lifeExpectency.json'

const { Storage } = Plugins

type LifeExpectencyType = {
  dimension: { label: string; display: string }[]
  fact: {
    Comments: string
    Value: string
    dims: {
      COUNTRY: string
      GHO: string
      SEX: string
      YEAR: string
    }
  }[]
}

export interface AccountState extends State {
  firstName: string
  lastName: string
  dob: string
  country: string
  email: string
  id: string
  lifeExpectency: number
}

interface AccountAction extends Action {
  type: 'create_account' | 'update_account'
  payload: AccountState
}

export const initialState: AccountState = {
  id: '',
  firstName: '',
  lastName: '',
  dob: '',
  country: '',
  email: '',
  lifeExpectency: 100,
}

const accountReducer: Reducer<AccountState, AccountAction> = (
  state: AccountState,
  action: AccountAction
) => {
  switch (action.type) {
    case 'create_account':
      return { ...action.payload }
    case 'update_account':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

const getLifeExpectency = (country: string): number => {
  const le = lifeExpectencyData as LifeExpectencyType
  const facts = le.fact
  for (let i = 0; i < facts.length; i++) {
    const fact = facts[i]
    if (
      fact.dims.COUNTRY === country &&
      fact.dims.YEAR === '2016' &&
      /birth/i.test(fact.dims.GHO)
    ) {
      return +fact.Value
    }
  }
  return 100
}

const createAccount = (dispatch: Dispatch<AccountAction>) => async (
  account: AccountState
) => {
  const generatedId = Math.random().toString()
  const nle = getLifeExpectency(account.country)

  dispatch({
    type: 'create_account',
    payload: {
      ...account,
      id: generatedId,
      lifeExpectency: nle,
    },
  })
  await Storage.set({
    key: 'user',
    value: JSON.stringify({ ...account, id: generatedId, lifeExpectency: nle }),
  })
}

const updateAccount = (dispatch: Dispatch<AccountAction>) => async (
  account: AccountState
) => {
  const nle = getLifeExpectency(account.country)
  dispatch({
    type: 'create_account',
    payload: { ...account, lifeExpectency: nle },
  })
  try {
    await Storage.set({
      key: 'user',
      value: JSON.stringify({ ...account, lifeExpectency: nle }),
    })
    return true
  } catch (err) {
    return false
  }
}

const getAccount = (dispatch: Dispatch<AccountAction>) => async () => {
  const user = await Storage.get({ key: 'user' })
  if (user.value) {
    dispatch({ type: 'update_account', payload: JSON.parse(user.value) })
  }
}

export const { Context, Provider } = createDataContext(
  accountReducer,
  { createAccount, updateAccount, getAccount },
  initialState
)
