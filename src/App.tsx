import React, { useEffect } from 'react'
import { Route } from 'react-router-dom'
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Plugins } from '@capacitor/core'
import Home from './pages/home/Home'
import Focus from './pages/focus/Focus'
import GoalList from './pages/goalList/GoalList'
import Setting from './pages/setting/Setting'
import Account from './pages/account/Account'
import GoalDetail from './pages/goalDetail/GoalDetail'
import GoalCreate from './pages/goalCreate/GoalCreate'
import DailyGoal from './pages/dailyGoal/DailyGoal'
import Information from './pages/information/Information'
import { Provider as GoalProvider } from './context/GoalContext'
import { Provider as AccountProvider } from './context/AccountContext'
import { Provider as FocusProvider } from './context/FocusContext'
import { Provider as HomeProvider } from './context/HomeContext'
import { Provider as SettingProvider } from './context/SettingContext'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'
import {
  home,
  checkmarkCircleOutline,
  infinite,
  bulb,
  cog,
} from 'ionicons/icons'

/* Theme variables */
import './theme/variables.css'
import Auth from './pages/auth/Auth'

const { SplashScreen } = Plugins

const MyApp: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path='/' component={Home} exact={true} />
            <Route path='/home' component={Home} exact={true} />
            <Route path='/focus' component={Focus} exact={true} />
            <Route path='/create' component={GoalCreate} exact={true} />
            <Route path='/goals' component={GoalList} exact={true} />
            <Route path='/goals/:id' component={GoalDetail} exact={true} />
            <Route path='/setting' component={Setting} exact={true} />
            <Route path='/account' component={Account} exact={true} />
            <Route path='/daily' component={DailyGoal} exact={true} />
            <Route path='/information' component={Information} exact={true} />
            <Route path='/signup' component={Home} exact={true} />
          </IonRouterOutlet>
          <IonTabBar slot='bottom'>
            <IonTabButton tab='home' href='/home'>
              <IonIcon icon={home} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab='focus' href='/focus'>
              <IonIcon icon={infinite} />
              <IonLabel>Long Term</IonLabel>
            </IonTabButton>
            <IonTabButton tab='daily' href='/daily'>
              <IonIcon icon={checkmarkCircleOutline} />
              <IonLabel>Daily</IonLabel>
            </IonTabButton>
            <IonTabButton tab='goals' href='/goals'>
              <IonIcon icon={bulb} />
              <IonLabel>Create</IonLabel>
            </IonTabButton>
            <IonTabButton tab='setting' href='/setting'>
              <IonIcon icon={cog} />
              <IonLabel>Setting</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  )
}

const App: React.FC = () => {
  useEffect(() => {
    SplashScreen.hide()
  }, [])

  return (
    <GoalProvider>
      <AccountProvider>
        <FocusProvider>
          <HomeProvider>
            <SettingProvider>
              <Auth>
                <MyApp />
              </Auth>
            </SettingProvider>
          </HomeProvider>
        </FocusProvider>
      </AccountProvider>
    </GoalProvider>
  )
}

export default App
