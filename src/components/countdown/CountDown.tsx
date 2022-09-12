import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonCardTitle,
} from '@ionic/react'
import './CountDown.scss'
import countdown from 'countdown'
import moment from 'moment'
import { settings } from 'ionicons/icons'
import { GoalState } from '../../context/GoalContext'
import { RGBColor } from 'react-color'

enum Time {
  MONTH = 12,
  DAY = moment(new Date()).daysInMonth(),
  SECOND = 60,
  MINUTE = 60,
  HOUR = 24,
}

const HEIGHT = 100

type CountDownType = {
  goal: GoalState
  onConfigClick: Function
  className?: 'upcoming-list' | 'daily-list' | 'long-term' | 'life'
  updateActionSheetStatus?: Function
}

const CountDown: React.FC<CountDownType> = ({
  onConfigClick,
  goal,
  className,
  updateActionSheetStatus,
}) => {
  const [yearHeight, setYearHeight] = useState(HEIGHT)
  const [monthHeight, setMonthHeight] = useState(HEIGHT)
  const [dayHeight, setDayHeight] = useState(HEIGHT)
  const [hourHeight, setHourHeight] = useState(HEIGHT)
  const [minuteHeight, setMinuteHeight] = useState(HEIGHT)
  const [secondHeight, setSecondHeight] = useState(HEIGHT)
  const [status, setStatus] = useState('progress')
  const [subTitle, setSubtitle] = useState('')
  const [currentValues, setCurrentValues] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const yearRef = useRef<HTMLSpanElement>(null)
  const monthRef = useRef<HTMLSpanElement>(null)
  const dayRef = useRef<HTMLSpanElement>(null)
  const hourRef = useRef<HTMLSpanElement>(null)
  const minuteRef = useRef<HTMLSpanElement>(null)
  const secondRef = useRef<HTMLSpanElement>(null)
  const [config, setConfig] = useState(goal.config)
  const [isDone, setIsDone] = useState(false)

  //Update animation
  useEffect(() => {
    if (currentValues.years !== 0) {
      yearRef.current!.style.transform = `translateY(${Math.round(
        HEIGHT - yearHeight
      )}%)`
    }
  }, [yearHeight, currentValues])

  useEffect(() => {
    if (currentValues.months !== 0) {
      monthRef.current!.style.transform = `translateY(${Math.floor(
        HEIGHT - monthHeight
      )}%)`
    }
  }, [monthHeight, currentValues])

  useEffect(() => {
    if (currentValues.days !== 0) {
      dayRef.current!.style.transform = `translateY(${Math.floor(
        HEIGHT - dayHeight
      )}%)`
    }
  }, [dayHeight, currentValues])

  useEffect(() => {
    hourRef.current!.style.transform = `translateY(${Math.floor(
      HEIGHT - hourHeight
    )}%)`
  }, [hourHeight])

  useEffect(() => {
    minuteRef.current!.style.transform = `translateY(${Math.floor(
      HEIGHT - minuteHeight
    )}%)`
  }, [minuteHeight])

  useEffect(() => {
    secondRef.current!.style.transform = `translateY(${Math.floor(
      HEIGHT - secondHeight
    )}%)`
  }, [secondHeight])

  const update = useCallback(() => {
    console.log('ui big refresh')
    const now = new Date()
    const startDate = new Date(goal.start)
    const endDate = new Date(goal.end)
    const timeSpan = countdown(startDate, endDate) as countdown.Timespan
    const startToNow = countdown(startDate, now) as countdown.Timespan
    const nowToEnd = countdown(now, endDate) as countdown.Timespan

    const setHeight = (duration: countdown.Timespan) => {
      setSecondHeight(
        HEIGHT -
          Math.floor(((Time.SECOND - duration.seconds!) * HEIGHT) / Time.SECOND)
      )
      setMinuteHeight(
        HEIGHT -
          Math.floor(((Time.MINUTE - duration.minutes!) * HEIGHT) / Time.MINUTE)
      )
      setHourHeight(
        HEIGHT -
          Math.floor(((Time.HOUR - duration.hours!) * HEIGHT) / Time.HOUR)
      )
      setDayHeight(
        HEIGHT - Math.floor(((Time.DAY - duration.days!) * HEIGHT) / Time.DAY)
      )
      setMonthHeight(
        HEIGHT -
          Math.floor(((Time.MONTH - duration.months!) * HEIGHT) / Time.MONTH)
      )
      if (duration.years === 0) {
        setYearHeight(0)
      } else {
        setYearHeight(
          HEIGHT -
            Math.floor(
              ((timeSpan.years! - duration.years!) * HEIGHT) / timeSpan.years!
            )
        )
      }
    }

    // detect whehter the start date is before the current time/date
    if (moment(endDate).isBefore(moment(now))) {
      setCurrentValues({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      })
      setIsDone(true)
      setYearHeight(0)
      setMonthHeight(0)
      setDayHeight(0)
      setMinuteHeight(0)
      setHourHeight(0)
      setSecondHeight(0)
    } else if (moment(startDate).isAfter(moment(now))) {
      /** This is the case where the start date is in the future
          --> start counting to start
       */
      setCurrentValues({
        years: startToNow.years!,
        months: startToNow.months!,
        days: startToNow.days!,
        hours: startToNow.hours!,
        minutes: startToNow.minutes!,
        seconds: startToNow.seconds!,
      })
      setHeight(startToNow)
      setSubtitle('time left before start')
      setStatus('pending')
    } else if (moment(startDate).isBefore(moment(now))) {
      /** This is the case where the start date was already passed
          --> start counting down from now till the end of the goal 
       */
      if (className === 'life') {
        setSubtitle('remaining life expectency')
      } else {
        setSubtitle('time left before end')
      }
      setStatus('progress')
      setCurrentValues({
        years: nowToEnd.years!,
        months: nowToEnd.months!,
        days: nowToEnd.days!,
        hours: nowToEnd.hours!,
        minutes: nowToEnd.minutes!,
        seconds: nowToEnd.seconds!,
      })
      setHeight(nowToEnd)
    }
  }, [className, goal.end, goal.start])

  // Update times
  useEffect(() => {
    if (secondHeight <= 0 && !isDone) {
      update()
      setSecondHeight(HEIGHT)
    }
    if (isDone) {
      setSecondHeight(0)
    }
  }, [secondHeight, update, isDone])

  // set up for initial load
  useEffect(() => {
    //set up intervale to update the animation
    const interVal = setInterval(() => {
      setSecondHeight((newHeight) => newHeight - HEIGHT / Time.SECOND)
    }, 1000)

    if (!isDone) {
      update()
    } else {
      clearInterval(interVal)
    }

    return () => {
      clearInterval(interVal)
    }
  }, [goal, isDone, update])

  useEffect(() => {
    setConfig(goal.config)
  }, [goal.config])

  const handleConfigClick = () => {
    onConfigClick(goal)
  }

  const handleUpdateStatus = () => {
    if (updateActionSheetStatus) {
      updateActionSheetStatus(goal)
    }
  }

  const buildRgbSring = (color: RGBColor) => {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
  }

  const buildString = (color: RGBColor[]) => {
    return `linear-gradient(to left top, ${buildRgbSring(
      color[0]
    )}, ${buildRgbSring(color[1])}, ${buildRgbSring(color[0])})`
  }

  return (
    <IonCard className={`card ${className} ${status}`}>
      <IonCardHeader>
        <div className='card__title'>
          <IonCardTitle className='card__title-text'>{goal.title}</IonCardTitle>
          <IonButton
            onClick={handleConfigClick}
            slot='icon-only'
            size='small'
            fill='clear'
            className='card__icon'
          >
            <IonIcon size='large' icon={settings} />
          </IonButton>
        </div>
        <IonCardSubtitle className='card__title card__title-subtext'>
          {subTitle}
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent onClick={handleUpdateStatus}>
        <div className='data'>
          {currentValues.years !== 0 && (
            <div className='data__section'>
              <div className='data__section--title'>Y</div>
              <div className='data__section--container'>
                <div className='display'>{currentValues!.years}</div>
                <span
                  className='animated'
                  ref={yearRef}
                  style={{
                    backgroundImage: buildString(
                      config.yearColor as RGBColor[]
                    ),
                  }}
                >
                  &nbsp;
                </span>
              </div>
            </div>
          )}
          {currentValues.months !== 0 && (
            <div className='data__section'>
              <div className='data__section--title'>M</div>
              <div className='data__section--container'>
                <div className='display'>{currentValues!.months}</div>
                <span
                  className='animated'
                  style={{
                    backgroundImage: buildString(
                      config.monthColor as RGBColor[]
                    ),
                  }}
                  ref={monthRef}
                >
                  &nbsp;
                </span>
              </div>
            </div>
          )}
          {currentValues.days !== 0 && (
            <div className='data__section'>
              <div className='data__section--title'>D</div>
              <div className='data__section--container'>
                <div className='display'>{currentValues!.days}</div>
                <span
                  className='animated'
                  style={{
                    backgroundImage: buildString(config.dayColor as RGBColor[]),
                  }}
                  ref={dayRef}
                >
                  &nbsp;
                </span>
              </div>
            </div>
          )}
          <div className='data__section'>
            <div className='data__section--title'>H</div>
            <div className='data__section--container'>
              <div className='display'>{currentValues!.hours}</div>
              <span
                className='animated'
                style={{
                  backgroundImage: buildString(config.hourColor as RGBColor[]),
                }}
                ref={hourRef}
              >
                &nbsp;
              </span>
            </div>
          </div>
          <div className='data__section'>
            <div className='data__section--title'>Min</div>
            <div className='data__section--container'>
              <div className='display'>{currentValues!.minutes}</div>
              <span
                className='animated'
                style={{
                  backgroundImage: buildString(
                    config.minuteColor as RGBColor[]
                  ),
                }}
                ref={minuteRef}
              >
                &nbsp;
              </span>
            </div>
          </div>
          <div className='data__section'>
            <div className='data__section--title'>sec</div>
            <div className='data__section--container'>
              <div className='display'>
                {Math.floor(secondHeight / (HEIGHT / Time.SECOND))}
              </div>
              <span
                className='animated'
                style={{
                  backgroundImage: buildString(
                    config.secondColor as RGBColor[]
                  ),
                }}
                ref={secondRef}
              >
                &nbsp;
              </span>
            </div>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  )
}

export default CountDown
