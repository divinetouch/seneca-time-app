import createDataContext from './createDataContext'
import { State, Reducer } from './interfaces'
import { Dispatch } from 'react'
import { Plugins } from '@capacitor/core'
import { Status } from './FocusContext'
import { defaultProps } from './GoalContext'
import { config } from '../app_config'

const { Storage, LocalNotifications } = Plugins

export enum DailyGoalStatus {
  Progress = 'Progress',
  Done = 'Done',
  Overdue = 'Overdue',
  Default = 'Default',
}

export interface DailyGoalState extends State {
  title: string
  description: string
  start: string
  end: string
  id: string
  status: DailyGoalStatus
  config: {
    status: Status
    title: string
    backgroundColor: object[]
    yearColor: object[]
    monthColor: object[]
    dayColor: object[]
    hourColor: object[]
    minuteColor: object[]
    secondColor: object[]
    notify: boolean
    whenToNotify: number
  }
}

type DailyGoalAction =
  | {
      payload: DailyGoalState[]
      type: 'update_daily_state'
    }
  | {
      payload: DailyGoalState
      type: 'add_daily_goal' | 'update_daily_goal' | 'delete_daily_goal'
    }

const dailyGoalReducer: Reducer<DailyGoalState[], DailyGoalAction> = (
  state: DailyGoalState[],
  action: DailyGoalAction
) => {
  switch (action.type) {
    case 'add_daily_goal':
      return [...state, action.payload]
    case 'update_daily_goal':
      return state.map((goal) => {
        return goal.id === action.payload.id ? action.payload : goal
      })
    case 'delete_daily_goal':
      return state.filter((goal) => {
        return goal.id !== action.payload.id
      })
    case 'update_daily_state':
      return [...action.payload]
    default:
      return state
  }
}

const addDailyGoal = (
  dispatch: Dispatch<DailyGoalAction>,
  currentState: DailyGoalState[]
) => async (goal: DailyGoalState) => {
  const goalWithId = {
    ...defaultProps,
    ...goal,
    id: Date.now().toString(),
  }
  dispatch({
    type: 'add_daily_goal',
    payload: goalWithId,
  })
  await Storage.set({
    key: 'daily_goals',
    value: JSON.stringify([...currentState, goalWithId]),
  })
  return goalWithId
}

const updateDailyGoal = (
  dispatch: Dispatch<DailyGoalAction>,
  currentState: DailyGoalState[]
) => async (goal: DailyGoalState) => {
  dispatch({ type: 'update_daily_goal', payload: goal })
  const newState = currentState.map((g) => {
    return goal.id === g.id ? goal : g
  })
  await Storage.set({ key: 'daily_goals', value: JSON.stringify(newState) })
  return goal
}

const deleteDailyGoal = (
  dispatch: Dispatch<DailyGoalAction>,
  currentState: DailyGoalState[]
) => async (goal: DailyGoalState) => {
  dispatch({ type: 'delete_daily_goal', payload: goal })
  const newState = currentState.filter((g) => {
    return goal.id !== g.id
  })
  await Storage.set({ key: 'daily_goals', value: JSON.stringify(newState) })
  return goal
}

const loadDailyGoals = (
  dispatch: Dispatch<DailyGoalAction>,
  _: DailyGoalState[]
) => async () => {
  const goals = await Storage.get({ key: 'daily_goals' })
  if (goals.value) {
    dispatch({ type: 'update_daily_state', payload: JSON.parse(goals.value) })
  }
}

const _buildBodyText = (goal: DailyGoalState): string => {
  if (goal.config.whenToNotify < 1440) {
    return `${goal.title} is due in ${goal.config.whenToNotify} minutes`
  } else {
    return `${goal.title} is due in ${goal.config.whenToNotify} day`
  }
}

const pushGoalNotification = (dispatch: Dispatch<DailyGoalAction>) => async (
  goal: DailyGoalState
) => {
  try {
    const enabled = await LocalNotifications.areEnabled()
    if (enabled.value) {
      const notificationList = await LocalNotifications.getPending()
      const pending = notificationList.notifications.filter((notification) => {
        return notification.id === goal.id
      })

      if (pending.length) {
        await LocalNotifications.cancel({ notifications: pending })
      }
      LocalNotifications.schedule({
        notifications: [
          {
            id: +goal.id,
            title: config.name,
            body: _buildBodyText(goal),
            sound: 'default',
            schedule: {
              at: new Date(
                new Date(goal.end).getTime() - 60000 * +goal.config.whenToNotify
              ),
            },
          },
        ],
      })
    }
    return true
  } catch (e) {
    console.log('device not support notification', e)
  }
  return false
}

export const { Context, Provider } = createDataContext(
  dailyGoalReducer,
  {
    addDailyGoal,
    updateDailyGoal,
    loadDailyGoals,
    deleteDailyGoal,
    pushGoalNotification,
  },
  []
)
