import React, { useState, useEffect, useContext } from 'react'
import {
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonText,
  IonDatetime,
  IonButton,
  IonToggle,
  IonSelect,
  IonSelectOption,
  useIonViewWillEnter,
  IonNote,
  useIonViewDidEnter,
} from '@ionic/react'
import './GoalForm.scss'
import {
  GoalState,
  defaultProps,
  Repeat,
  GoalStatus,
} from '../../context/GoalContext'
import {
  Context as SettingContext,
  SettingState,
} from '../../context/SettingContext'
import { Plugins } from '@capacitor/core'
import { Status } from '../../context/FocusContext'
import Toast, { Colors } from '../../components/toast/Toast'
import moment from 'moment'

const { LocalNotifications, Modals } = Plugins

const MIN_YEAR = 120
const MAX_YEAR = 100
const DAILY_TIME_FORMAT = 'hh:mm A'
const WEEKLY_TIME_FORMAT = 'hh:mm A'
const MONTHLY_TIME_FORMAT = 'DD hh:mm A'
const YEARLY_TIME_FORMAT = 'MMM-DD hh:mm A'
export const DEFAULT_TIME_FORMAT = 'YY-MMM-DD hh:mm A'

type propsType = {
  buttonName: string
  onSubmit: Function
  onDelete?: Function
  goal?: GoalState
}

type SettingContextType = {
  state: SettingState
}

