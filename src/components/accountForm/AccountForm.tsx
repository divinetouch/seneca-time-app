import React, { useState } from 'react'
import Toast, { Colors } from '../../components/toast/Toast'
import {
  IonItem,
  IonLabel,
  IonText,
  IonInput,
  IonDatetime,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonNote,
} from '@ionic/react'
import './AccountForm.scss'
import { AccountState, initialState } from '../../context/AccountContext'
import countries from '../../data/counties.json'

type PropType = {
  onSubmit: (account: AccountState) => void
  account?: AccountState
  buttonName: string
}

const AccountForm: React.FC<PropType> = ({ onSubmit, account, buttonName }) => {
  const [firstName, setFirstName] = useState(account!.firstName || '')
  const [lastName, setLastName] = useState(account!.lastName || '')
  const [email, setEmail] = useState(account!.email || '')
  const [dob, setDob] = useState(account!.dob || '')
  const [country, setCountry] = useState(account!.country || '')
  const [toast, setToast] = useState({
    status: false,
    message: '',
    color: Colors.success,
  })

  const handleInputChange = (event: CustomEvent) => {
    const eleName = (event.target! as HTMLInputElement).getAttribute('name')
    switch (eleName) {
      case 'First Name':
        return setFirstName(event.detail!.value)
      case 'Last Name':
        return setLastName(event.detail!.value)
      case 'email':
        return setEmail(event.detail!.value)
      case 'Date of Birth':
        return setDob(event.detail!.value)
      case 'country':
        return setCountry(event.detail!.value)
      default:
        return
    }
  }

  const handleSubmit = async () => {
    if (!firstName || !lastName || !country || !dob) {
      return setToast({
        ...toast,
        status: true,
        message: 'Missing required field!',
        color: Colors.danger,
      })
    } else {
      onSubmit({ ...account!, firstName, lastName, email, dob, country })
    }
  }

  const getCurrentYear = (): string => {
    return new Date().getFullYear().toString()
  }

  const handleDismissed = () => {
    setToast({ ...toast, status: false })
  }

  const generateCountrySelectOption = () => {
    return countries.map((c) => {
      return (
        <IonSelectOption key={c.name} value={c.name}>
          {c.name}
        </IonSelectOption>
      )
    })
  }

  return (
    <div className='ion-padding account-form'>
      <IonItem>
        <IonLabel position='stacked'>
          First name <IonText color='danger'>*</IonText>
        </IonLabel>
        <IonInput
          className='capitalized-input'
          required={true}
          name='First Name'
          value={firstName}
          autocapitalize='on'
          onIonChange={handleInputChange}
        />
      </IonItem>
      <IonItem>
        <IonLabel position='stacked'>
          Last Name <IonText color='danger'>*</IonText>
        </IonLabel>
        <IonInput
          className='capitalized-input'
          required={true}
          name='Last Name'
          value={lastName}
          autocapitalize='on'
          onIonChange={handleInputChange}
        />
      </IonItem>
      <IonItem>
        <IonLabel position='stacked'>
          Email <IonText color='danger'>*</IonText>
        </IonLabel>
        <IonInput
          type='email'
          required={true}
          name='email'
          value={email}
          onIonChange={handleInputChange}
        />
      </IonItem>
      <IonItem>
        <IonLabel position='stacked'>
          Date of Birth <IonText color='danger'>*</IonText>
        </IonLabel>
        <IonDatetime
          displayFormat='YYYY MMMM DD'
          min='1900'
          max={getCurrentYear()}
          value={dob}
          name='Date of Birth'
          onIonChange={handleInputChange}
        />
      </IonItem>
      <IonItem>
        <IonLabel position='stacked'>
          country <IonText color='danger'>*</IonText>
        </IonLabel>
        <IonSelect
          value={country}
          name='country'
          onIonChange={handleInputChange}
        >
          {generateCountrySelectOption()}
        </IonSelect>
      </IonItem>
      <IonButton expand='block' onClick={handleSubmit}>
        {buttonName}
      </IonButton>
      <div style={{ marginTop: '2rem', fontStyle: 'italic' }}>
        <IonNote color='danger'>
          Note: All of your data is saved in your local device only.
        </IonNote>
      </div>
      <Toast position='top' toast={toast} dismissed={handleDismissed} />
    </div>
  )
}

AccountForm.defaultProps = {
  account: initialState,
}

export default AccountForm
