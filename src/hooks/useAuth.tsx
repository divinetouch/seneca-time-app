import { useEffect, useContext } from 'react'
import {
  Context as AccountContext,
  AccountState,
} from '../context/AccountContext'
import { Context as GoalContext, GoalState } from '../context/GoalContext'
import { Context as FocusContext, FocusState } from '../context/FocusContext'
import { Context as HomeContext, HomeState } from '../context/HomeContext'

type AccountContextType = {
  state: AccountState
  getAccount: Function
}

type GoalContextType = {
  state: GoalState
  loadGoals: Function
}

type FocustContextType = {
  state: FocusState
  loadFocus: Function
}

type HomeContextType = {
  state: HomeState
  loadHome: Function
}

const useAuth = () => {
  const { getAccount } = useContext(AccountContext) as AccountContextType
  const { loadGoals } = useContext(GoalContext) as GoalContextType
  const { loadFocus } = useContext(FocusContext) as FocustContextType
  const { loadHome } = useContext(HomeContext) as HomeContextType

  useEffect(() => {
    loadHome()
    getAccount()
    loadGoals()
    loadFocus()
  }, [])
}

export default useAuth
