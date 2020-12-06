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

import axios from 'axios';

import isEmail from 'validator/lib/isEmail';
import isEqual from 'lodash.isequal';

import { notify } from '@/store/actions/ui';

import { deleteGroup } from '@/store/actions/items';

import { useSelector, useDispatch } from 'react-redux';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';

import { useRouteMatch, useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
    root: {
        justifyContent: 'center',
        textAlign: 'center',
        marginTop: '5%',
        flexGrow: 1,
        width: 500
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
    }
}));

export default function Group() {
    const { params: { uid } } = useRouteMatch();

    const classes = useStyles();

    const [group, setGroup] = useState(null);

    const token = useSelector(state => state.auth.access);

    const dispatch = useDispatch();

    const router = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try{
                const { data: group } = await axios.get(`/api/groups/get/${uid}`, {
                    headers: {
                        Authorization: `JWT ${token}`
                    }
                });

                setGroup(group);
                setEmails(group.emails);
            }
            catch({ response: { data } }){
                dispatch(notify(data.message, 'error'));
                router.replace('/manage');
            }
        }

        if(!group) fetchData();
    }, [uid, group, token, router, dispatch]);

    const [emails, setEmails] = useState([]);

    const submit = useCallback(async () => {
        try {
            const { data } = await axios.put(`/api/groups/update/${uid}`, { emails }, {
                headers: {
                    Authorization: `JWT ${token}`
                }
            });

            setGroup(group => ({
                ...group,
                emails
            }));

            dispatch(notify(data.message, 'success'));
        }
        catch ({ response: { data } }) {
            dispatch(notify(data.message, 'error'));
        }
    }, [uid, emails, token, dispatch]);

    const submitDelete = useCallback(async () => {
        try {
            const { data } = await axios.delete(`/api/groups/delete/${uid}`, {
                headers: {
                    Authorization: `JWT ${token}`
                }
            });

            dispatch(deleteGroup(Number(uid)));
            dispatch(notify(data.message, 'success'));

            router.replace('/manage');
        }
        catch({ response: { data } }){
            dispatch(notify(data.message), 'error');
        }
    }, [dispatch, uid, router, token]);

    const disabled = useMemo(() => {
        if (!group) return true;

        const a = new Set(emails);
        const b = new Set(group.emails);

        return isEqual(a,b);
    }, [emails, group]);

    // novo email a ser adicionado
    const [newEmail, setNewEmail] = useState('');

    // Estado de erros de validação dos emails
    const [newEmailError, setNewEmailError] = useState(false);

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

    return !group ? <LoadingScreen /> : (
        <div align="center">
            <Card className={classes.root}>
                <CardContent>
                    <Typography variant="h6" display="block" gutterBottom style={{ marginTop: 10 }}>
                        <span style={{marginLeft: '30pt'}}>
                            {group.name}
                        </span>
                        <IconButton style={{ float: 'right', marginTop: '-5pt', color: 'red' }}
                            onClick={submitDelete}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Typography>


                    <Divider style={{ marginBottom: 20, marginTop: 20 }} />
                    <Typography variant="button" display="block" gutterBottom style={{ marginBottom: 20 }}>
                        Emails:
                </Typography>
                    {emails.map((email, index) =>
                        <Grid container key={index} style={{ justifyContent: 'center', marginBottom: 10 }}>
                            <Grid item xs={12} sm={8}>
                                <Paper className={classes.paper}><Typography>{email}</Typography></Paper>
                            </Grid>

                            <Grid item xs={12} sm={1} >
                                <IconButton onClick={
                                    () => deleteEmail(index)
                                }>
                                    <DeleteIcon className={classes.deleteIcon} />
                                </IconButton>
                            </Grid>
                        </Grid>
                    )}

                    <Grid container style={{ justifyContent: 'center' }}>
                        <Grid item xs={8}>
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
                        <Grid item xs={1}>
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
                                Atualizar
                            </Button>
                        </Grid>
                    </Grid>
                </CardActions>
            </Card >
        </div>
    )
};