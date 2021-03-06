import { Grow as GrowTransition } from '@material-ui/core';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { useSnackbar } from 'notistack';

import ConditionRoute from '@/components/condition-route';

import Home from '@/views/home';
import ResetPassword from '@/views/resetPassword';
import ResetPasswordConfirm from '@/views/resetPasswordConfirm';
import Dashboard from '@/views/manage';
import Vote from '@/views/voteForm';

import LoadingScreen from '@/components/loading-screen';

import { useSelector, useDispatch } from 'react-redux';
import { checkAuthenticated } from '@/store/actions/auth';
import { fetchUserGroups, fetchUserPolls } from '@/store/actions/items';
import { clearNotify } from '@/store/actions/ui';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { ptBR, esES, enUS } from '@material-ui/core/locale';
import { useContext, useEffect, useState } from 'react';
import { LocaleContext } from './components/language-wrapper';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthenticated());
  }, [dispatch]);

  const isAuthenticated = useSelector((state) => Boolean(state.auth.access));

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserGroups());
      dispatch(fetchUserPolls());
    }
  }, [isAuthenticated, dispatch]);

  const { enqueueSnackbar } = useSnackbar();

  const notif = useSelector((state) => state.ui.notification);

  useEffect(() => {
    if (notif) {
      enqueueSnackbar(notif.msg, {
        variant: notif.variant,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        },
        TransitionComponent: GrowTransition,
        autoHideDuration: 2500,
      });
      dispatch(clearNotify());
    }
  }, [notif, enqueueSnackbar, dispatch]);

  const loading = useSelector((state) => state.ui.loading);

  const [locale, setLocale] = useState(ptBR);
  const localeContext = useContext(LocaleContext);
  useEffect(() => {
    switch (localeContext.locale) {
      case 'pt-BR':
        setLocale(ptBR);
        break;
      case 'es-ES':
        setLocale(esES);
        break;
      default:
        setLocale(enUS);
    }
  }, [localeContext]);

  const theme = createMuiTheme(
    {
      palette: {
        primary: { main: '#1976d2' },
      },
    },
    locale
  );

  return (
    <ThemeProvider theme={theme}>
      {loading ? (
        <LoadingScreen />
      ) : (
        <Router>
          <Switch>
            {/* Nesse caso, não usamos o exact, pois essa rota servirá
                    para dar match em /manage/polls/*, /manage/groups/*, etc..
                    Como especificado em views/manage/index.jsx
                */}
            <ConditionRoute
              path='/manage'
              component={Dashboard}
              condition={isAuthenticated}
              redirect='/'
            />
            <ConditionRoute
              exact
              path='/'
              component={Home}
              condition={!isAuthenticated}
              redirect='/manage'
            />
            <ConditionRoute
              exact
              path='/resetar-senha'
              component={ResetPassword}
              condition={!isAuthenticated}
              redirect='/manage'
            />
            <ConditionRoute
              exact
              path='/password/reset/confirm/:uid/:token'
              component={ResetPasswordConfirm}
              condition={!isAuthenticated}
              redirect='/manage'
            />
            <Route exact path='/polls/:id/vote' component={Vote} />
          </Switch>
        </Router>
      )}
    </ThemeProvider>
  );
}
