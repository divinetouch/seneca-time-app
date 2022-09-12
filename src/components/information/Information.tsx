import React from 'react'
import { IonContent } from '@ionic/react'

const Info: React.FC = () => {
  return (
    <IonContent className='ion-padding'>
      <ol>
        <li style={{ marginTop: '1rem' }}>
          <div style={{ fontWeight: 'bold' }}>
            How life expectency was calculated?
          </div>{' '}
          <div style={{ marginTop: '0.5rem' }}>
            The life expectency data that's being used in this app is publicly
            availble at the{' '}
            <a href='https://apps.who.int/gho/data/node.main.688?lang=en'>
              WHO
            </a>{' '}
            website.
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            Please also note that the app does not take gender into account. If
            you want to know more about how gender affects life expectency
            please visit the{' '}
            <a href='https://apps.who.int/gho/data/node.main.688?lang=en'>
              WHO
            </a>{' '}
            website.
          </div>
        </li>
        <li style={{ marginTop: '1rem' }}>
          <div style={{ fontWeight: 'bold' }}>What do those number means?</div>{' '}
          <div style={{ marginTop: '0.5rem' }}>
            Those numbers represents the estimated time left to live given the
            life expectency. For instance, given your location, if the life
            expectency is 78 years and you were born in 1980. Then in the year
            2020 your expected time left is 1980 + 78 - 2020 = 37 years left to
            live. The numbers also include month, day, hour, and second because
            the calculation also take into account your month of birth and day
            of birth.
          </div>
        </li>
        <li style={{ marginTop: '1rem' }}>
          <div style={{ fontWeight: 'bold' }}>
            Is the app collect any information and save them in the cloud?
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            No. This app does not connect to any backend service.
          </div>
        </li>
      </ol>
    </IonContent>
  )
}

export default Info
