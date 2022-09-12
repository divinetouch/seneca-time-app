import React, { useState, useEffect } from 'react'
import { IonItem, IonLabel, IonButton, IonContent } from '@ionic/react'
import './GoalConfig.scss'
import CustomPopup from '../../components/popup/CustomPopup'
import { ColorResult, RGBColor, SwatchesPicker } from 'react-color'
import { GoalState, defaultProps } from '../../context/GoalContext'

type propsType = {
  onSubmit: (goal: GoalState) => void
  goal: GoalState
}

enum Colors {
  backgroundColor,
  yearColor,
  monthColor,
  dayColor,
  hourColor,
  minuteColor,
  secondColor,
}

const getDarker = (color: RGBColor): RGBColor => {
  const TINT = 0.4
  return {
    r: color.r + (255 - color.r) * TINT,
    g: color.r + (255 - color.g) * TINT,
    b: color.r + (255 - color.b) * TINT,
    a: color.a! + (1 - color.a!) * TINT,
  }
}

const GoalForm: React.FC<propsType> = ({ onSubmit, goal }) => {
  const [showPopover, setShowPopover] = useState(false)
  const [pickColor, setPickColor] = useState<RGBColor>()
  const [whichColor, setWhichColor] = useState<Colors>()
  const [config, setConfig] = useState(goal.config)

  const handleChangeColor = (color: ColorResult) => {
    setShowPopover(!showPopover)
    switch (whichColor) {
      case Colors.backgroundColor:
        setConfig({
          ...config,
          backgroundColor: [color.rgb, getDarker(color.rgb)],
        })
        break
      case Colors.yearColor:
        setConfig({
          ...config,
          yearColor: [color.rgb, getDarker(color.rgb)],
        })
        break
      case Colors.monthColor:
        setConfig({
          ...config,
          monthColor: [color.rgb, getDarker(color.rgb)],
        })
        break
      case Colors.dayColor:
        setConfig({
          ...config,
          dayColor: [color.rgb, getDarker(color.rgb)],
        })
        break
      case Colors.hourColor:
        setConfig({
          ...config,
          hourColor: [color.rgb, getDarker(color.rgb)],
        })
        break
      case Colors.minuteColor:
        setConfig({
          ...config,
          minuteColor: [color.rgb, getDarker(color.rgb)],
        })
        break
      case Colors.secondColor:
        setConfig({
          ...config,
          secondColor: [color.rgb, getDarker(color.rgb)],
        })
        break
      default:
        break
    }
  }

  const handleYearPopup = () => {
    setPickColor(config.yearColor[0] as RGBColor)
    setWhichColor(Colors.yearColor)
    setShowPopover(!showPopover)
  }

  const handleMonthPopup = () => {
    setPickColor(config.monthColor[0] as RGBColor)
    setWhichColor(Colors.monthColor)
    setShowPopover(!showPopover)
  }

  const handleDayPopup = () => {
    setPickColor(config.dayColor[0] as RGBColor)
    setWhichColor(Colors.dayColor)
    setShowPopover(!showPopover)
  }

  const handleHourPopup = () => {
    setPickColor(config.hourColor[0] as RGBColor)
    setWhichColor(Colors.hourColor)
    setShowPopover(!showPopover)
  }

  const handleMinutePopup = () => {
    setPickColor(config.minuteColor[0] as RGBColor)
    setWhichColor(Colors.minuteColor)
    setShowPopover(!showPopover)
  }

  const handleSecondPopup = () => {
    setPickColor(config.secondColor[0] as RGBColor)
    setWhichColor(Colors.secondColor)
    setShowPopover(!showPopover)
  }

  const buildRgbSring = (color: RGBColor) => {
    return `rgba(${color!.r}, ${color!.g}, ${color!.b}, ${color!.a})`
  }

  const buildColorInput = (
    title: string,
    color: RGBColor,
    handlePopup: () => void
  ) => {
    return (
      <IonItem>
        <IonLabel position='stacked'>{title}</IonLabel>
        <div
          onClick={handlePopup}
          className='ion-margin-top form__color-display'
          style={{
            backgroundImage: `linear-gradient(to left top, ${buildRgbSring(
              color
            )}, ${buildRgbSring(getDarker(color))}, ${buildRgbSring(color)}`,
          }}
        />
        <p>{buildRgbSring(color)}</p>
      </IonItem>
    )
  }

  const handleSubmit = () => {
    onSubmit({ ...goal, config: { ...config } })
  }

  useEffect(() => {
    setConfig(goal.config)
  }, [goal])

  return (
    <IonContent className='form ion-padding-bottom'>
      {buildColorInput(
        'Year color',
        config.yearColor[0] as RGBColor,
        handleYearPopup
      )}
      {buildColorInput(
        'Month color',
        config.monthColor[0] as RGBColor,
        handleMonthPopup
      )}
      {buildColorInput(
        'Day Color',
        config.dayColor[0] as RGBColor,
        handleDayPopup
      )}
      {buildColorInput(
        'Hour Color',
        config.hourColor[0] as RGBColor,
        handleHourPopup
      )}
      {buildColorInput(
        'Minute Color',
        config.minuteColor[0] as RGBColor,
        handleMinutePopup
      )}
      {buildColorInput(
        'Second Color',
        config.secondColor[0] as RGBColor,
        handleSecondPopup
      )}
      <CustomPopup showPopover={showPopover}>
        <SwatchesPicker
          color={pickColor}
          onChangeComplete={handleChangeColor}
        />
      </CustomPopup>
      <IonButton expand='block' onClick={handleSubmit}>
        update
      </IonButton>
    </IonContent>
  )
}
GoalForm.defaultProps = {
  goal: defaultProps,
}

export default GoalForm
