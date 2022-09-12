import React, { useState, useEffect, useContext } from 'react'
import { IonSpinner } from '@ionic/react'
import {
  Context as AccountContext,
  AccountState,
} from '../../context/AccountContext'
import { Context as GoalContext, GoalState } from '../../context/GoalContext'
import { Context as FocusContext, FocusState } from '../../context/FocusContext'
import { Context as HomeContext, HomeState } from '../../context/HomeContext'
import {
  Context as SettingContext,
  SettingState,
} from '../../context/SettingContext'
import './Auth.scss'
import SignUp from '../signUp/SignUp'

type AccountContextType = {
  state: AccountState
  getAccount: () => Promise<void>
}

type GoalContextType = {
  state: GoalState
  loadGoals: () => Promise<void>
}

type FocustContextType = {
  state: FocusState
  loadFocus: () => Promise<void>
}

type HomeContextType = {
  state: HomeState
  loadHome: () => Promise<void>
}

type SettingContextType = {
  state: SettingState
  loadSetting: () => Promise<void>
}

const Auth: React.FC = ({ children }) => {
  const { state: accountState, getAccount } = useContext(
    AccountContext
  ) as AccountContextType
  const { loadGoals } = useContext(GoalContext) as GoalContextType
  const { loadFocus } = useContext(FocusContext) as FocustContextType
  const { loadHome } = useContext(HomeContext) as HomeContextType
  const { loadSetting } = useContext(SettingContext) as SettingContextType
  const [ready, setReady] = useState(false)
  const [mustSignup, setMustSignup] = useState(true)

  useEffect(() => {
    const load = async () => {
      await loadSetting()
      await getAccount()
      await loadGoals()
      await loadFocus()
      await loadHome()
    }
    load()
  }, [])

  useEffect(() => {
    if (accountState.id) {
      setMustSignup(false)
    } else {
      setMustSignup(true)
    }
    setReady(true)
  }, [accountState])

  if (!ready) {
    return (
      <div className='auth'>
        <IonSpinner name='lines' color='primary' />
      </div>
    )
  }

  if (mustSignup) {
    return <SignUp />
  }

  return <>{children}</>
}

export default Auth