const GoalForm: React.FC<propsType> = ({
  buttonName,
  onSubmit,
  onDelete,
  goal,
}) => {
  const { state: settingState } = useContext(
    SettingContext
  ) as SettingContextType

  useIonViewDidEnter(() => {
    const enable = async () => {
      try {
        const result = await LocalNotifications.areEnabled()
        if (!result.value) {
          setShowNotificationOption(false)
        } else {
          setShowNotificationOption(settingState.notification)
        }
      } catch (e) {
        console.log('error', e)
      }
    }
    enable()
  }, [settingState])

  const [dateFormat, setDateFormat] = useState(DEFAULT_TIME_FORMAT)
  const [pickerFormat, setPickerFormat] = useState(DEFAULT_TIME_FORMAT)
  const [dayOfWeek, setDayOfWeek] = useState(
    moment(goal!.start).isoWeekday() || 0
  )
  const [endNotifyOptions, setEndNotifyOptions] = useState<JSX.Element[]>([])
  const [showNotoficationOption, setShowNotificationOption] = useState(false)
  const [title, setTitle] = useState(goal!.title)
  const [description, setDescription] = useState(goal!.description || '')
  const [start, setStart] = useState(goal!.start || '')
  const [end, setEnd] = useState(goal!.end || '')
  const [focus, setFocus] = useState(goal!.config.status || Status.Hide)
  const [notify, setNotify] = useState(goal!.config.notify || false)
  const [status, setStatus] = useState(goal!.status || GoalStatus.Progress)
  const [notifyBeforeStart, setNotifyBeforeStart] = useState(
    goal!.config.notifyBeforeStart || 0
  )
  const [notifyBeforeEnd, setNotifyBeforeEnd] = useState(
    goal!.config.notifyBeforeEnd || 0
  )
  const [repeat, setRepeat] = useState(goal!.repeat || Repeat.Long_Term)
  const [toast, setToast] = useState({
    status: false,
    message: '',
    color: Colors.success,
  })

  const handleInputChange = (event: CustomEvent) => {
    const eleName = (event.target! as HTMLInputElement).getAttribute('name')
    const value = event.detail.value
    switch (eleName) {
      case 'title':
        return setTitle(value)
      case 'description':
        return setDescription(value)
      case 'notifyBeforeStart':
        return setNotifyBeforeStart(value)
      case 'notifyBeforeEnd':
        return setNotifyBeforeEnd(value)
      case 'repeat':
        if (value === Repeat.Daily) {
          setDateFormat(DAILY_TIME_FORMAT)
          setPickerFormat(DAILY_TIME_FORMAT)
        } else if (value === Repeat.Weekly) {
          setDateFormat(WEEKLY_TIME_FORMAT)
          setPickerFormat(DAILY_TIME_FORMAT)
        } else if (value === Repeat.Monthly) {
          setDateFormat(MONTHLY_TIME_FORMAT)
          setPickerFormat(MONTHLY_TIME_FORMAT)
        } else if (value === Repeat.Yearly) {
          setDateFormat(YEARLY_TIME_FORMAT)
          setPickerFormat(YEARLY_TIME_FORMAT)
        } else {
          setDateFormat(DEFAULT_TIME_FORMAT)
          setPickerFormat(DEFAULT_TIME_FORMAT)
        }
        if (status === GoalStatus.Done) {
          setStatus(goal!.status)
        }
        return setRepeat(value)
      case 'start':
        if (end === '') setEnd(value)
        return setStart(value)
      case 'end':
        return setEnd(value)
      case 'day_of_week':
        return setDayOfWeek(value)
      case 'status':
        console.log(value)
        return setStatus(value)
      default:
        return
    }
  }

  const handleDismissed = () => {
    setToast({ ...toast, status: false })
  }

  const handleSubmit = () => {
    if (repeat === Repeat.Weekly && dayOfWeek === 0) {
      return setToast({
        ...toast,
        color: Colors.danger,
        message: 'Please select day of the week',
        status: true,
      })
    }
    if (!title || !start || !end) {
      return setToast({
        ...toast,
        color: Colors.danger,
        message: 'Missing required field!',
        status: true,
      })
    }
    if (!title || !start || !end) {
      return setToast({
        ...toast,
        color: Colors.danger,
        message: 'Missing required field!',
        status: true,
      })
    }
    if (moment(start).isAfter(moment(end))) {
      return setToast({
        ...toast,
        color: Colors.danger,
        message: "Start date can't be after end date",
        status: true,
      })
    }
    if (moment(start).isSame(moment(end))) {
      return setToast({
        ...toast,
        color: Colors.danger,
        message: "Start date can't be the same as end date",
        status: true,
      })
    }

    const now = moment()
    const getValidate = (date: string) => {
      if (repeat !== Repeat.Weekly) {
        return moment(date).toString()
      }
      if (now.isoWeekday() > dayOfWeek) {
        const next = moment(date).clone().add(1, 'weeks').isoWeekday(dayOfWeek)
        return next.toString()
      } else {
        const next = moment(date).clone().isoWeekday(dayOfWeek)
        return next.toString()
      }
    }

    onSubmit({
      ...goal,
      title,
      description,
      id: goal!.id || '',
      start: getValidate(start),
      end: getValidate(end),
      repeat,
      status,
      config: {
        ...goal!.config,
        notifyBeforeStart: +notifyBeforeStart,
        notifyBeforeEnd: +notifyBeforeEnd,
        status: focus,
        notify,
      },
    })
  }

  const handleDelete = async () => {
    let confirmRet = await Modals.confirm({
      title: 'Confirm',
      message: "Are you sure you'd like to delete this goal?",
    })

    if (confirmRet.value) {
      onDelete!(goal)
    }
    console.log('Confirm ret', confirmRet)
  }

  const handleStatusChange = async (event: React.FormEvent) => {
    const on = event.currentTarget.getAttribute('aria-checked')
    const name = event.currentTarget.getAttribute('name')
    if (name === 'focus') {
      setFocus(on === 'false' ? Status.Show : Status.Hide)
    } else if (name === 'notify') {
      if (on !== 'false') {
        setNotifyBeforeEnd(0)
        setNotifyBeforeStart(0)
      }
      setNotify(on === 'false')
    }
  }

  const generateNotificationTimingOption = () => {
    if (moment(end).isAfter(moment(start))) {
      const diff = moment.duration(moment(end).diff(moment(start)))
      setEndNotifyOptions(generateOptions(diff, notifyBeforeEnd))
    } else {
      setEndNotifyOptions([])
    }
  }

  const generateOptions = (
    diff: moment.Duration,
    timeValue: number
  ): JSX.Element[] => {
    const options: JSX.Element[] = [
      <IonSelectOption key={0} value={0}>
        None
      </IonSelectOption>,
    ]

    if (diff.asMinutes() > 5) {
      options.push(<IonSelectOption value={5}>5 minutes</IonSelectOption>)
    }
    if (diff.asMinutes() > 10) {
      options.push(<IonSelectOption value={10}>10 minutes</IonSelectOption>)
    }
    if (diff.asMinutes() > 15) {
      options.push(<IonSelectOption value={15}>15 minutes</IonSelectOption>)
    }
    if (diff.asMinutes() > 30) {
      options.push(<IonSelectOption value={30}>30 minutes</IonSelectOption>)
    }
    if (diff.asMinutes() > 60) {
      options.push(<IonSelectOption value={60}>1 hour</IonSelectOption>)
    }
    if (diff.asMinutes() > 1440) {
      options.push(<IonSelectOption value={1440}>1 day</IonSelectOption>)
    }

    return options
  }

  useEffect(() => {
    generateNotificationTimingOption()
  }, [start, end])

  useEffect(() => {
    const value = repeat
    console.log('value is', value, goal?.repeat)
    if (value === Repeat.Daily) {
      setDateFormat(DAILY_TIME_FORMAT)
      setPickerFormat(DAILY_TIME_FORMAT)
    } else if (value === Repeat.Weekly) {
      setDateFormat(WEEKLY_TIME_FORMAT)
      setPickerFormat(DAILY_TIME_FORMAT)
    } else if (value === Repeat.Monthly) {
      setDateFormat(MONTHLY_TIME_FORMAT)
      setPickerFormat(MONTHLY_TIME_FORMAT)
    } else if (value === Repeat.Yearly) {
      setDateFormat(YEARLY_TIME_FORMAT)
      setPickerFormat(YEARLY_TIME_FORMAT)
    } else {
      setDateFormat(DEFAULT_TIME_FORMAT)
      setPickerFormat(DEFAULT_TIME_FORMAT)
    }
  }, [repeat])

  const generateStatusOption = () => {
    return (
      <IonSelect onIonChange={handleInputChange} name='status' value={status}>
        <IonSelectOption value={GoalStatus.Progress}>
          {GoalStatus.Progress}
        </IonSelectOption>
        {repeat !== Repeat.Long_Term ? (
          <>
            <IonSelectOption value={GoalStatus.Done}>
              {GoalStatus.Done}
            </IonSelectOption>
            <IonSelectOption value={GoalStatus.Complete}>
              {GoalStatus.Complete}
            </IonSelectOption>
          </>
        ) : (
          <IonSelectOption value={GoalStatus.Complete}>
            Complete
          </IonSelectOption>
        )}
      </IonSelect>
    )
  }

  return (
    <div className='form'>
      <IonItem>
        <IonLabel position='stacked'>
          Title <IonText color='danger'>*</IonText>
        </IonLabel>
        <IonInput
          required={true}
          name='title'
          value={title}
          onIonChange={handleInputChange}
        />
      </IonItem>
      <IonItem>
        <IonLabel position='stacked'>
          What kind of goal?<IonText color='danger'>*</IonText>
        </IonLabel>
        <IonSelect onIonChange={handleInputChange} name='repeat' value={repeat}>
          <IonSelectOption value={Repeat.Daily}>{Repeat.Daily}</IonSelectOption>
          <IonSelectOption value={Repeat.Weekly}>
            {Repeat.Weekly}
          </IonSelectOption>
          <IonSelectOption value={Repeat.Monthly}>
            {Repeat.Monthly}
          </IonSelectOption>
          <IonSelectOption value={Repeat.Yearly}>
            {Repeat.Yearly}
          </IonSelectOption>
          <IonSelectOption value={Repeat.Long_Term}>
            {Repeat.Long_Term.replace('_', ' ')}
          </IonSelectOption>
        </IonSelect>
      </IonItem>
      <IonItem>
        <IonLabel position='stacked'>
          Status<IonText color='danger'>*</IonText>
        </IonLabel>
        {generateStatusOption()}
      </IonItem>
      <IonItem>
        <IonLabel position='stacked'>
          {repeat !== Repeat.Long_Term ? 'start' : 'start date'}
          <IonText color='danger'>*</IonText>
        </IonLabel>
        <IonDatetime
          displayFormat={dateFormat}
          pickerFormat={pickerFormat}
          min={(new Date().getFullYear() - MIN_YEAR).toString()}
          max={(new Date().getFullYear() + MAX_YEAR).toString()}
          value={start}
          onIonChange={handleInputChange}
          name='start'
        />
      </IonItem>
      <IonItem>
        <IonLabel position='stacked'>
          {repeat !== Repeat.Long_Term ? 'end' : 'end date'}
          <IonText color='danger'>*</IonText>
        </IonLabel>
        <IonDatetime
          displayFormat={dateFormat}
          pickerFormat={pickerFormat}
          min={(new Date().getFullYear() - MIN_YEAR).toString()}
          max={(new Date().getFullYear() + MAX_YEAR).toString()}
          value={end}
          onIonChange={handleInputChange}
          name='end'
        />
      </IonItem>
      {repeat === Repeat.Weekly && (
        <IonItem>
          <IonLabel position='stacked'>
            Day of the week<IonText color='danger'>*</IonText>
          </IonLabel>
          <IonSelect
            name='day_of_week'
            onIonChange={handleInputChange}
            value={dayOfWeek}
          >
            <IonSelectOption value={1}>Monday</IonSelectOption>
            <IonSelectOption value={2}>Tuesday</IonSelectOption>
            <IonSelectOption value={3}>Wednesday</IonSelectOption>
            <IonSelectOption value={4}>Thursday</IonSelectOption>
            <IonSelectOption value={5}>Friday</IonSelectOption>
            <IonSelectOption value={6}>Saturday</IonSelectOption>
            <IonSelectOption value={7}>Sunday</IonSelectOption>
          </IonSelect>
        </IonItem>
      )}
      <IonItem>
        <IonLabel position='stacked'>Descripton</IonLabel>
        <IonTextarea
          name='description'
          value={description}
          onIonChange={handleInputChange}
        />
      </IonItem>
      <IonItem>
        <IonLabel position='stacked'>{`Show on ${
          repeat === Repeat.Long_Term ? 'long term' : 'daily'
        } Page`}</IonLabel>
        <IonToggle
          checked={focus === Status.Show}
          color='success'
          onClick={handleStatusChange}
          name='focus'
        />
      </IonItem>
      <IonItem>
        <IonLabel position='stacked'>notify me</IonLabel>
        <IonToggle
          disabled={!showNotoficationOption}
          checked={notify && showNotoficationOption}
          color='success'
          onClick={handleStatusChange}
          name='notify'
        />
        {!showNotoficationOption && (
          <IonNote
            color='primary'
            style={{ paddingBottom: 5, fontStyle: 'italic' }}
          >
            You have to turn on the notification both in the app setting and in
            your phone setting.
          </IonNote>
        )}
      </IonItem>
      {notify && (
        <>
          <IonItem>
            <IonLabel position='stacked'>Notify before start</IonLabel>
            <IonSelect
              onIonChange={handleInputChange}
              placeholder='notify before goal start'
              name='notifyBeforeStart'
              value={notifyBeforeStart}
            >
              <IonSelectOption value={0}>None</IonSelectOption>
              <IonSelectOption value={5}>5 minutes</IonSelectOption>
              <IonSelectOption value={10}>10 minutes</IonSelectOption>
              <IonSelectOption value={15}>15 minutes</IonSelectOption>
              <IonSelectOption value={30}>30 minutes</IonSelectOption>
              <IonSelectOption value={60}>60 minutes</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position='stacked'>Notify before end</IonLabel>
            <IonSelect
              onIonChange={handleInputChange}
              placeholder='notify before goal start'
              name='notifyBeforeEnd'
              value={notifyBeforeEnd}
            >
              {endNotifyOptions}
            </IonSelect>
          </IonItem>
        </>
      )}
      <IonButton expand='block' onClick={handleSubmit}>
        {buttonName}
      </IonButton>
      {goal!.id ? (
        <IonButton expand='block' onClick={handleDelete} color='danger'>
          delete
        </IonButton>
      ) : null}
      <Toast position='top' toast={toast} dismissed={handleDismissed} />
    </div>
  )
}
GoalForm.defaultProps = {
  goal: defaultProps,
}

export default React.memo(GoalForm)
