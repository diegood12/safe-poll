import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Link } from "react-router-dom";

import {
    Divider, Grid, TextField,
    CardActions, CardContent, Card,
    Button, Typography, IconButton,
    Paper
} from '@material-ui/core';

import LoadingScreen from '@/components/loading-screen';

// Ícones
import {
    DeleteOutline as DeleteIcon,
    Add as AddIcon,
} from '@material-ui/icons';

import { useSelector, useDispatch } from 'react-redux';
import { notify } from '@/store/actions/ui';
import { pushGroup } from '@/store/actions/items';

import isEmail from 'validator/lib/isEmail';

import axios from 'axios';

import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
    root: {
        width: '500px',
        maxWidth: '98%',
        justifyContent: 'center',
        textAlign: 'center'
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    paper: {
        height: '100%',
        verticalAlign: 'middle',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    button: {
        marginRight: 5,
        marginTop: '10px',
        marginBottom: '10px',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
        }
    },
    deleteIcon: {
        color: '#900a0a',
    },
}));

export default function EmailsGroup() {
    const classes = useStyles();

    const [emails, setEmails] = useState([]);
    const [name, setName] = useState('');

    // novo email a ser adicionado
    const [newEmail, setNewEmail] = useState('');

    // Estado de erros de validação dos emails
    const [newEmailError, setNewEmailError] = useState(false);

    const groups = useSelector(state => state.items.groups)

    // Estado de erros de validação do nome do grupo
    const nameError = useMemo(() => {
        return (groups || []).map(g => g.name).includes(name);
    }, [groups, name]);

    const disabled = useMemo(() => (
        name === '' || emails.length === 0 || nameError
    ), [name, emails, nameError]);

    // Ref para a caixa de texto de novo email (usada para autofocus)
    const newEmailRef = useRef();

    const createEmail = useCallback(() => {
        if (newEmail && !newEmailError) {
            setEmails(emails => [...emails, newEmail]);
            setNewEmail('');
        }
    }, [newEmailError, newEmail]);

    const deleteEmail = useCallback(index => {
        const newEmails = [...emails];
        newEmails.splice(index, 1);
        setEmails(newEmails);
    }, [emails]);

    useEffect(() => {
        if (emails.includes(newEmail) || !isEmail(newEmail)) {
            setNewEmailError(true);
        } else {
            setNewEmailError(false);
        }
    }, [newEmail, emails]);

    const router = useHistory();

    const token = useSelector(state => state.auth.access);

    const dispatch = useDispatch();

    const submit = useCallback(async () => {
        const data = {
            emails, name
        }
        try {
            const { data: { id } } = await axios.post('/api/groups/create', data, {
                headers: {
                    Authorization: `JWT ${token}`
                }
            });
            dispatch(pushGroup({
                id, ...data
            }));
            dispatch(notify('Grupo criado com sucesso', 'success'));
            router.replace(`/manage/groups/${id}`)
        }
        catch ({ response }) {
            dispatch(notify(response.data.message, 'error'));
        }
    }, [name, emails, token, router, dispatch]);

    return !groups ? <LoadingScreen /> : (
        <Grid container className={classes.root} justify="center">
            <Card className={classes.root}>
                <CardContent>
                    <Typography variant="button" display="block" gutterBottom style={{ marginTop: 10 }}>
                        Novo Grupo:
                    </Typography>
                    <Grid container spacing={1} style={{ justifyContent: 'center' }}>
                        <Grid item xs={12} sm={2}>
                            <Typography className={classes.paper}>Nome:</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField id="name"
                                error={nameError}
                                helperText={nameError ? 'Já existe grupo com esse nome' : null}
                                autoComplete="off"
                                className={classes.field}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                variant="outlined"
                                margin="normal"
                                required
                                autoFocus
                                InputProps={{
                                    className: classes.input
                                }}
                                style={{ width: '100%', textAlign: 'center' }}
                            /></Grid>
                    </Grid>

                    <Divider style={{ marginBottom: 20, marginTop: 20 }} />
                    <Typography variant="button" display="block" gutterBottom style={{ marginBottom: 20 }}>
                        Emails:
                </Typography>
                    {emails.map((email, index) =>
                        <Grid container key={index} style={{ justifyContent: 'center', marginBottom: 10 }}>
                            <Grid item xs={10}>
                                <Paper className={classes.paper}><Typography noWrap className={classes.paper}>{email}</Typography></Paper>
                            </Grid>

                            <Grid item xs={2}>
                                <IconButton onClick={
                                    () => deleteEmail(index)
                                }>
                                    <DeleteIcon className={classes.deleteIcon} />
                                </IconButton>
                            </Grid>
                        </Grid>
                    )}

                    <Grid container style={{ justifyContent: 'center' }}>
                        <Grid item xs={10}>
                            <TextField
                                autoComplete="off"
                                inputRef={newEmailRef}
                                className={classes.option}
                                variant="outlined"
                                value={newEmail}
                                error={newEmail === '' ? false : newEmailError}
                                onChange={e => setNewEmail(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') createEmail();
                                }}
                                InputProps={{
                                    className: classes.input
                                }}
                                style={{ width: '100%', textAlign: 'center' }}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <IconButton onClick={createEmail}>
                                <AddIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions style={{ marginTop: 10 }}>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                    >
                        <Grid item>
                            <Button><Link to='/manage' className={classes.link}>
                                Voltar</Link>
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" className={classes.button}
                                onClick={submit}
                                disabled={disabled}
                            >
                                Criar
                        </Button>
                        </Grid>
                    </Grid>
                </CardActions>
            </Card >
        </Grid>
    )
};
