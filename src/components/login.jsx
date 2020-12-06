import {
    Avatar, Button, TextField,
    Link as StyledLink, Grid, Typography,
    Container
} from '@material-ui/core'
import { login } from '@/store/actions/auth'
import DisplayAlert from './displayAlert'

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { useStyles } from '@/styles/form'


export default function Login() {
    const classes = useStyles();
    const [data, setData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = data;
    const onChange = useCallback(e => setData(data => ({
        ...data, [e.target.name]: e.target.value
    })), []);

    const dispatch = useDispatch();

    const onSubmit = useCallback(e => {
        e.preventDefault();
        dispatch(login(email, password));
    }, [email, password, dispatch]);

    const error = useSelector(state => state.auth.error);

    return (
        <Container className={classes.app} maxWidth="xs">
            <div className={classes.paper}>
                {DisplayAlert(error)}
                <Avatar className={classes.avatar} />
                <Typography component="h1" variant="h5" className={classes.typography} >
                    Entrar
                </Typography>
                <form className={classes.form} noValidate onSubmit={e => onSubmit(e)}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        type="email"
                        label="Email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        onChange={e => onChange(e)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Senha"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={e => onChange(e)}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Entrar
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <StyledLink to="/resetar-senha" variant="body2"
                                component={Link}
                            >
                                Esqueceu sua senha?
                            </StyledLink>
                        </Grid>
                    </Grid>
                </form>
                <p></p>
            </div>
        </Container>
    );
}
