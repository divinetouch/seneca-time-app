import createDataContext from './createDataContext'
import { State, Action } from './interfaces'
import { Dispatch } from 'react'
import { Plugins } from '@capacitor/core'

const { Storage } = Plugins

export interface SettingState extends State {
  quoteUpdateFrequency: number
  showLifeExpectency: boolean
  showDailyCountDown: boolean
  notification: boolean
}

export interface SettingActions extends Action {
  type: 'update_setting' | 'load_setting'
  payload: SettingState
}

export const initialState: SettingState = {
  showDailyCountDown: true,
  showLifeExpectency: true,
  quoteUpdateFrequency: 5, // in miliseconds
  notification: true,
}

const settingReducer = (state: SettingState, action: SettingActions) => {
  switch (action.type) {
    case 'load_setting':
      return { ...action.payload }
    case 'update_setting':
      return { ...action.payload }
    default:
      return state
  }
}

const loadSetting = (dispatch: Dispatch<SettingActions>) => async () => {
  const setting = await Storage.get({ key: 'setting' })
  if (setting.value) {
    dispatch({ type: 'load_setting', payload: JSON.parse(setting.value) })
  } else {
    dispatch({ type: 'load_setting', payload: initialState })
    await Storage.set({
      key: 'setting',
      value: JSON.stringify(initialState),
    })
  }
  return setting.value
}

const updateSetting = (dispatch: Dispatch<SettingActions>) => async (
  setting: SettingState
) => {
  dispatch({ type: 'update_setting', payload: setting })
  await Storage.set({
    key: 'setting',
    value: JSON.stringify({ ...setting }),
  })
}

export const { Context, Provider } = createDataContext(
  settingReducer,
  { loadSetting, updateSetting },
  initialState
)
