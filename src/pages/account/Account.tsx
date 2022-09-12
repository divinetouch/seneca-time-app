import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import Toast, { Colors } from '../../components/toast/Toast'
import { IonContent } from '@ionic/react'
import HeaderTemplate from '../../templates/HeaderTemplate'
import './Account.scss'
import {
  AccountState,
  Context as AccountContext,
} from '../../context/AccountContext'
import AccountForm from '../../components/accountForm/AccountForm'

type ContextType = {
  state: AccountState
  createAccount: (account: AccountState) => Promise<boolean>
  updateAccount: (account: AccountState) => Promise<boolean>
  getAccount: () => AccountState
}

const Account: React.FC = () => {
  const { state, updateAccount } = useContext(AccountContext) as ContextType
  const [toast, setToast] = useState({
    status: false,
    message: '',
    color: 'success',
  })
  const history = useHistory()

  const handleSubmit = async (account: AccountState) => {
    try {
      await updateAccount(account)
      history.goBack()
    } catch (err) {
      setToast({
        ...toast,
        message: 'Error when trying to saved profile',
        status: true,
        color: Colors.danger,
      })
    }
  }

  const handleDismissed = () => {
    setToast({ ...toast, status: false })
  }

  return (
    <HeaderTemplate headerTitle='profile' showLeftIcon={true}>
      <IonContent>
        <AccountForm
          account={state}
          onSubmit={handleSubmit}
          buttonName='update'
        />
        <Toast position='top' toast={toast} dismissed={handleDismissed} />
      </IonContent>
    </HeaderTemplate>
  )
}

export default Account
